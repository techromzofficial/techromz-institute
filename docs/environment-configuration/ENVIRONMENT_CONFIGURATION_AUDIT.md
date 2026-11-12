> Current proxy/IP policy: see [HOSTINGER_PROXY_ABUSE_PROTECTION.md](../HOSTINGER_PROXY_ABUSE_PROTECTION.md). Older trusted-header prerequisites below are historical and superseded; IP headers are now optional unverified supplementary hints.

# Environment configuration audit ? 11 November 2026

This audit concerns the current local branch. Hostinger's 31 configured names and their hidden values were not accessed. A variable being present in hPanel does not prove its runtime value or availability. No production environment, deployment, database record or feature activation was changed. Existing v6 ZIP and validation artifacts were preserved and are not updated by these source changes.

## Current status

| Area | Local/source result | Hostinger / staging action |
|---|---|---|
| Five live feature flags | Exact `true` only; absent/empty/false/TRUE/1/yes stay disabled. Local settings and template are disabled. | Keep all five false; deployed values remain unverified. |
| Worker authentication | Shared readiness/auth checks, timing-safe comparison, 401 before DB/mail work for missing/wrong credentials. Valid credentials with disabled feature return 503. | Supply a random server-only secret and an authenticated scheduler only after approved staging setup. |
| Worker secret | Missing locally. New validator accepts 32..256 visible ASCII characters with no whitespace/control characters. | Generate securely, e.g. 64 random hex characters; do not use example strings. Configure scheduler Authorization header, never URL/cookie/client JS. Existing secrets containing whitespace/Unicode or over 256 characters now fail closed. |
| Trusted client IP | Missing locally; no automatic forwarded-header fallback. Production enquiry/OTP writes require an explicit header and reject absent/invalid/list values. Identifier and global buckets remain. | Confirm actual ingress behavior before setting a header name. |
| SMTP | OTP and enquiry notification functions use the same server-only readInstituteSmtpConfig and TLS transport. Primary SMTP_* not populated locally; legacy endpoint/user/from settings alone are insufficient because password is missing. | Confirm approved mailbox, credential, matching sender, actual Hostinger endpoint and allowed test recipients privately. |
| Legacy SMTP aliases | All six INSTITUTE_SMTP_* aliases remain supported; conflicting paired values fail closed, including explicitly empty primary overrides. | Use one complete naming scheme or exactly matching pairs. Do not remove working compatibility settings blindly. |
| DB pool | Default limit 5, allowed 1..20, queue 50, 10-second connect timeout, UTC/utf8mb4. Local host/name/user/password missing. | Inject isolated DB credentials and independent test keys for actual tests. Do not reuse production DB or keys. |
| DB CLI readers | Migration CLI now uses the same validated helper as provisioning/status, retaining certificate validation and rejecting invalid SSL values. | No migration was run. Production applied migrations must not be rerun. |
| Security diagnostics | Disabled by default; only exact true logs fixed certificate failure codes. | Keep false; enable temporarily only for authorized private diagnosis. |
| OTP policy | Default expiry 5 minutes, attempts 5, cooldown 60 seconds; bounded integers. Readiness/submission now also fail closed when policy is invalid. | Confirm desired valid values, not blank strings. |
| Real DB/SMTP/end-to-end test | BLOCKED: isolated database confirmation, usable secrets/passwords and approved test mailbox scope are not available. | Supply a secure staged configuration and receipt confirmation; no production writes or emails are authorized by this audit. |

## What remains to configure

Missing locally: INSTITUTE_DB_HOST, INSTITUTE_DB_NAME, INSTITUTE_DB_USER, INSTITUTE_DB_PASSWORD; all three INSTITUTE_* security keys; a usable complete SMTP naming scheme including SMTP_PASS or INSTITUTE_SMTP_PASSWORD; INSTITUTE_ENQUIRY_WORKER_SECRET; INSTITUTE_TRUSTED_CLIENT_IP_HEADER. INSTITUTE_TEST_DATABASE_NAME is not configured, so write integration tests must remain skipped. This list describes the local process, not missing Hostinger variables.

Source configuration contracts are ready for the five disabled feature flags, the DB connection-limit default, diagnostics default, OTP defaults, shared SMTP aliases and authenticated worker rejection paths. The new .env.example intentionally contains no usable credentials. It is a template and is not loaded automatically by Next.js. Do not paste it over an existing production environment or replace existing encryption/lookup keys.

## Hostinger ingress confirmation required

Obtain explicit confirmation of (1) exact single-client-IP header name, (2) unconditional overwrite/removal of caller-supplied values, (3) how direct origin/backend access is prevented, (4) single IPv4/IPv6 formatting rather than a comma-separated proxy chain, and (5) public HTTPS termination, preserved Host/Origin and the actual Next.js request URL behavior. NextRequest provides no independent socket-peer proof. Configuring a header is an operator trust assertion; application validation cannot prove that the proxy is trusted. Never guess X-Forwarded-For, pick its first element, or trust a header merely because it exists.

The worker uses a separate Bearer credential because scheduled server requests do not carry a browser session/Origin. Its secret does not grant access to staff APIs or enable features. Cron must use public HTTPS and a protected secret store. A configured worker secret alone does not create a scheduler or prove successful notification delivery. SMTP acceptance is not inbox receipt.

## SMTP consistency

`administration/smtp.ts` reads SMTP_HOST/PORT/SECURE/USER/PASS/FROM_EMAIL with INSTITUTE_SMTP_HOST/PORT/SECURE/USER/PASSWORD/FROM aliases. Nullish primary precedence remains, with exact paired-value conflict detection. Both `getSmtpEmailDelivery` (OTP) and `getCourseEnquiryDelivery` (notifications) call this reader. Both construct the same smtpRuntime.mjs TLS transport: smtp.hostinger.com, port 465, secure=true, rejectUnauthorized=true, minimum TLS 1.2, timeouts 10/10/15 seconds and logging/debug off. No other endpoint is silently substituted. This is the source-supported endpoint, not an independent verification of this Hostinger account.

The standalone interactive SMTP diagnostic shares the TLS transport but asks for an operator-approved recipient/password for the fixed mailbox; it does not read the full runtime environment and cannot prove that the deployed app receives correct aliases. The course enquiry E2E CLI calls the real APIs and requires explicit interactive mailbox confirmation. Neither command was used to send email in this audit. Notification recipient is fixed to enrolments@techromzit.com; approved staging delivery to that mailbox must be explicitly scoped. Do not change the recipient to bypass that restriction.

## Values and evaluation

| Setting | Accepted contract / default | Evaluation |
|---|---|---|
| INSTITUTE_COURSE_ENQUIRY_ENABLED, INSTITUTE_ADMIN_ENABLED, INSTITUTE_REGISTRATION_ENABLED, INSTITUTE_PAYMENT_ENABLED, INSTITUTE_SEAT_AVAILABILITY_ENABLED | Exact true activates; default disabled | Runtime, each operation |
| INSTITUTE_ALLOWED_HOSTS | Comma-separated exact hostnames, no URLs/ports/wildcards | Runtime guards |
| INSTITUTE_ABUSE_PROTECTION_MODE | Only identifier-and-global enables protected operations | Runtime |
| INSTITUTE_SESSION_HASH_KEY, INSTITUTE_PII_LOOKUP_KEY, INSTITUTE_PII_ENCRYPTION_KEY | Independent base64 32-byte keys | Runtime crypto; preserve existing production values |
| INSTITUTE_DB_HOST/PORT/NAME/USER/PASSWORD | Required server-only connection settings; TCP port 1..65535 | Lazy pool creation, then cached; restart after changes |
| INSTITUTE_DB_SSL | true/false case-insensitive; absent/empty false | Pool/CLI creation; true validates server certificate |
| INSTITUTE_DB_CONNECTION_LIMIT | Integer 1..20; absent/empty 5 | Pool creation |
| SMTP_* / INSTITUTE_SMTP_* | Endpoint/implicit TLS above; From=authenticated mailbox; password nonempty | Runtime server-only reader/transport creation |
| ENQUIRY_RECIPIENT_EMAIL | Blank/omitted uses fixed enrolments address; other destination rejected | Runtime |
| OTP_EXPIRY_MINUTES | Integer 1..10, absent 5 | Runtime |
| OTP_MAX_ATTEMPTS | Integer 1..5, absent 5 | Runtime |
| OTP_RESEND_COOLDOWN_SECONDS | Integer 60..900, absent 60 | Runtime/API metadata |
| INSTITUTE_ENQUIRY_WORKER_SECRET | Random visible ASCII 32..256, no whitespace; absent invalid | Runtime readiness and worker auth |
| INSTITUTE_TRUSTED_CLIENT_IP_HEADER | Explicit validated header name; no default trust | Runtime, production enquiry/OTP writes |
| INSTITUTE_SECURITY_DIAGNOSTICS | Only exact true; default off | Runtime, fixed failure codes only |
| INSTITUTE_ONLY_MODE | Any value except exact false keeps Institute-only behavior | Build rewrites/middleware/module initialization; rebuild and restart consistently |
| NEXT_PUBLIC_APP_URL | Canonical public URL; template uses an example domain | Build/client bundle and static metadata; rebuild when changed |
| INSTITUTE_ALLOW_INDEXING | Only exact true plus valid Institute HTTPS origin permits indexing; default false | Module initialization/static build metadata |
| INSTITUTE_DEV_ALLOWED_ORIGINS | Comma-separated development hostnames | Development config only, never proxy trust |
| NEXT_DIST_DIR | Optional Next build directory, default .next | Build/start configuration; keep consistent |
| NODE_ENV | Managed by Next.js/host | Build/runtime; do not force development in production |
| NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_API_URL | Browser API base / legacy fallback; default /api | Client bundle build |
| BACKEND_API_URL | Legacy server rewrite target only in Retail mode | Build rewrites; not an Institute DB/SMTP dependency |
| NEXT_PUBLIC_AUTH_COOKIE | Legacy cookie name, default _el_tok | Client build/middleware initialization; Institute staff session uses its own fixed cookie names |
| NEXT_PUBLIC_USE_ADMIN_MOCKS | Exact true enables legacy admin fixtures; template false | Client build; unrelated to Institute staff auth |
| NEXT_PUBLIC_PUSHER_KEY/CLUSTER | Preserved optional template compatibility settings; no direct reads found in current source | Not required for Institute enquiries |
| INSTITUTE_COURSE_ENQUIRY_LOCAL_TEST_MODE | Disconnected non-production fixture only | Test/local helper; no real DB/email proof |
| INSTITUTE_MARIADB_INTEGRATION / INSTITUTE_TEST_DATABASE_NAME | CLI/test opt-in and explicit isolated DB confirmation; suite refuses named production database | Tests only; never enable against production |
| INSTITUTE_READ_ONLY_DIAGNOSTIC | Explicit operator-only test command; default skipped | CLI/test only; private output excluded from deployment ZIP |

Inventory with source paths and line references: environment-variable-inventory.json. Relevant automated results: deployment-output/environment-audit/. Final verification results follow below. Mocked tests never substitute for real DB and inbox receipt.


## Final executed verification

| Check | Result | Evidence under deployment-output/environment-audit/ |
|---|---|---|
| Type checks | PASS, exit 0 | type-check.log / type-check-result.json |
| Lint | PASS, exit 0 | lint.log / lint-result.json |
| Production build with all five live flags false | PASS, exit 0 | build.log / build-result.json |
| Final complete targeted test run | PASS: 99 tests across 13 files, exit 0 | tests-final.log / tests-final-result.json |
| Worker/configuration batch | PASS: 21 tests, included in the 99 above | controls-tests.json |
| Actual isolated MariaDB persistence/concurrency | BLOCKED: no isolated DB credentials/confirmation | No write test executed |
| Actual SMTP authentication, OTP and notification inbox receipt | BLOCKED: no usable SMTP password or approved mailbox scope | No real email sent |
| Hostinger runtime/ingress | NOT RUN | No authenticated hosting session supplied |

The first JSON-only test command exited 1 while listing 78 passing assertions and omitting two requested files. It was treated as incomplete. The complete verbose rerun executed all 13 files and passed 99 tests with exit 0. No cause for the initial process discrepancy was confirmed.

Coverage includes all five strict flag defaults, omitted/empty DB limit default 5, invalid limits, diagnostics off by default, bounded OTP policy, spoofed forwarded headers, single-IP parsing, worker credential rejection before DB/mail, valid authenticated dispatch with doubles, disabled delivery, SMTP aliases/TLS, encrypted persistence/idempotency/outbox fixtures, and the enquiry form's OTP/error behavior. No unit test is claimed as real DB or inbox evidence.

Implementation changes: shared enquiryWorkerAuth.ts validates readiness and performs timing-safe Bearer authentication; the delivery route checks the feature flag before SMTP/database work; enquiry readiness/submission rejects invalid worker/OTP policy; migration CLI reuses the existing validated DB helper. SQL migrations were not edited or run. No .env.local, production password or key was written.

Toolchain: local Node 22.20.0 and npm 10.9.3. Installed jsdom declares ^22.22.2 within Node 22; packageManager declares npm 10.9.8. Align a supported staging toolchain and repeat acceptance. Passing local tests are empirical evidence, not a compatibility guarantee. Next lint/Vite emitted non-fatal deprecation/config notices; no dependency audit or upgrade was performed.

Machine-readable evidence: deployment-output/environment-audit/validation-results.json. The existing v6 archive is unchanged and does not contain these new source edits; any future deployment needs a newly reviewed candidate. No deployment, activation, database migration or real email was performed.
