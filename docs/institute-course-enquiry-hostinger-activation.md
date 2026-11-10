# Course enquiry deployment and verification

## Architecture and changed behavior

The existing Next.js App Router API serves React/Tailwind course pages. Public course identity is the catalogue slug (the catalogue has no numeric course IDs). MySQL/MariaDB persists encrypted enquiries, OTP keyed digests, purpose-bound grants, shared abuse limits and delivery state. Nodemailer uses Hostinger implicit TLS on port 465 with certificate validation. Vitest mocks SMTP; normal tests never send real email.

The public local-test simulation has been disconnected: the old flag no longer bypasses SMTP/database verification, OTP codes never appear in public responses, and the old local outbox URL returns 404. The in-memory helper remains solely for existing isolated tests. Production enquiry operation needs the actual backend database and SMTP settings. Course registration and enrolment remain separate operations.

Existing routes are extended, not duplicated:

- POST `/api/institute/contact-verification/challenge`: initial OTP or resend, distinguished by the existing browser session.
- POST `/api/institute/contact-verification/verify`: OTP verification.
- GET/POST `/api/institute/course-enquiries`: readiness and enquiry acceptance.
- POST `/api/institute/course-enquiries/delivery`: authenticated scheduled delivery worker.

## Environment and migration

Preserve existing environment variables and configure server-only values using deployment secrets. Do not send secrets in chat, browser storage, URLs or Git. See `.env.example`.

Required mail settings:

```dotenv
INSTITUTE_SMTP_HOST=smtp.hostinger.com
INSTITUTE_SMTP_PORT=465
INSTITUTE_SMTP_SECURE=true
INSTITUTE_SMTP_USER=your-mailbox@your-domain.com
INSTITUTE_SMTP_PASSWORD=YOUR_MAILBOX_PASSWORD
INSTITUTE_SMTP_FROM=your-mailbox@your-domain.com
ENQUIRY_RECIPIENT_EMAIL=enrolments@techromzit.com
INSTITUTE_ENQUIRY_WORKER_SECRET=RANDOM_SECRET_AT_LEAST_32_CHARACTERS
```

`FROM` must equal the complete authenticated mailbox. The recipient is fixed to `enrolments@techromzit.com`; any different `ENQUIRY_RECIPIENT_EMAIL` fails closed. Legacy `ADMIN_EMAIL` does not affect this workflow. Mail uses the verified student address as Reply-To. Port 587 is not automatically attempted; diagnose DNS, outbound connectivity, TLS certificates and authentication on 465 instead of disabling TLS.

Also configure `INSTITUTE_DB_*`, the three independent base64-encoded 32-byte keys (`INSTITUTE_PII_ENCRYPTION_KEY`, `INSTITUTE_PII_LOOKUP_KEY`, `INSTITUTE_SESSION_HASH_KEY`), `INSTITUTE_ALLOWED_HOSTS`, and `INSTITUTE_ABUSE_PROTECTION_MODE=identifier-and-global`. Keep these keys stable across instances and restarts. Back up keys securely with the encrypted database.

For production, set `INSTITUTE_TRUSTED_CLIENT_IP_HEADER` to a header containing one client IP that your ingress **overwrites**, and block direct backend access. Do not blindly use a client-provided X-Forwarded-For chain. Requests fail closed when a configured trusted header is missing or malformed; production also requires this setting. Development without a trusted ingress uses email/global limits. Verify header behavior on the actual host before enabling.

Load deployment variables into the command environment, back up the database, then run:

```sh
npm run db:migrate:institute
npm run db:status:institute
```

The migration runner uses checksums and an advisory lock. Migration `006_institute_enquiry_delivery.sql` extends existing tables; earlier migrations are unchanged. It adds browser-session binding, course IDs, encrypted subjects, request fingerprints, delivery attempts, leases, retry scheduling and safe error categories. It increases message storage for up to 4,000 Unicode characters. It creates a per-contact OTP issuance lock table. Use MySQL 8+ or MariaDB 10.6+ for `FOR UPDATE SKIP LOCKED` in the worker. Confirm the project's existing MariaDB-compatible `ADD COLUMN IF NOT EXISTS` migration syntax against your chosen database version before deployment.

Old enquiry records are retained and excluded from automatic delivery until reconciled (`course_id IS NULL`, `next_delivery_at IS NULL`). Do not retry old records blindly. Existing outstanding OTPs use the previous digest format and should be reissued after this release; stored registration records are retained.

After migrations, configure the worker, then set `INSTITUTE_COURSE_ENQUIRY_ENABLED=true` and restart/redeploy the Next.js backend. Leave unrelated feature flags as configured. The readiness endpoint requires SMTP configuration, migrated storage, a worker secret and production trusted-IP configuration; it does not establish a live SMTP connection or prove the scheduler is running.

## Scheduled delivery worker

Configure the host's scheduler to POST every minute to:

`https://YOUR_HOST/api/institute/course-enquiries/delivery`

Send `Authorization: Bearer <INSTITUTE_ENQUIRY_WORKER_SECRET>` from the scheduler's secret store, never in the URL. The route returns 401 before touching mail or the database for an invalid credential. Use HTTPS, a runtime timeout of 300 seconds, and monitor non-2xx results. Each invocation claims at most five due records. Multiple invocations/instances can safely run concurrently using database row locks and claim IDs.

Records use existing statuses `pending`, `sending`, `notified` (SMTP accepted), `notification_failed`. The worker increments attempts before sending and records safe categories only. It retries transient 4xx replies and pre-connection failures up to five total attempts with delays of 60, 120, 240 and 480 seconds. Authentication and permanent rejection stop immediately. No enquiry content, SMTP credentials or OTPs are logged.

A post-DATA disconnect, unknown error, or interrupted lease can mean the SMTP server already accepted the message. These outcomes stop automatic retries for reconciliation; leases older than five minutes become `notification_failed` with category `interrupted_uncertain`. The same stable Message-ID is used for an enquiry, but SMTP has no transactional exactly-once guarantee. A crash between SMTP acceptance and the DB update cannot prove inbox delivery or safely guarantee a resend will be unique. Check provider logs and the enrolments mailbox before manually scheduling a retry. After fixing a known permanent issue, an operator may schedule a reviewed failed record with `next_delivery_at=UTC_TIMESTAMP(6)` while preserving the bounded attempt limit. Do not reset or resend `notified` records.

Monitor status, delivery_attempts, delivery_error_category, notified_at, and oldest pending age. Restrict database and log access; apply the organisation's retention policy to PII and expired OTP lock rows. The API confirmation means the enquiry and its delivery work were saved atomically; email is sent by the scheduled worker. SMTP acceptance is not proof of inbox placement.

## Verification and abuse rules

Codes are cryptographically random six-digit values, valid for five minutes, and checked with keyed digests and timing-safe comparison. Each challenge allows at most five incorrect attempts. Issuance is serialized per email across instances; resend cooldown is 60 seconds and the rolling 15-minute cap is four total issues (initial plus three resends). New issuance invalidates older codes. Additional per-email, per-IP, global and mailbox limits apply. Grants expire after 15 minutes and are consumed atomically with enquiry persistence. Requests must match the email, purpose and HTTP-only SameSite browser session. A changed email clears UI verification, including stale in-flight results. No localStorage verification flag is trusted. Origin/host/fetch-site checks protect public writes; JSON bodies are bounded to 32 KiB.

The server resolves the course title from its published catalogue slug. It rejects malformed input, oversize content, header injection and invalid grants. Enquiry PII and subject are encrypted. Same-session idempotency keys return an existing record for matching content and reject changed content, preventing duplicate acceptance after a response is lost.

## Automated and manual checks

```sh
npm run type-check
npm run lint
npm test
npm run build
npm run enquiry:e2e -- --dry-run
npm run smtp:diagnostic -- --dry-run
```

The normal suite uses mocked SMTP. To explicitly enable one live diagnostic, use `npm run smtp:diagnostic -- --send` in an interactive authorized staging terminal; the existing tool requests the mailbox password without echoing it. Run it from the deployed backend network when diagnosing connectivity. The tool does not put passwords in command arguments. The legacy diagnostic is fixed to the enrolments@techromzit.com sender; use the full enquiry flow to validate another configured authenticated mailbox. See `institute-smtp-smoke-test.md` for diagnostic details.

For an explicitly enabled full staging flow, run `npm run enquiry:e2e -- --send`. It checks migrations/readiness, asks for authorization and the emailed OTP, preserves the HTTP-only session cookie, and saves one test enquiry. Run the scheduler/worker, inspect database status, and manually confirm inbox/spam receipt at enrolments@techromzit.com. Do not claim this live check passed until it has actually run.

In the browser:

1. Open a course, choose Email enquiry and check the selected course.
2. Enter name/email, select Verify Email, check mailbox, and submit the OTP. Verify Email Verified is displayed.
3. Enter a subject and message, then Send enquiry. Confirm saved/queued confirmation and disabled repeat submission.
4. Try wrong/expired OTPs, five wrong attempts, early resend, and more than three resends in 15 minutes.
5. Change email during and after verification: submission must disable and stale replies must not verify the new address.
6. Replay the same submission reference; confirm only one row/email. Tamper course ID, email or grant; confirm rejection. A forged title with a valid ID must use the server title.
7. Stop SMTP after verification: the enquiry must remain stored; exercise the worker's transient retry path. Authentication failure must stop retries and preserve a safe category.
8. Check keyboard focus, Escape/close behavior, mobile scrolling, and the existing registration/WhatsApp paths.

Hostinger hPanel: confirm the mailbox is active, the full username/password are correct, DNS/MX are configured, SPF permits Hostinger, DKIM signing is enabled and validated, and DMARC aligns with the From domain. Check spam/bounce reports and quotas. Official references: [Hostinger configuration](https://support.hostinger.com/en/articles/1575756-how-to-get-email-account-configuration-details-for-hostinger-email), [Nodemailer SMTP results](https://nodemailer.com/), [Nodemailer errors](https://nodemailer.com/errors).

## Deployment limits in this checkout

The local settings do not contain an SMTP password, database credentials, the three encryption/hash keys, or a worker secret. This work does not provision external accounts, apply a live migration, configure a host scheduler, alter DNS, or prove delivery. Supply secrets on the host and complete the live staging checks before production activation. Optional student acknowledgement email is not enabled; the accepted enquiry itself remains the authoritative record.

## Validation record (10 November 2026)

- TypeScript checking passed.
- ESLint passed with no errors or warnings.
- Production Next.js build passed, including 162 generated pages. The isolated build output was removed and Next.js's temporary type-path changes were restored.
- All 44 focused enquiry/security tests passed with mocked SMTP.
- The initial broad run passed 520 tests, reported three failures, and could not start seven workers. Migration and closed-dropdown test assertions were corrected; the interrupted files were rerun with one thread worker and 30-second test timeouts. That rerun passed 93 tests and skipped 11 explicitly opt-in MariaDB tests. Its remaining course enquiry fixture was updated to include the new course ID and rerun separately: all 12 tests passed. All reported assertion failures are resolved; the database integration suite remains explicitly skipped.
- The enquiry command's disconnected dry run passed and reported the fixed enrolments recipient with no mail sent.
- Live database migration/concurrency and SMTP delivery were not exercised because deployment credentials are missing. Visual browser inspection stopped because the computer-use tool could not verify the browser URL reliably.

For Windows worker-startup limitations, use `npx vitest run --pool=threads --maxWorkers=1 --testTimeout=30000` when rerunning locally. Existing React test warnings about image/SVG mock attributes do not indicate mail delivery.

## Modified and added files

```text
.env.example
database/migrations/006_institute_enquiry_delivery.sql
docs/institute-course-enquiry-hostinger-activation.md
scripts/course-enquiry-e2e.mjs
src/app/api/institute/contact-verification/challenge/route.ts
src/app/api/institute/contact-verification/verify/route.ts
src/app/api/institute/course-enquiries/delivery/route.ts
src/app/api/institute/course-enquiries/local-outbox/route.ts
src/app/api/institute/course-enquiries/route.ts
src/app/institute/courses/[slug]/page.tsx
src/features/education/administration/contactVerification.ts
src/features/education/administration/courseEnquiry.ts
src/features/education/administration/courseEnquiryDelivery.ts
src/features/education/administration/courseEnquiryStore.ts
src/features/education/administration/enquirySession.ts
src/features/education/administration/http.ts
src/features/education/administration/localCourseEnquiry.ts
src/features/education/administration/requestSecurity.ts
src/features/education/administration/smtp.ts
src/features/education/administration/smtpRuntime.d.mts
src/features/education/administration/smtpRuntime.mjs
src/features/education/components/CourseEnquiryButton.tsx
src/features/education/components/EnquiryUnavailable.tsx
src/features/education/components/PlannedCourseExperience.tsx
src/tests/course-enquiry-activation.test.ts
src/tests/course-enquiry-delivery.test.ts
src/tests/course-enquiry-otp-lifecycle.test.ts
src/tests/course-enquiry-route.test.ts
src/tests/course-enquiry-secure-workflow.test.ts
src/tests/course-enquiry.test.tsx
src/tests/education-preview.test.tsx
src/tests/institute-contact-verification-route.test.ts
src/tests/institute-enrolment-contact.test.tsx
src/tests/institute-mariadb-integration.test.ts
src/tests/institute-phase2.test.ts
src/tests/institute-proxy-security.test.ts
src/tests/institute-security-remediation.test.ts
src/tests/local-course-enquiry.test.ts
```
