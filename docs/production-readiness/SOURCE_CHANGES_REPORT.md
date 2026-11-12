# Source changes and compatibility report

Branch: fix/institute-production-readiness. Base HEAD: 14e1def827cb94f70c6c5f4c76784ec3bfbcb972, equal to fetched remote feature branch; main is older. Local work was already dirty at intake and was preserved. The source owner has not confirmed approval of those edits or supplied deployed source. No commit, push, deployment or production configuration change was performed. V5 and database backup artifacts were not overwritten.

| Modified tracked file | Reason |
|---|---|
| `.env.example` | Sanitized OTP policy, alias-conflict behavior and diagnostic switch |
| `.eslintrc.json` | Existing lint configuration edits preserved |
| `.gitignore` | Existing deployment/environment exclusions preserved |
| `README.md` | Existing documentation edits preserved |
| `scripts/check-institute-db-status.mjs` | Existing module-loading fix preserved; not run against production |
| `scripts/course-enquiry-e2e.mjs` | Include published course context in challenge and verify requests |
| `scripts/institute-provisioning-common.mjs` | Validate SSL booleans and bound connection timeout; preserve prior fixes |
| `scripts/migrate-institute-db.mjs` | Existing module-loading fix preserved; migration not executed |
| `src/app/api/institute/certificates/verify/route.ts` | Bound JSON and fixed-code operator-only failure diagnostics |
| `src/app/api/institute/contact-verification/challenge/route.ts` | Validate published course; bind challenge context; runtime OTP policy metadata |
| `src/app/api/institute/contact-verification/verify/route.ts` | Revalidate published course and enforce course/session context |
| `src/app/api/institute/course-enquiries/route.ts` | Existing readiness/orchestration changes preserved; reuses strengthened storage binding |
| `src/features/education/administration/contactVerification.ts` | Apply bounded expiry/attempt/cooldown values to persistent OTP flow |
| `src/features/education/administration/courseEnquiry.ts` | Validate phone digit count; notification enquiry reference |
| `src/features/education/administration/courseEnquiryStore.ts` | Use course/session-bound grant hash; preserve existing transactional storage |
| `src/features/education/administration/crypto.ts` | Existing security-key readiness work preserved; no key material changed |
| `src/features/education/administration/enquirySession.ts` | Shared deterministic course verification context |
| `src/features/education/administration/requestSecurity.ts` | Fixed failure codes, strict production host configuration and canonical Origin; no proxy trust added |
| `src/features/education/administration/smtp.ts` | Reject conflicting aliases and show configured OTP expiry |
| `src/features/education/components/CourseEnquiryButton.tsx` | Course context, cooldown metadata, WhatsApp/focus trap, disabled fields, retry key across refresh |
| `src/features/education/components/InstituteAdminConsole.tsx` | Expose enquiry viewer only to enrolment roles |
| `src/features/education/database/pool.ts` | 10-second connection timeout |
| `src/middleware.js` | Allow exact authenticated outbox worker path; prevent delivery 404 |
| `src/tests/course-enquiry-otp-lifecycle.test.ts` | Regression updates for the existing enquiry/security workflow |
| `src/tests/course-enquiry-route.test.ts` | Existing orchestration regressions preserved |
| `src/tests/course-enquiry-secure-workflow.test.ts` | Regression updates for the existing enquiry/security workflow |
| `src/tests/course-enquiry.test.tsx` | Regression updates for the existing enquiry/security workflow |
| `src/tests/institute-contact-verification-route.test.ts` | Regression updates for the existing enquiry/security workflow |
| `src/tests/institute-deployment-routing.test.ts` | Regression updates for the existing enquiry/security workflow |
| `src/tests/institute-mariadb-integration.test.ts` | Regression updates for the existing enquiry/security workflow |
| `src/tests/institute-proxy-security.test.ts` | Regression updates for the existing enquiry/security workflow |
| `src/tests/institute-smtp-verification.test.ts` | Regression updates for the existing enquiry/security workflow |

New or pre-existing untracked files retained in the worktree:

- `docs/HOSTINGER_DEPLOYMENT_V3.md` ? Pre-existing local artifact preserved; .bak excluded from package.
- `docs/HOSTINGER_DEPLOYMENT_V4.md` ? Pre-existing local artifact preserved; .bak excluded from package.
- `docs/HOSTINGER_DEPLOYMENT_V5.md` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/check-institute-db-status.mjs.bak` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/check-institute-db-status.mjs.before-require-fix.bak` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/export-institute-schema-v5.py` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/institute-catalogue-source.mjs` ? New production-readiness implementation/tool/regression.
- `scripts/institute-provisioning-common.mjs.bak` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/institute-provisioning-common.mjs.before-require-fix.bak` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/institute-readiness-smoke.mjs` ? New production-readiness implementation/tool/regression.
- `scripts/migrate-institute-db.mjs.bak` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/migrate-institute-db.mjs.before-require-fix.bak` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/package-hostinger-v3.py` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/package-hostinger-v4.py` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/package-hostinger-v5.py` ? Pre-existing local artifact preserved; .bak excluded from package.
- `scripts/package-hostinger-v6.py` ? New production-readiness implementation/tool/regression.
- `scripts/sync-institute-catalogue.mjs` ? New production-readiness implementation/tool/regression.
- `src/app/api/institute/admin/enquiries/route.ts` ? New production-readiness implementation/tool/regression.
- `src/features/education/administration/otpPolicy.ts` ? New production-readiness implementation/tool/regression.
- `src/features/education/components/InstituteAdminEnquiries.tsx` ? New production-readiness implementation/tool/regression.
- `src/tests/institute-admin-enquiries.test.ts` ? New production-readiness implementation/tool/regression.
- `src/tests/institute-readiness-regression.test.ts` ? New production-readiness implementation/tool/regression.
- `src/tests/institute-runtime-diagnostic.test.ts` ? New production-readiness implementation/tool/regression.
- `src/tests/institute-security-key-readiness.test.ts` ? Pre-existing local artifact preserved; .bak excluded from package.

Reports under docs/production-readiness are new review artifacts; copies of required deliverables are under deployment-output. Production environment values and private diagnostic results are not packaged. The ZIP contains the full existing source architecture including legacy paths; Institute-only middleware still restricts public exposure. No unnecessary application redesign or catalogue publication change was made.

Security impact: exact host/Origin/HTTPS checks, session/auth/role enforcement, encrypted PII and shared rate limits remain. No arbitrary proxy headers are trusted. New staff contact access is restricted to administrator/registrar, no-store, capped pagination and audit logging. New worker allowlist entry reaches its existing authenticated handler. OTP attempts cannot exceed five, expiry cannot exceed ten minutes, and cooldown cannot be below sixty seconds.

Compatibility: no dependencies or migrations added. Existing SMTP deployments with conflicting dual aliases must align them before activation. In-flight email grants from older builds require re-verification because course context is now bound. Browser sessionStorage contains only a random retry key, not PII. Course synchronization adds missing identities only and preserves existing IDs/rows; existing nine IDs are reused. Fees/delivery/department remain source-owned because current schema lacks corresponding course columns. Node 22 is required; npm version alignment remains an operator check.

Validation evidence is in validation-report-v6.json and the acceptance report. Unit doubles are explicitly distinguished from real MariaDB/SMTP/browser tests. Source comparison against v5 is an inventory, not evidence that v5 is the approved deployed application.
