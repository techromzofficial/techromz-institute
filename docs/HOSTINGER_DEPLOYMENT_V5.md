# Hostinger course enquiry deployment V5

This is a source deployment package for the existing Next.js application. Keep
course enquiries disabled until the production database, migrations, SMTP, keys,
request security and authenticated delivery schedule pass staging verification.
Building or uploading the package does not activate or test those services.

The readiness endpoint validates that the three base64 keys decode to
independent 32-byte values, the allowed-host list is syntactically valid,
production has a trusted-IP header name, and each numbered migration file
matches its row in `institute_schema_migrations`. Server logs report only
pass/fail categories. SMTP readiness checks configuration; only the authorized
interactive SMTP diagnostic can verify a live SMTP connection.

## Build settings

- Framework: Next.js
- Node.js: 22.x
- Root directory: `/`
- Package manager: npm
- Build command: `npm run build`
- Output directory: `.next`
- Start command if requested by the panel: `npm run start`

Upload the V5 ZIP through the Hostinger Node.js/Web App source upload, not a
static file manager. The archive root contains `package.json`.

## Required server environment

Use Hostinger's environment-variable/secret settings. Never store actual secrets
in this repository, `.env.example`, the ZIP, client-side variables, or URLs.

```dotenv
INSTITUTE_ONLY_MODE=true
NEXT_PUBLIC_APP_URL=https://techromzit.com
INSTITUTE_ALLOW_INDEXING=false

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<full mailbox address>
SMTP_PASS=<mailbox password stored in Hostinger secret field>
SMTP_FROM_EMAIL=<same full mailbox address>
ENQUIRY_RECIPIENT_EMAIL=enrolments@techromzit.com

INSTITUTE_DB_HOST=127.0.0.1
INSTITUTE_DB_PORT=3306
INSTITUTE_DB_NAME=<full database name from hPanel>
INSTITUTE_DB_USER=<full database username from hPanel>
INSTITUTE_DB_PASSWORD=<database password stored in Hostinger secret field>
INSTITUTE_DB_CONNECTION_LIMIT=5
INSTITUTE_DB_SSL=false

INSTITUTE_PII_ENCRYPTION_KEY=<independent base64-encoded 32-byte key>
INSTITUTE_PII_LOOKUP_KEY=<independent base64-encoded 32-byte key>
INSTITUTE_SESSION_HASH_KEY=<independent base64-encoded 32-byte key>

INSTITUTE_ABUSE_PROTECTION_MODE=identifier-and-global
INSTITUTE_ALLOWED_HOSTS=techromzit.com,www.techromzit.com
INSTITUTE_TRUSTED_CLIENT_IP_HEADER=<verified single-IP header overwritten by ingress>
INSTITUTE_ENQUIRY_WORKER_SECRET=<random secret of at least 32 characters>

INSTITUTE_COURSE_ENQUIRY_ENABLED=false
```

SMTP uses the Node.js runtime and certificate-validated TLS on port 465. The
authenticated mailbox must match `SMTP_FROM_EMAIL`; the enquiry recipient is
fixed to `enrolments@techromzit.com`. The application supports the legacy
`INSTITUTE_SMTP_*` names too; when `SMTP_*` is set, it takes precedence.

Generate each data key independently with Node.js:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Generate the worker secret separately:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Run these locally and paste outputs directly into Hostinger's secret fields.
Keep the three data keys stable and back them up securely with the database.
Do not generate replacement keys for a database that already contains encrypted
records.

Hostinger's Node.js MySQL guide uses `127.0.0.1` and port `3306`. Create the
database in **Websites → Manage site → Databases → Management** and copy the full
prefixed database/user names. Verify that these connection values match the
database attached to this Node.js app.
The supplied Institute database/user names in the deployment request fit this
repository's dedicated `INSTITUTE_DB_*` configuration model, but the repository
cannot prove that the Hostinger app is connected to that database. Obtain the
database host from hPanel and confirm the selected database before running any
command. Do not point these scripts at the general website database.

## Staged activation gate

1. Keep `INSTITUTE_COURSE_ENQUIRY_ENABLED=false` and take a restorable database
   backup.
2. Confirm the Hostinger database engine/version. This repository's activation
   documentation requires checking its MariaDB-compatible `ADD COLUMN IF NOT
   EXISTS` / `CREATE INDEX IF NOT EXISTS` migration syntax against the actual
   server. Hostinger's managed Node.js database guide describes MySQL. No
   compatibility is assumed until migrations pass on a staging database with
   the same engine/version.
3. With the required database values available to the application process, run
   `npm run db:migrate:institute`. It applies migrations 001 through 006 in
   order. Then run `npm run db:status:institute` and confirm their checksums and
   tables. Do not run against production before the staging test and backup.
4. Verify SMTP from the deployed Node.js environment with the provided
   interactive diagnostic. Do not put the mailbox password in a command line.
   Unit tests mock SMTP and do not prove mailbox delivery.
5. Verify Hostinger's ingress overwrites a single client-IP header and that
   direct-origin access cannot spoof it. Only then set
   `INSTITUTE_TRUSTED_CLIENT_IP_HEADER` to that verified header name. The source
   repository cannot determine or attest to this Hostinger-specific behavior.
6. Set `INSTITUTE_ENQUIRY_WORKER_SECRET` to a random value at least 32
   characters long. Configure a scheduler to send an HTTPS POST every minute
   to `https://techromzit.com/api/institute/course-enquiries/delivery` with
   `Authorization: Bearer <secret>` from its secret store. Never put the secret
   in the URL. Confirm the scheduler can send the header and monitor its
   responses.
7. Verify database readiness, required migrations, SMTP settings, allowed
   domains, abuse protection and the trusted IP header. Only after all checks
   pass, set `INSTITUTE_COURSE_ENQUIRY_ENABLED=true` and redeploy.
8. Check `GET /api/institute/course-enquiries` returns `available: true`; test
   an OTP to a controlled mailbox, verify it, submit a test enquiry, run the
   worker, then confirm both the database delivery status and the received
   message. SMTP acceptance alone is not proof of inbox delivery.

The readiness route returns only an `available` boolean. It intentionally does
not reveal which server prerequisite is missing. When unavailable, both enquiry
actions stay disabled. The UI now says “Email enquiries are temporarily
unavailable. Please try again later.” Live production root cause requires
Hostinger runtime logs and private configuration; this package does not inspect
or change those values.

OTP expiry (5 minutes), failed-attempt cap (5), and resend cooldown (60 seconds)
are implemented in code; `OTP_EXPIRY_MINUTES`, `OTP_MAX_ATTEMPTS`, and
`OTP_RESEND_COOLDOWN_SECONDS` are not application configuration variables.

## Student workflow and endpoints

- `POST /api/institute/contact-verification/challenge` sends the six-digit code.
- `POST /api/institute/contact-verification/verify` validates the code and
  returns a purpose-bound, session-bound grant.
- `POST /api/institute/course-enquiries` validates that grant, course and fields,
  encrypts and saves the enquiry, then queues delivery.
- Authenticated scheduler `POST /api/institute/course-enquiries/delivery`
  processes queued messages, sets the student as `Reply-To`, and records status
  and bounded retry outcomes.

No client-side `emailVerified` value is trusted. SMTP/database failures return
neutral user messages; diagnostics contain no OTP or password values.

`deployment-output/techromzit-institute-database-v5.sql` concatenates the exact
numbered migration files with comment headers. It does not create or populate
`institute_schema_migrations`. Prefer `npm run db:migrate:institute`, which
records checksums. If SQL is imported manually, do not mark migrations applied
by hand; reconcile and verify schema state before enabling the application.
