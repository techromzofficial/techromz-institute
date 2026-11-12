# Safe staging preparation and startup

**Current state: NOT PROVISIONED.** The owner confirmed that staging MariaDB/user, URL, SMTP account, test inboxes, secrets and schedule are not yet available/approved. No live checks, emails, production service calls, database changes or staging startup are authorized now. Only the sanitized template, safety tooling and offline tests have been prepared.

## Private configuration

The proposed private path is `D:\Techromz-Institute\techromz-institute.env.staging.local`. It is outside this repository and was **not created or populated**. This repository cannot track a file outside its root; check any parent repository separately. If a private copy is accidentally placed inside this repository, `.env*.local` and `*.env.staging.local` are now ignored. `.env.staging.example` remains trackable. Git ignore is not encryption: restrict private-file access through the approved local secret-management process. Do not paste values into chat, terminal output, reports or source control.

Use `.env.staging.example` as documentation when the resources have been approved. It has no usable credentials and all five flags are false. A staged configuration must contain an independent database name/user, explicit matching INSTITUTE_TEST_DATABASE_NAME, explicit DB TLS mode, three distinct base64 32-byte keys and an independent 32..256-character random visible-ASCII worker secret. A 64-character random hexadecimal worker secret is supported. Generate the keys using an approved secret store/private-writing workflow equivalent to crypto.randomBytes(32).toString('base64'), and the worker secret with crypto.randomBytes(32).toString('hex'). Do not print them. No real secrets were generated during this preparation.

Independent-from-production keys/accounts cannot be proved merely by their format: the operator must provision and approve them. Do not reuse production credentials or replace existing production encryption/lookup/session keys.

## Clean source and explicit loading

Use a clean isolated staging checkout/copy of the **reviewed current source**, including the uncommitted security and staging changes. An old HEAD/worktree or the previous v6 ZIP does not contain all these changes. Do not copy `.env.local`, `.git`, logs, database dumps or private configuration into a staging source artifact. Review a new source snapshot separately before deployment; no artifact was deployed by this task.

The launcher refuses ambient project `.env`, `.env.local`, development/production/test/staging environment files to prevent Next.js from merging production settings. It reads only the explicit staging file using Node's parseEnv, passes an allowlisted fresh child environment, drops inherited application credentials/NODE_OPTIONS/proxy overrides, and disables telemetry. It does not silently load the active `.env.example` or the ordinary local `.env.local`. No file is deleted or renamed to satisfy this check.

Safe disconnected checks that can be used now:

```powershell
node scripts/institute-staging.mjs --env-file .env.staging.example --check
node scripts/course-enquiry-e2e.mjs --dry-run
```

Template preflight should return **BLOCKED, exit 2**, because credentials and approvals are intentionally missing; the original working tree also has an ambient `.env.local`. The --check mode performs no DNS, HTTP, database, SMTP, key generation, migration or worker execution. A later CONFIGURATION_VALID_NOT_DELIVERY_VERIFIED result validates only syntax/metadata, not credentials, resource isolation, account authorization, TLS connectivity, inbox receipt or management approval.

## Deferred commands: only after resource and test-scope approval

From the reviewed clean staging checkout, load the proposed private file explicitly:

```powershell
node scripts/institute-staging.mjs --env-file 'D:\Techromz-Institute\techromz-institute.env.staging.local' --check
node scripts/institute-staging.mjs --env-file 'D:\Techromz-Institute\techromz-institute.env.staging.local' --build
node scripts/institute-staging.mjs --env-file 'D:\Techromz-Institute\techromz-institute.env.staging.local' --start
```

The local startup binds **127.0.0.1:3118**. It does not provision a public URL, HTTPS ingress or a scheduler. A public staging deployment needs its independently approved hosting setup and platform port; do not use this loopback command as a Hostinger deployment configuration. Retain hostname, Origin, HTTPS and signed-cookie validation. A proxy URL mismatch must be diagnosed; never fix it by trusting arbitrary forwarded protocol/host/IP values.

Keep all five production flags false permanently during this testing work. The four unrelated public staging features (admin, registration, payment, seats) also stay false. Only after approval, enable course enquiry in the **private isolated staging configuration**, restart the staging app, and restore false after testing. The launcher never edits that file or enables the flag automatically.

## Staged database verification

After the database/user/keys are approved, the DB-only modes need no SMTP account or test inbox. They still require a matching isolated database marker, valid independent keys, explicit TLS mode and a clean staging checkout. They refuse the known production database; that guard is a safety check, not proof that an arbitrary host/name is isolated. The provisioner must verify ownership and least-privilege grants.

```powershell
node scripts/institute-staging.mjs --env-file 'D:\Techromz-Institute\techromz-institute.env.staging.local' --db-diagnostic
node scripts/institute-staging.mjs --env-file 'D:\Techromz-Institute\techromz-institute.env.staging.local' --db-tests
```

**Do not run these now.** The read-only diagnostic uses the actual Next.js pool, SELECT 1, identity/version/schema/checksum queries, and writes a private diagnostic report. It now fails rather than reporting a successful test when connection/schema validation is blocked. Its private identity output must not be packaged or published.

The 11-test write suite now uses the actual Next.js pool and checks SELECT 1/schema compatibility before seeding. Its enquiry test is prepared to check a real transaction rollback after INSERT, grant reuse after rollback, concurrent duplicate prevention, a transient outbox failure and subsequent recovery. SMTP is mocked in this suite; it cannot prove inbox receipt. It creates disposable fixture students, registrations, payments, certificates and enquiries. Use a fresh/disposable approved staging schema; do not point it at real records or repeatedly run fixed fixtures against a populated database. The auth test enables admin only within its isolated test process, then restores it; it does not activate the staging/production web server's admin feature. No migrations are automatically run. Apply/check the six tracked migrations only as part of separately approved fresh-staging provisioning, never rerun existing production migrations.

## Approved email journey and notification routing

Provide a staging-authorized SMTP account using the source-supported Hostinger TLS endpoint/port, with From equal to the authenticated mailbox. The current account authorization, password, TLS connectivity and SMTP capacity are unverified. Source TLS remains secure=true, certificate validation enabled and TLS 1.2 minimum. Do not reuse a production SMTP account by assumption or disable certificate checks.

The owner has not confirmed OTP or notification test addresses. Set INSTITUTE_STAGING_TEST_EMAIL and INSTITUTE_STAGING_APPROVED_RECIPIENTS only after approval. The notification recipient must be explicitly set and approved; **blank is not permission to use the app's default**. Current application code only permits notifications to enrolments@techromzit.com. Approve that mailbox for controlled staging messages, or obtain a separately reviewed staging-only routing change if a different test inbox is required. Neither choice has been approved or implemented here.

Once all resources, recipients and the enabled staging enquiry scope are approved:

```powershell
node scripts/institute-staging.mjs --env-file 'D:\Techromz-Institute\techromz-institute.env.staging.local' --enquiry-test
```

The existing interactive HTTP E2E harness now rejects known production origins/databases and unapproved recipients before any connection. It checks migrations/readiness, requests an OTP to the approved test inbox, accepts OTP input without echo, verifies it, submits/retries the same idempotency key, and is prepared to inspect exactly one matching staged row, email lookup hash and course association. It does not invoke a worker or claim notification receipt. No --send/enquiry-test was executed here. Do not redirect interactive tests into shared logs; never record the OTP, cookie, grant, password or worker secret. The legacy standalone SMTP diagnostic pins the enrolments sender/account; do not mistake it for proof of the newly configured staging account.

## Worker, schedule and receipt evidence

Provision a staging-only scheduled HTTPS POST to /api/institute/course-enquiries/delivery using the staging secret in an Authorization: Bearer header from a protected secret store. Never put the secret in a URL, public browser code, command-line argument or log. No scheduler is configured by the repository launcher. Test only a disposable isolated queue containing approved test records/recipients. Do not invoke the production worker.

Record an authenticated manual staging invocation separately from evidence that the actual scheduler ran on time. Inspect pending/failed/notified state and delivery_attempts for the test reference, retry timing, stopped permanent/uncertain outcomes, restart recovery, concurrent claims and replay/idempotency. SMTP acceptedBySmtp and notification_status=notified mean provider acceptance, not confirmed inbox receipt. For uncertain post-DATA outcomes, reconcile the mailbox before any reschedule; do not blindly resend or create another enquiry.

For OTP, diagnostic and notification messages, the authorized inbox reviewer must record received timestamps, message/test references, folder placement and outcome privately. Never copy OTPs, passwords, grants, session cookies or personal contact details into the public report. Actual delivery and receipt remain unverified until those observations exist.

## Browser acceptance

The current repository has Vitest/React DOM tests and an interactive HTTP CLI, but no configured Playwright/Cypress browser runner. The CLI is not a browser suite. Component assertions do not prove desktop/mobile layout, browser console/network behavior or a complete accessibility audit. Once the staging URL, inbox and browser execution method are approved, execute desktop/mobile journeys, required fields/email/OTP errors, expiry/cooldown, quota/idempotency, hidden courses, network failures and keyboard/accessibility checks. No real browser end-to-end success is claimed by this preparation.
