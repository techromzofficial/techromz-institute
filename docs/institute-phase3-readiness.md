# Institute Phase 3 readiness procedures

These procedures are preparation only. Keep all feature gates false until every blocker in the Phase 3 report is closed and staging verification is complete.

## Security remediation update (31 October 2026)

- Migration `003_institute_security_remediation.sql` adds shared rate-limit state and short-lived contact challenge/grant records without rewriting migrations 001 or 002.
- Public identity linking requires a single-use contact grant; conflicting email/phone identities are rejected. Administrator-assisted creation requires an authenticated actor and is audited.
- The SMTP delivery adapter is implemented but remains fail-closed without runtime credentials. Keep registration disabled until SMTP delivery and the IP-independent identifier/global protection mode are validated in staging.
- The approved email adapter uses authenticated Hostinger SMTP at `smtp.hostinger.com:465` with TLS certificate validation and sender `enrolments@techromzit.com`. Configure its six `INSTITUTE_SMTP_*` variables only in the server runtime. Automated tests use an injected mock transport and never send real messages.
- `X-Forwarded-For`, `X-Real-IP`, and other caller-supplied client-address headers are ignored. Configure `INSTITUTE_ABUSE_PROTECTION_MODE=identifier-and-global` and the explicit production hostname allowlist only after migration 004 and staging validation.
- Payment verification requires a stable provider/manual receipt reference. Expiry and cancellation reuse the locked reservation lifecycle row, and payment/enrolment retries return the existing result.
- All nine manifest deadlines are 27 November 2026 at 23:59:59 Asia/Colombo. Fees and the 30-seat cap are unchanged.

## Hostinger environment checklist

Server-only database settings:

- `INSTITUTE_DB_HOST=127.0.0.1` only in the hosted application runtime
- `INSTITUTE_DB_PORT=3306`
- `INSTITUTE_DB_NAME`
- `INSTITUTE_DB_USER`
- `INSTITUTE_DB_PASSWORD`
- `INSTITUTE_DB_CONNECTION_LIMIT` (1–20; start with 5)
- `INSTITUTE_DB_SSL` based on the actual Hostinger connection requirements

Server-only security settings must be three independently generated, base64-encoded 32-byte values:

- `INSTITUTE_PII_ENCRYPTION_KEY`
- `INSTITUTE_PII_LOOKUP_KEY`
- `INSTITUTE_SESSION_HASH_KEY`

Activation gates remain:

- `INSTITUTE_ADMIN_ENABLED=false`
- `INSTITUTE_REGISTRATION_ENABLED=false`
- `INSTITUTE_PAYMENT_ENABLED=false`
- `INSTITUTE_SEAT_AVAILABILITY_ENABLED=false`

The public origin must use HTTPS. Administrator cookies use the `Secure`, `SameSite=Strict` and `__Host-` protections and therefore must not be activated on an HTTP origin.

## Catalogue provisioning

`npm run db:provision:institute` is always a disconnected dry run unless `--apply` is explicitly supplied. The tracked manifest contains exactly nine approved course/intake identities, fees in LKR minor units, capacity 30, and only confirmed dates. It deliberately reports missing AI and Retail registration deadlines instead of inventing dates.

After the missing deadlines are formally approved and the manifest is reviewed:

1. Run the dry run and require `valid: true`.
2. Prepare a private authorization JSON file outside the repository containing `approvedBy`, ISO-8601 `approvedAt`, and `changeTicket`.
3. Back up and test restore.
4. Run `npm run db:provision:institute -- --apply --authorization-file /secure/path/authorization.json` from the hosted server.
5. Verify nine courses and nine draft intakes. The procedure never opens an intake or changes a feature gate.

## First administrator and credential rotation

Dry run:

`npm run db:provision:admin -- --mode bootstrap --username <name> --display-name "<display name>"`

Authorized apply:

`npm run db:provision:admin -- --apply --mode bootstrap --username <name> --display-name "<display name>" --authorization-file /secure/path/authorization.json`

The apply path requires an interactive TTY and accepts the password only through hidden terminal input. It refuses to bootstrap when any administrator already exists, creates no public endpoint, uses the same scrypt parameters as runtime authentication, and records authorization metadata in the audit log.

For recovery or planned rotation, use `--mode rotate-password --username <existing-name>` with `--apply` and a fresh authorization file. Rotation revokes every live session for that administrator, clears lockout counters and writes an audit record. Keep at least two separately controlled administrator accounts after initial commissioning so recovery does not depend on one individual. Never recover an account by directly storing a plaintext or ad-hoc password hash.

## Backup and restore gate

Before migrations or provisioning, create an encrypted database backup, record its checksum, and restore it into an isolated database using the same MariaDB major/minor version. Validate table counts, constraints, certificate projections and administrator session revocation. Retain backups according to the Institute privacy policy and restrict both backup and restore credentials.
