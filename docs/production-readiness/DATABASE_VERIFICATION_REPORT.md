# Database verification report

**BLOCKED: no actual database connection was established.** The explicit read-only diagnostic executed against the real application pool entry point and returned `database_configuration_missing_or_invalid`. A completed diagnostic test is not a passing connectivity test. Local `.env.local` has no DB hostname/name/user/password. No credentials were guessed and no migrations were run.

Prepared read-only statements: `SELECT 1 AS connection_test`; `SELECT VERSION(), DATABASE(), CURRENT_USER()` with named result aliases; `SELECT @@hostname, @@port`; base-table count from information_schema; migration history/checksum SELECT. The diagnostic starts a READ ONLY transaction and rolls back, releases the connection and ends its pool. Identity output is restricted to `deployment-output/database-runtime-diagnostic.private.json` and excluded from the ZIP.

| Check | Result |
|---|---|
| Application pool connection | BLOCKED |
| Actual MariaDB version and identity | BLOCKED |
| 20 existing base tables | BLOCKED ? operator supplied, not independently verified |
| Six migration files locally | Present; SHA-256 inventory in source-comparison-readiness.json |
| Applied migration checksums on live DB | BLOCKED ? operator supplied, not independently verified |
| 10.5 control-plane versus 11.8.9 discrepancy | Unresolved; compare VERSION(), DATABASE(), CURRENT_USER(), @@hostname, @@port from phpMyAdmin and deployed Next.js at the same time |
| Catalogue dry run | 37 published / 7 departments / 7 hidden; no database comparison |

The application uses mysql2/promise and INSTITUTE_DB_* only, a lazy singleton pool, 5 default connections (1..20), bounded queue 50, UTC, utf8mb4, keepalive and a 10-second connection timeout. SSL=true requires certificate validation; malformed SSL configuration now also fails closed in CLI provisioning helpers. Query errors remain generic in public responses. Production grants must match the operations actually approved; request-handler rate limits require writes to the limiter table.

Course enquiries store the catalogue slug in existing `institute_course_enquiries.course_id`; it is not the UUID foreign key used by enrolment intake tables. No schema changes are required for this enquiry workflow. Existing migrations 001?006 were not edited by this task. No SQL migration was created or applied.

Safe sync: `node scripts/sync-institute-catalogue.mjs` is disconnected dry run. `--database` performs a read-only comparison. Only after review, backup and explicit approval: `node scripts/sync-institute-catalogue.mjs --database --apply --authorization-file <private-approval.json>`. The approval file requires approvedBy, approvedAt and changeTicket. It must stay outside the package/repository. New course IDs reuse the nine existing approved identities where applicable, otherwise deterministic IDs; existing rows are never updated. Conflicting titles/retired status or active hidden courses stop apply. Inserts use a transaction, indexed range locking and the unique slug constraint. Hidden courses are excluded. No intakes, fees, dates or delivery modes are invented. Current schema lacks department/fee/delivery columns on institute_courses; these remain authoritative in source and the generated review report. Do not run the legacy nine-intake provisioner without renewed academic/date approval.

The write integration suite requires explicit isolated database name confirmation and refuses the named production database. It was skipped. Provision a disposable staging database and inject independent test keys to execute it; never point it at production. Do not restore an older database over later production records during application rollback.
