# Environment configuration report

All 31 supplied settings are documented below. Production runtime values were hidden and remain **BLOCKED / unverified**. Local DB credentials, SMTP password and security keys are missing. Presence in hPanel does not prove availability to the Node process. Paths are under `src/features/education/` unless a route or root file is named.

| Variable | Purpose / accepted format | Required | Source usage | Evaluation | Validation status / Hostinger action |
|---|---|---|---|---|---|
| INSTITUTE_ALLOWED_HOSTS | Exact comma-separated hostnames; no schemes, ports or wildcards | Required for public operations | administration/requestSecurity.ts | Runtime | Runtime unverified; Confirm techromzit.com,www.techromzit.com and no invalid entries |
| INSTITUTE_ABUSE_PROTECTION_MODE | Only identifier-and-global activates protected writes | Required | administration/rateLimit.ts | Runtime | Runtime unverified; Confirm exact accepted mode |
| INSTITUTE_SESSION_HASH_KEY | Independent base64 32-byte HMAC secret | Required | administration/crypto.ts; rateLimit.ts | Runtime | Runtime unverified; Confirm availability and preserve existing key |
| INSTITUTE_PII_LOOKUP_KEY | Independent base64 32-byte lookup secret | Required for enquiry | administration/crypto.ts | Runtime | Runtime unverified; Confirm availability; never rotate casually |
| INSTITUTE_PII_ENCRYPTION_KEY | Independent base64 32-byte AES-GCM secret | Required for enquiry | administration/crypto.ts | Runtime | Runtime unverified; Preserve existing key; confirm backup and separation |
| INSTITUTE_ONLY_MODE | Defaults Institute-only; exact false enables legacy rewrites | Optional; keep true | next.config.mjs; deployment routing | Build and server rendering | Runtime unverified; Set true before build and at runtime |
| NEXT_PUBLIC_APP_URL | Canonical public HTTPS origin | Required for intended production URL | SEO/site helpers; config/site.ts | Build and runtime (public) | Runtime unverified; Set https://techromzit.com before build and runtime |
| INSTITUTE_ALLOW_INDEXING | Indexing activates only with exact true and valid Institute origin | Optional; default false | education SEO helpers | Build / static rendering | Runtime unverified; Approve indexing separately |
| INSTITUTE_DB_HOST | Private database hostname | Required | database/config.ts; pool.ts | Runtime | Runtime unverified; Confirm actual DB endpoint privately |
| INSTITUTE_DB_PORT | Integer TCP port 1..65535 | Required | database/config.ts | Runtime | Runtime unverified; Confirm hosting port; example 3306 |
| INSTITUTE_DB_NAME | Intended database identity | Required | database/config.ts | Runtime | Runtime unverified; Validate DATABASE() privately against intended database |
| INSTITUTE_DB_USER | Application database account | Required | database/config.ts | Runtime | Runtime unverified; Validate CURRENT_USER() and least privileges |
| INSTITUTE_DB_PASSWORD | Database credential; whitespace preserved | Required | database/config.ts | Runtime | Runtime unverified; Confirm nonempty without disclosure |
| INSTITUTE_DB_SSL | Case-insensitive true/false; defaults false; TLS validates certificate when true | Optional | database/config.ts; pool.ts | Runtime | Runtime unverified; Confirm hosting TLS requirement; invalid values fail closed |
| INSTITUTE_COURSE_ENQUIRY_ENABLED | Exact true activates; otherwise disabled | Required launch control | administration/config.ts | Runtime | Runtime unverified; KEEP false until tests and separate activation approval |
| INSTITUTE_SMTP_HOST | Legacy alias for approved smtp.hostinger.com endpoint | Required unless standard alias set | administration/smtp.ts; smtpRuntime.mjs | Runtime | Runtime unverified; Confirm actual hosting endpoint; retain alias |
| INSTITUTE_SMTP_PORT | Legacy port alias; currently only 465 accepted | Required unless standard alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm hosting port and implicit TLS |
| INSTITUTE_SMTP_SECURE | Legacy secure alias; exact true required | Required unless standard alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm true; TLS validation stays enabled |
| INSTITUTE_SMTP_USER | Legacy SMTP authenticated mailbox alias | Required unless standard alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm approved mailbox; sender must match |
| INSTITUTE_SMTP_PASSWORD | Legacy SMTP password alias | Required unless standard alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm credential privately |
| INSTITUTE_SMTP_FROM | Legacy sender alias, must match authenticated mailbox | Required unless standard alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm sender; no arbitrary From |
| SMTP_HOST | Primary host alias | Required unless legacy alias set | administration/smtp.ts; SMTP diagnostic helper | Runtime | Runtime unverified; Use one naming scheme or identical aliases |
| SMTP_PORT | Primary port alias | Required unless legacy alias set | administration/smtp.ts; SMTP diagnostic helper | Runtime | Runtime unverified; Currently 465 only; confirm before activation |
| SMTP_SECURE | Primary secure alias; exact true | Required unless legacy alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm true |
| SMTP_USER | Primary authenticated mailbox alias | Required unless legacy alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm approved mailbox |
| SMTP_PASS | Primary SMTP password alias | Required unless legacy alias set | administration/smtp.ts | Runtime | Runtime unverified; Confirm privately; conflicts fail closed |
| SMTP_FROM_EMAIL | Primary sender alias | Required unless legacy alias set | administration/smtp.ts | Runtime | Runtime unverified; Must match authenticated mailbox |
| ENQUIRY_RECIPIENT_EMAIL | Fixed allowed enrolments@techromzit.com; defaults to this address | Optional | administration/courseEnquiry.ts | Runtime | Runtime unverified; Confirm recipient and approved test scope |
| OTP_EXPIRY_MINUTES | Integer 1..10; default 5 | Optional; now implemented | administration/otpPolicy.ts; contactVerification.ts; smtp.ts | Runtime | Runtime unverified; Confirm policy; previously unused |
| OTP_MAX_ATTEMPTS | Integer 1..5; default 5 | Optional; now implemented | administration/otpPolicy.ts; contactVerification.ts | Runtime | Runtime unverified; Confirm policy; previously unused |
| OTP_RESEND_COOLDOWN_SECONDS | Integer 60..900; default 60 | Optional; now implemented | administration/otpPolicy.ts; challenge/route.ts | Runtime | Runtime unverified; Confirm policy; previously unused |

Additional configuration: `INSTITUTE_DB_CONNECTION_LIMIT` defaults 5 (integer 1..20); pool queue limit 50, connection timeout 10 seconds, UTC and utf8mb4. `INSTITUTE_ENQUIRY_WORKER_SECRET` needs at least 32 characters and a scheduled authenticated worker. `INSTITUTE_TRUSTED_CLIENT_IP_HEADER` needs an operator-confirmed single-IP header that the ingress overwrites, with direct backend access blocked. It is required for production course-enquiry writes. Header presence alone is not a trust boundary. These two enquiry dependencies are missing from the supplied 31-variable inventory.

`INSTITUTE_ADMIN_ENABLED`, `INSTITUTE_REGISTRATION_ENABLED`, `INSTITUTE_PAYMENT_ENABLED`, `INSTITUTE_SEAT_AVAILABILITY_ENABLED` all default disabled and activate only on exact `true`; keep them false. `INSTITUTE_SECURITY_DIAGNOSTICS` is a new optional exact-true switch, default disabled. No new secret values were generated or stored. `INSTITUTE_COURSE_ENQUIRY_LOCAL_TEST_MODE` is an obsolete/dormant local fixture setting: production API routes do not invoke its in-memory OTP workflow, and the former local-outbox endpoint returns 404. Never use it as evidence of real delivery or DB persistence.

The sanitized `.env.example` documents safe formats and disabled gates. The legacy SMTP aliases remain supported. Primary SMTP_* uses nullish precedence, but conflicting simultaneously defined alias values now fail closed without logging either value. Equivalent aliases must match exactly; remove unused aliases only through an approved environment change. The configured SMTP endpoint is source-approved, not independently verified against this Hostinger account. SMTP TLS certificate validation, TLS 1.2 minimum, authentication, and 10/10/15-second connection/greeting/socket timeouts remain intact. No browser code reads server-only SMTP or DB settings.

Production read-only diagnostic: run the explicit Vitest application-pool diagnostic from a controlled operator shell with runtime configuration injected securely; inspect its private output locally, never publish it. The diagnostic code is a local tool, not proof that the deployed Next.js process receives identical settings. Repeat from the deployed process/container environment and compare identity privately. Do not expose a diagnostic web route.
