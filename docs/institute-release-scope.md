# Institute release scope

This document isolates the intended Techromz Institute release without moving, deleting or staging unrelated work.

## Include

- `frontend/src/app/institute/**`
- `frontend/src/app/api/institute/**`
- `frontend/src/features/education/**`
- Institute-specific integrations in `frontend/src/middleware.js`, `frontend/src/app/layout.jsx`, `frontend/src/app/robots.ts`, `frontend/src/app/sitemap.ts`, `frontend/src/components/layout/Footer.jsx`, `frontend/src/components/providers/**`, `frontend/src/app/globals.css` and `frontend/next.config.mjs`
- `frontend/public/images/institute/**`
- `frontend/config/institute-initial-intakes.json`
- `frontend/database/migrations/001_institute_core.sql` through `005_institute_course_enquiries.sql`
- `frontend/scripts/*institute*`, `frontend/scripts/course-enquiry-e2e.mjs`
- Institute tests under `frontend/src/tests/**`
- Institute deployment documentation under `frontend/docs/**`
- Dependency, runtime and tooling changes in `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/vitest.config.ts`, `frontend/.env.example` and `frontend/.eslintignore`
- Root `.gitignore` rule excluding generated Institute build directories

## Exclude

- Every `frontend/.next*` directory and other generated build output
- Existing changes under `frontend/src/app/admin/**` that are unrelated to Institute administration
- Existing marketplace, catalogue, brands, product, category and search changes outside the Institute integration points listed above
- `marketing/**`
- Root media such as `techromz-ai-kickstart-launch-1080x1920.mp4`
- Secrets, local environment files, production data, database dumps and backup artifacts

Before any release commit is prepared, review the exact path list against this scope and keep all feature gates false. This document does not authorize staging, committing, pushing or deployment.
