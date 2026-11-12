# Application rollback guide

Before deployment record the approved previous source/ZIP, SHA-256, deployment ID, runtime Node/port configuration, environment secret-store version and database backup timestamp. Existing v5 ZIP was preserved; it has not been proved to be the currently approved live deployment. Obtain that identity before release.

1. Stop promotion if smoke tests fail. Keep enquiry, registration, payment, administration and seat flags false; pause the delivery schedule to prevent concurrent workers during rollback. Do not delete queued enquiries.
2. Redeploy the recorded prior approved application ZIP/source with its compatible build/runtime environment through the authorized Hostinger process. Do not replace encryption/lookup/session keys, and never store them in the ZIP.
3. This candidate changes no schema and requires no reverse migration. Preserve the live MariaDB database and all newer records, migration history and encrypted outbox rows. Do not import the old phpMyAdmin backup as an application rollback step.
4. Confirm the prior version understands existing migrations/outbox statuses before resuming any worker. Reconcile sending/interrupted_uncertain entries privately to avoid duplicate notifications. Restore the prior scheduler only if its code and schema are compatible.
5. Verify HTTPS, approved hostname/Origin, public read-only pages, disabled flags and private DB identity. Do not run record-creating production checks without scope. Keep fixed-code diagnostics disabled after evidence collection.
6. Record the incident, deployment IDs and outcomes. Escalate actual database corruption separately; a database restore requires its own recovery-point decision and approval because newer records may be lost.

ZIP integrity and source-byte comparisons are automated by package-hostinger-v6.py. A real Hostinger restore and post-rollback smoke test remain NOT RUN because hosting access and approval are unavailable.
