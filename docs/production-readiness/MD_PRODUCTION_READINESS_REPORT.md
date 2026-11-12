# Managing Director ? Production Readiness Report

**Techromz Institute ? 11 November 2026 ? Decision: do not activate live enquiries yet**

The enquiry implementation has been strengthened and locally tested. The business workflow has **not** been proved end to end with MariaDB and real email. Production certificate verification remains an unconfirmed infrastructure/configuration incident. No production change, email, student record, migration, feature activation or GitHub push was performed.

| Area | Current evidence | Decision |
|---|---|---|
| Implementation | Bounded OTP settings, course/session verification binding, accurate unavailable modal with WhatsApp, stable retry reference, SMTP alias conflict detection, staff enquiry access and restricted diagnostics implemented | Ready for source review |
| Notification blocker | Local HTTP found the authenticated delivery worker incorrectly blocked by middleware with 404; exact-path allowlist fixed, handler authentication retained | Final rebuilt loopback HTTP: 61 passed / 0 failed |
| Automated QA | Full suite: 617 passed / 0 failed / 12 skipped. Final focused regression batch: 49 passed / 0 failed | Locally verified at stated scope |
| Catalogue | 37 published courses, seven departments, seven hidden courses; safe add-only dry run produced | No production synchronization performed |
| Certificate 503 | Four failure stages identified; fixed-code diagnostics added. Hostinger mode, request URL/ingress, runtime settings and DB remain unavailable | Root cause and production resolution BLOCKED |
| MariaDB | Application-pool diagnostic reported missing/invalid configuration; actual server identity/version/count/checksums not obtained | BLOCKED; 10.5 versus 11.8.9 discrepancy unresolved |
| SMTP / enquiries | Local fixture tests exercise OTP, encryption, grant consumption, idempotency and outbox recovery. No real SMTP authentication, OTP inbox receipt, MariaDB persistence or enrolments inbox receipt established | End-to-end acceptance BLOCKED |
| Browser QA | Browser host unavailable; Windows fallback stopped because Chrome URL could not be determined reliably | Desktop/mobile visual, console and full accessibility NOT RUN |
| Administration | Enquiry list has direct mocked backend role checks, no-store responses and access audit. Existing auth and protected operation primitives retained | Authenticated staging roles and operations BLOCKED; production disabled |
| Deployment | Source candidate, archive integrity/checksum and deployment/rollback runbooks prepared subject to validation-report-v6.json | Staging review only; production approval outstanding |

**Certificate incident.** The certificate handler returns 503 for mode/request guard failure, rate-limit storage failure, unavailable repository configuration or lookup failure. Its old combined guard hid the distinction. Local same-origin INVALID reaches the expected 400 in a direct route test. Spoofed proxy headers remain rejected. An internal HTTP/public HTTPS mismatch is a hypothesis, not a confirmed diagnosis. No speculative trust bypass was introduced.

**Enquiry delivery.** Existing encrypted persistent enquiry/outbox architecture was retained. Configured OTP expiry/attempt/cooldown values are now used within safe bounds; verification is bound to the selected published course and browser session. Existing pre-candidate grants require re-verification. Database rows are stored before a queued confirmation. Known transient mail failures receive bounded retries; ambiguous post-send outcomes stop for reconciliation. SMTP cannot guarantee exactly-once delivery. The new staff view is restricted to administrators/registrars and remains behind the disabled administration flag.

**Data integrity and security.** No migration or production data was changed. Existing local edits and previous deployment artifacts were preserved. Synchronization creates only missing planned course identities and refuses conflicts; it does not publish hidden courses or invent intake dates. PII encryption, secrets, hostname/Origin/HTTPS validation, authorization and identifier/global rate limits remain. Conflicting SMTP aliases now fail closed and must be aligned before activation. The worker secret, reliable scheduler and verified trusted ingress IP-header boundary are additional prerequisites beyond the supplied 31 variables.

**Outstanding operator actions.** Supply an isolated test DB/server and approved mailboxes through secure runtime configuration; confirm the deployed/approved source and collect the certificate guard failure code privately. Compare database identity from phpMyAdmin and deployed Next.js. Execute real OTP delivery, verified enquiry persistence/concurrency, notification receipt/recovery, authenticated role tests and desktop/mobile browser QA. Confirm Hostinger GitHub organization/app permissions and deployment logs; local git fetch alone does not establish Hostinger access.

**Approvals.** First approve the exact source baseline and staging test scope. Then approve a checksum-identified production deployment only after staging acceptance and rollback checks pass. Live course enquiry activation requires a separate explicit approval. Keep INSTITUTE_COURSE_ENQUIRY_ENABLED=false and administration, registration, payment and seat availability false in production. No feature is ready for live activation on the available evidence.

Evidence: validation-report-v6.json; COURSE_ENQUIRY_TEST_REPORT.md; ROOT_CAUSE_ANALYSIS.md; ENVIRONMENT_CONFIGURATION_REPORT.md; DATABASE_VERIFICATION_REPORT.md; SMTP_ENQUIRY_VERIFICATION_REPORT.md; SOURCE_CHANGES_REPORT.md; PRODUCTION_DEPLOYMENT_GUIDE.md; PRODUCTION_ROLLBACK_GUIDE.md; HOSTINGER_ENVIRONMENT_CHECKLIST.md. Archive SHA-256 is supplied separately and in the inventory.
