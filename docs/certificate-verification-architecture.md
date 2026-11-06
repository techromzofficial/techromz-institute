# Techromz Institute certificate verification architecture

## Current activation state

Public verification UI and validation are implemented. Production lookup, issuance, revocation, QR creation and PDF generation are disabled because no approved persistent certificate database or server-verified Institute administrator identity is configured.

## Required production services

- The approved Hostinger MySQL/MariaDB database with encrypted transport where supported, backups, tested recovery and a least-privilege application account.
- A server-only repository adapter implementing `CertificateRepository`. It must return only the public projection: student display name, course name, certificate ID, issue date, issuer and status.
- A distributed rate limiter shared across all Node instances. The in-process limiter is only a fail-safe and is not sufficient for a multi-instance deployment.
- Server-verified authentication with `certificate_admin` and `certificate_auditor` roles. Browser cookies and the existing client-side `AdminRouteGuard` are not authorization controls.
- Immutable audit events for issue, revoke and PDF-generation actions.
- Secret management through Hostinger environment configuration or an approved secret manager. No database credentials may use `NEXT_PUBLIC_*` names.

## Issuance transaction

Within one database transaction: authenticate and authorize the administrator; lock the learner/course eligibility record; verify at least five of eight live classes and a final assessment score of at least 60 after the initial attempt or permitted resubmission; reject duplicate student/course issuance; generate a cryptographically random 24-character Crockford-style identifier after `TIT-`; create the certificate record; append the audit event; commit. Never accept eligibility facts from the browser.

## Revocation transaction

Authenticate and authorize a certificate administrator, require a private reason, lock the record, set status and revocation timestamp, and append an audit event in the same transaction. The public response exposes only `Revoked`, never the private reason.

## QR and PDF generation

After authorization and eligibility verification, build the QR target with `buildCertificateVerificationUrl(productionOrigin, certificateId)`. Generate the PDF server-side from `CertificateDocumentPayload`. The QR must point to `/institute/verify?certificate=...`; it must never encode a success result. Store or regenerate the PDF through approved private storage. Wording is `Certificate of Completion` and must not claim external accreditation.

## Privacy and indexing

The verification page and API send noindex/noarchive controls. Public lookup is exact-ID only and never supports student-name searches. Marks, attendance, contact details, student references, issuer references and revocation reasons remain private.

## MySQL deployment foundation

The tracked migration is `database/migrations/001_institute_core.sql`. It creates students, courses, intakes, registrations, seat reservations, payment-verification records, enrolments, attendance, practical assessments, certificates and audit logs using InnoDB. It contains no seed students or certificates.

Configure these server-only Hostinger variables: `INSTITUTE_DB_HOST`, `INSTITUTE_DB_PORT`, `INSTITUTE_DB_NAME`, `INSTITUTE_DB_USER`, `INSTITUTE_DB_PASSWORD`, `INSTITUTE_DB_CONNECTION_LIMIT` and `INSTITUTE_DB_SSL`. The confirmed host, port, database and user belong in Hostinger runtime configuration; the password must never be stored in the repository. Do not use `NEXT_PUBLIC_` names.

The application pool is lazy and fails closed. Public verification returns unavailable when configuration, authentication or connectivity fails. The only active database integration is exact-ID public certificate lookup; there are no public mutation endpoints.

Seat reservation locks the intake row with `SELECT ... FOR UPDATE`, counts active/completed enrolments plus unexpired active reservations, and inserts only when the count is below `max_seats`. The schema limits `max_seats` to 30. All registration and enrolment activation paths must call this transaction rather than inserting allocations directly.

### Production migration procedure

1. Back up the Hostinger database and record a rollback point.
2. Create a least-privilege migration account separately from the runtime account, if Hostinger permits it.
3. Configure the seven server-only database variables in the Hostinger application environment.
4. Upload and build the reviewed release without switching traffic.
5. From the hosted application environment—not a developer Mac—run `npm run db:migrate:institute` once during an approved maintenance window.
6. Confirm `institute_schema_migrations` contains the expected filename and checksum, then revoke migration-only privileges.
7. Validate a read-only connection and API-unavailable behavior before any real certificate records exist.
8. Configure distributed rate limiting and server-verified administrator roles before enabling registration, issuance, revocation or PDF generation.
9. Seed only approved course identifiers through a separate reviewed operational migration; never seed fictional students or certificates.
