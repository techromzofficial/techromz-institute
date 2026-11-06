# Institute Phase 2 deployment gate

Phase 2 is implemented fail-closed. Do not enable it until every item below is complete. No migration has been run against Hostinger by this repository change.

## Required runtime

- A Hostinger Node.js runtime capable of running Next.js server routes (this is not a static-export feature).
- MySQL/MariaDB reachable as `127.0.0.1:3306` from the hosted application only.
- HTTPS at the public origin. Administrator cookies use the `Secure` and `__Host-` protections.
- Server-only database variables documented in `.env.example`.
- Three separate, randomly generated base64 32-byte values for `INSTITUTE_PII_ENCRYPTION_KEY`, `INSTITUTE_PII_LOOKUP_KEY`, and `INSTITUTE_SESSION_HASH_KEY` in the Hostinger secret environment.
- Encrypted database backups, retention, restoration testing, and restricted database-user privileges.

## Controlled activation sequence

1. Back up the target database and verify restoration in an isolated environment.
2. Configure server-only environment values. Never configure them as `NEXT_PUBLIC_*` values.
3. During an approved maintenance window, run `npm run db:migrate:institute` once from the hosted application directory. The runner takes an advisory lock, checks migration checksums, and stops on errors. Re-run is safe for partially completed `CREATE TABLE IF NOT EXISTS` migrations, but inspect the database and error before retrying.
4. Insert the nine approved course records and their distinct intake records through a reviewed server-side operational process. Set each intake capacity no higher than 30 and use its own registration deadline.
5. Provision the first administrator through an approved server-side process using `hashPassword`; never insert a plaintext password and never expose a provisioning endpoint.
6. Validate administrator login/logout, CSRF rejection, role restrictions, audit logs, PII encryption, reservation expiry and last-seat concurrency in staging.
7. Validate that payment verification is a manual administrator action and that enrolment confirmation requires both a live reservation and a verified payment record.
8. Set `INSTITUTE_ADMIN_ENABLED=true` only after steps 1–7. Keep `INSTITUTE_REGISTRATION_ENABLED=false`, `INSTITUTE_PAYMENT_ENABLED=false` and `INSTITUTE_SEAT_AVAILABILITY_ENABLED=false`. Enabling administration alone must not activate payment verification or enrolment confirmation.
9. After an operational review, enable registration. Live public availability remains off unless separately approved and validated.

Certificate issuance, certificate revocation and PDF generation remain disabled. Phase 2 enrolments reuse the same `student_id`, `intake_id` and `enrolment_id` references required by the certificate eligibility schema.
