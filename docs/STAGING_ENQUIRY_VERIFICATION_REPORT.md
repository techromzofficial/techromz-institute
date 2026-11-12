# Techromz Institute staged enquiry verification

Date: 2026-11-11. Status: **PREPARED OFFLINE; NOT READY FOR PRODUCTION ACTIVATION.**

The owner explicitly confirmed that isolated staging services, credentials, URL and approved test mailboxes do not yet exist or are unconfirmed. This task therefore prepared safe tooling and ran offline checks. It did not connect to production, provision a private secret file, generate real keys, change a database, send email, invoke a production worker, deploy, or activate a live feature. Prior signed-cookie, primary email/session/global rate-limit and unverified-IP security improvements are retained.

## Verification outcomes

| Required evidence | Actual result |
|---|---|
| MariaDB connection through actual Next.js pool and SELECT 1 | NOT RUN: approved isolated database/user/keys/TLS/schema unavailable. Integration and diagnostic tests now use the actual application pool, but that source change is not connection evidence. |
| Database compatibility, enquiry tables, concurrency, abuse storage, rollback/recovery | NOT RUN against MariaDB. Tests prepared; all 11 opt-in SQL tests remain skipped. No migrations executed. |
| Real SMTP connection, TLS handshake, authentication, approved message | NOT RUN: staging SMTP account/password and recipient approval unavailable. Secure source settings and mock failure handling are covered offline. |
| Actual mailbox receipt | NOT VERIFIED for OTP or notification. Provider acceptance is not inbox receipt. |
| OTP generation, expiry, attempts, replay and verification | Offline service/route tests only. No OTP generated for or received by a real staging inbox. |
| Enquiry persistence, association and duplicate prevention | Offline repository/route/UI coverage only; actual staged row/readback and concurrent SQL checks remain unverified. |
| Notification queuing, retry and failed/uncertain outcomes | Offline mocked coverage only. Real staged pending-to-notified progression and recipient receipt are unverified. |
| Scheduled delivery worker | Authentication covered offline; actual staging secret, endpoint invocation, pending processing, retry and scheduler execution NOT RUN. No scheduler provisioned. |
| Desktop/mobile browser journey and accessibility | NOT RUN. Existing Vitest React DOM assertions and HTTP CLI are not browser E2E. No Playwright/Cypress runner is configured. |
| Production state | Local templates retain all five flags false. Hostinger live environment was not accessed or changed, so its current settings are not independently attested. |

## Environment readiness

| Settings | Current state / dependency |
|---|---|
| All five INSTITUTE_*_ENABLED feature flags | False in both documented templates; no live configuration accessed or changed. |
| INSTITUTE_ABUSE_PROTECTION_MODE, INSTITUTE_ONLY_MODE, INSTITUTE_ALLOW_INDEXING | Safe staging values documented: identifier-and-global, true, false. |
| INSTITUTE_DB_CONNECTION_LIMIT, INSTITUTE_SECURITY_DIAGNOSTICS, OTP_* | Documented defaults 5, false, and 5 minutes / 5 attempts / 60-second cooldown. Offline parsing tests cover secure defaults. |
| INSTITUTE_DB_HOST/NAME/USER/PASSWORD/SSL, INSTITUTE_TEST_DATABASE_NAME | Missing approved isolated resources; TLS mode must be explicitly confirmed for the staging DB. Port defaults to 3306, not connectivity evidence. |
| INSTITUTE_SESSION_HASH_KEY, INSTITUTE_PII_LOOKUP_KEY, INSTITUTE_PII_ENCRYPTION_KEY | Missing independent staged keys. Canonical base64 encoding of 32 random bytes each; all distinct. |
| INSTITUTE_ENQUIRY_WORKER_SECRET | Missing independent staged secret and matching authorized scheduler configuration. |
| NEXT_PUBLIC_APP_URL, INSTITUTE_ALLOWED_HOSTS | Missing dedicated approved nonproduction HTTPS origin and matching hostnames. Production URL is not staging. |
| SMTP_HOST/PORT/SECURE | Source-supported public settings documented: smtp.hostinger.com / 465 / true; real TLS connection not tested. |
| SMTP_USER/PASS/FROM_EMAIL | Missing approved staging account/credentials; From must match the account. Legacy INSTITUTE_SMTP_* compatibility remains in application code; the dedicated staging file uses standard SMTP_* only. |
| ENQUIRY_RECIPIENT_EMAIL, INSTITUTE_STAGING_TEST_EMAIL, INSTITUTE_STAGING_APPROVED_RECIPIENTS | Recipient approvals/addresses missing. Fixed enrolments routing requires the explicit decision described above. |
| INSTITUTE_TRUSTED_CLIENT_IP_HEADER | Optional, blank in staging template. Hostinger's recommended X-Real-IP does not authenticate the proxy/origin path; do not use it as the primary quota identifier. |
| INSTITUTE_MARIADB_INTEGRATION, INSTITUTE_READ_ONLY_DIAGNOSTIC | False. Explicit launcher modes are deferred until isolated resources and test scope are approved. |

These are source/template and local readiness findings, not an audit of the 31 values configured in Hostinger. No remote environment values were read.

## Implementation prepared

- Added `.env.staging.example` with placeholders, source-supported TLS settings, explicit isolated database marker and approved-recipient metadata; all five feature flags false.
- Extended `.gitignore` for private staging-file patterns while keeping the sanitized template trackable. The proposed private file outside this repository was not created.
- Added `scripts/institute-staging.mjs` and pure configuration validation. Explicit file loading, allowlisted child environment and refusal of ambient project env files prevent silent `.env.local` credential mixing. Disconnected preflight refuses known production origin/database names, missing isolation markers, malformed or reused keys, unsafe modes/TLS and missing recipient approval. These guards cannot prove resource ownership or independent provisioning.
- Prepared separate DB-only modes, without SMTP prerequisites, and deferred build/start/interactive enquiry modes. No mode silently changes feature flags or applies migrations.
- Changed opt-in MariaDB tests to use the actual Next.js database pool, SELECT 1 and storage readiness before fixture writes. Extended the existing enquiry test with real rollback injection, concurrent same-key retries and transient outbox-failure recovery. These tests remain unexecuted without the approved disposable database.
- Removed ambient env loading from the opt-in read-only diagnostic; require the isolated marker and make blocked/schema/connection failure fail explicitly rather than appear green.
- Hardened the existing interactive HTTP enquiry harness with staging/recipient preflight, hidden OTP input, a stable idempotency-key retry and exact staged row/course/email-hash readback. It does not invoke the worker or assert inbox receipt. No send mode was executed.
- Added offline regressions for staging validation, inherited-secret isolation, blocked execution and hidden terminal input. No production request-security or proxy-trust rule was relaxed.

## Executed validation

- TypeScript type check: PASS (exit 0).
- Lint: PASS (exit 0; Next.js emits its existing `next lint` deprecation notice).
- Production build: PASS (exit 0) with all five flags false.
- Full offline Vitest attempt: 670 passed, 1 failed by the five-second timeout in the disconnected catalogue-validation spawn, 12 skipped. After raising that single test's timeout to 15 seconds, the focused provisioning file passed 4/4. The complete suite has **not** been rerun after this adjustment; report the timeout transparently.
- Local built-server HTTP smoke: PASS, 61/61 after waiting for the server readiness signal: seven department pages, 37 published course routes, seven unpublished routes (404), verification page, enquiry readiness, disabled write APIs and unauthenticated worker rejection. HTTP only; no browser rendering.
- Staging template preflight: expected BLOCKED, exit 2, zero network/database/email attempts.
- Enquiry CLI dry-run: PASS; it sent nothing.
- ZIP integrity/manifest/extracted file comparison: PASS; runtime from extracted tree NOT RUN.
- `git diff --check`: PASS (only line-ending conversion warnings).

The sanitized-template preflight intentionally returns BLOCKED / exit 2, with no network/database/email attempt. This is expected safety behavior and is not a successful staging connectivity test. Its issues include missing resources/approvals and the existing ambient `.env.local`; the launcher leaves that file untouched. Do not remove or rename private configuration merely to bypass the guard.

The local toolchain is Node 22.20.0 and npm 10.9.3. The project declares npm 10.9.8; installed jsdom 30.0.1 requires a newer supported Node 22 patch (at least 22.22.2). Align the approved staging/build toolchain with declared dependency engines before release. No dependencies or tools were upgraded during offline work.

All 12 skipped tests, their exact names, dependencies and readiness impact are documented in [STAGING_SKIPPED_TESTS.md](STAGING_SKIPPED_TESTS.md). Critical database skips are blockers, not passes. Browser, actual SMTP, receipt and scheduler checks are separate NOT RUN items, not silently counted as skipped/passing unit tests.

## Exact prerequisites and next steps

1. Provision and approve a dedicated staging MariaDB host, database and least-privilege user. Supply connection credentials privately, confirm certificate/TLS requirements, confirm ownership/isolation from production, and approve fresh disposable schema provisioning with the six tracked migrations. Use an exact matching INSTITUTE_TEST_DATABASE_NAME. No provisioning/migration has been performed here.
2. Supply three independent canonical base64 keys (32 random bytes each), an independent random visible-ASCII worker secret of 32..256 characters, a dedicated nonproduction HTTPS origin, matching allowed hosts and an authorized staging schedule. Populate only the proposed private file through an approved secure process; no values in chat/logs/Git.
3. Approve the staging SMTP account, matching sender, password, approved OTP test inbox, notification test inbox and authorized inbox reviewer. Current source locks notifications to enrolments@techromzit.com. Approve that specific mailbox for controlled staging messages or obtain a separately reviewed staging-only routing change. Blank recipient configuration is not approval. Do not assume production SMTP can be reused.
4. Prepare a clean isolated checkout of the reviewed current source with no ambient private project env files. Follow [STAGING_STARTUP_GUIDE.md](STAGING_STARTUP_GUIDE.md) for explicit-file preflight, deferred diagnostic and integration commands. First prove actual pool SELECT 1/schema, then run all relevant SQL tests including rollback, concurrent counters and enquiry/outbox recovery.
5. After approval of the enabled staged enquiry scope, enable only the private isolated staging enquiry flag. Keep other staging flags and all production flags false. Run the controlled journey, confirm actual OTP inbox receipt, verification, one staged row with the correct course, stable-key duplicate prevention and accurate saved/queued confirmation.
6. Test the staging worker with a protected Authorization header and a separate secret; exercise unauthorized requests, pending notifications, transient/permanent/uncertain failure handling, concurrent/repeated invocation and logging without secrets. Verify actual scheduler execution separately from manual worker invocation. Confirm notification receipt in the approved inbox and record private timestamps/test references without OTPs or personal data.
7. Establish the browser execution method and run desktop/mobile, validation/error/OTP/cooldown/quota/retry/hidden-course/network cases and keyboard/accessibility checks. Retain actual browser evidence separately from DOM/HTTP results. Re-run lint, type checks, tests and build on the reviewed staging source/toolchain.
8. Present sanitized evidence and remaining risks to management for production-activation approval. Deployment and production flag changes require that subsequent approval and were not performed.

## Remaining guarantees and risks

Hostinger origin isolation and authenticated proxy identity remain unproven. X-Real-IP is only an optional unverified supplementary hint; primary shared email/session/global protection must remain independent of it. Keep hostname, Origin, HTTPS, signed session and fail-closed database checks intact. Global quotas can still be exhausted by an attacker, affecting availability; they are not proof of a human user or a network-edge firewall.

No system can infer separate ownership from an environment name or key format. The explicit marker and known-production denylist reduce mistakes but do not replace operator verification of the actual database, account, URL and recipients. Mock tests cannot establish MariaDB concurrency behavior, actual TLS/account authorization, scheduled execution or mailbox delivery. SMTP uncertain outcomes require reconciliation before retry to avoid possible duplicate mail.

This work is reviewable local preparation. The enquiry system must not be described as fully operational until actual isolated database persistence and approved mailbox receipt have been verified.
