# Hostinger course enquiry activation

This is a preparation checklist. Do not change production settings or send the controlled test until an approved maintenance window and database backup exist.

## Reuse and readiness

Use the dedicated Institute staging MariaDB database. Course enquiries use `institute_rate_limits`, created by migration 003, the IP-independent verification changes in migration 004, and the purpose-bound verification plus encrypted enquiry table in migration 005. Never point staging at the production database.

From the Hostinger application directory, with server-only database variables loaded, run:

```sh
npm run db:status:institute
```

Require `readyForCourseEnquiries: true`, `migration004Applied: true`, `migration005Applied: true`, `rateLimitTablePresent: true`, `courseEnquiryTablePresent: true`, and matching checksums for migrations 001–005. This command is read-only. A missing local `.env` means repository inspection alone cannot prove the staging migration state.

## Exact runtime variables

Database variables read by the application and operational scripts:

- `INSTITUTE_DB_HOST` — use the host shown by Hostinger; use `127.0.0.1` only when Hostinger confirms the database is local to the Node.js runtime.
- `INSTITUTE_DB_PORT` — normally `3306`, but use the actual Hostinger value.
- `INSTITUTE_DB_NAME`
- `INSTITUTE_DB_USER`
- `INSTITUTE_DB_PASSWORD`
- `INSTITUTE_DB_CONNECTION_LIMIT` — integer 1–20; start with `5`.
- `INSTITUTE_DB_SSL` — `true` only when the supplied Hostinger endpoint supports certificate-validated TLS; otherwise use the confirmed local connection requirement.

SMTP variables read by `readInstituteSmtpConfig`:

- `INSTITUTE_SMTP_HOST=smtp.hostinger.com`
- `INSTITUTE_SMTP_PORT=465`
- `INSTITUTE_SMTP_USER=enrolments@techromzit.com`
- `INSTITUTE_SMTP_PASSWORD` — mailbox secret stored only in Hostinger runtime configuration.
- `INSTITUTE_SMTP_FROM=enrolments@techromzit.com`
- `INSTITUTE_SMTP_SECURE=true`

Abuse and request validation:

- `INSTITUTE_ABUSE_PROTECTION_MODE=identifier-and-global`
- `INSTITUTE_ALLOWED_HOSTS=seagreen-antelope-213780.hostingersite.com` for the current isolated staging Web App. Production must use its own separate hostname list.
- `NEXT_PUBLIC_APP_URL=https://techromzit.com/` or the one canonical allowed production origin.
- `NODE_ENV=production` through the production start process; sensitive POSTs require HTTPS in production.
- `INSTITUTE_ONLY_MODE=true` for the Institute-only Hostinger deployment so `/api/institute/*` is handled by Next.js rather than the retail backend rewrite.
- `INSTITUTE_COURSE_ENQUIRY_ENABLED=true` only after migration 005, SMTP, database readiness and the allowed staging hostname are verified. Registration, administration, payment, seat availability and indexing remain false.

Never prefix SMTP or database secrets with `NEXT_PUBLIC_`.

## Safe migration procedure

1. Schedule a maintenance window and record the application release and database server versions.
2. Create an encrypted Hostinger database backup. Record its UTC time, size and checksum without copying credentials into logs.
3. Restore that backup into an isolated database using the same MariaDB major/minor version. Verify table counts and that the restored `institute_schema_migrations` ledger is readable.
4. Use a temporary migration account with schema-alter privileges if Hostinger supports separate users. Keep the runtime account least-privileged.
5. Run `npm run db:status:institute`. Stop on a checksum mismatch; never edit an already-applied migration or its ledger row.
6. Run `npm run db:migrate:institute` once. The runner takes the `techromz_institute_migrations` advisory lock, applies missing migrations in filename order, and records SHA-256 checksums.
7. Re-run `npm run db:status:institute` and require migrations 001–005 plus `institute_rate_limits` and `institute_course_enquiries`.
8. Revoke migration-only privileges and restart the application with the restricted runtime account.
9. Exercise the readiness endpoint and controlled enquiry test in staging before production traffic.

The SQL is additive and uses `IF NOT EXISTS`, but MariaDB DDL may auto-commit. Rollback is therefore restore-based: stop the application, preserve failure logs, restore the verified pre-migration backup, validate counts and constraints, and only then reopen traffic. Do not manually delete ledger rows or partially created tables as an improvised rollback.

## Controlled end-to-end test

Dry run (no database connection and no email):

```sh
npm run enquiry:e2e
```

After the deployed application, database and SMTP configuration are ready:

```sh
npm run enquiry:e2e -- --send
```

The send mode:

1. requires an interactive TTY;
2. validates the configured HTTPS origin against `INSTITUTE_ALLOWED_HOSTS`;
3. connects to the configured Institute database and verifies tracked migration checksums 001–005, `institute_rate_limits` and `institute_course_enquiries`;
4. requires the deployed endpoint readiness check to pass;
5. requires an exact typed confirmation;
6. sends one purpose-bound verification code, requires it interactively, then submits one fixed `Electronics Repair & Troubleshooting` enquiry through the real API;
7. uses `enrolments@techromzit.com` as the fixed test email and destination;
8. performs no retry and reports success only after the API receives SMTP provider acceptance.

After acceptance, manually verify the enrolment inbox and spam folder and record receipt time. Provider acceptance is not proof of inbox placement.
