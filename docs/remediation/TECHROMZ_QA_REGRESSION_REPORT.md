# QA and regression evidence

Candidate remains uncommitted and is not cleared for production. No interrupted run is counted as passing. Evidence files are local, ignored artifacts in deployment-output/validation.

| Check | Executed result |
|---|---|
| TypeScript | PASS, exit 0, 70.783 seconds; final production builds also perform semantic checking |
| ESLint | PASS, exit 0, 249.458 seconds, no warnings/errors |
| Production build | PASS final candidate: exit 0, 371.388 seconds, including lint, type validity and 162 static pages; earlier builds also passed |
| Source/publication/schema checker | PASS: 37 public, seven hidden, seven departments, approved dates/fees, eligible CourseInstance, hidden/demo schema exclusion, script-delimiter round-trip |
| Controlled Node source/API group | PASS, 57/57 tests across nine files; mocked/double-based validation, OTP, queue/delivery, certificate failures, provisioning, staging and SEO |
| Course page focused regression | PASS, 11/11 tests |
| Branding and confirmed-content QA | PASS in completed focused process-worker run; initial stale assertions fixed |
| Final complete Vitest process-worker run | PASS: exit 0, 110 files passed, two existing opt-in files skipped; 691 tests passed, 12 skipped, zero failed; 244.47-second Vitest duration / 263.34-second bounded runner |
| Earlier diagnostic VM-process retry | COMPLETED FAILED: 112 files, 703 tests; 94 files passed, 16 failed, two skipped; 645 tests passed, 46 failed, 12 skipped; 11 unhandled errors; runner 317.429 seconds |
| Local production HTTP crawl | PASS: all 37 course routes and seven departments return 200; seven unpublished courses return 404; all public course pages have HTML and HTTP noindex; no course JSON-LD emitted with indexing disabled |
| Security HTTP smoke checks | PASS for disabled unauthenticated endpoints: dashboard/enquiries 503, registrations/delivery GET 405, local outbox 404, legacy /admin/analytics 404; these checks do not prove enabled-state authorization |
| Canonical/social/robots/sitemap HTTP | PASS: trusted homepage canonical, OG/Twitter tags, noindex header and HTML, robots Disallow /, hidden courses absent from sitemap |
| Disconnected staging preflight | Expected BLOCKED, exit 2: missing isolated DB, keys, mailbox and approved recipients; networkAttempted=false, databaseAttempted=false, emailSent=false |
| Responsive/keyboard browser smoke | PASS: six routes at 390/768/1440 pixels (18 renders), no horizontal overflow, one h1/main each; mobile menu Enter operation and visible Tab focus; homepage/mobile-menu screenshots visually inspected |
| Real DB/SMTP/certificate fixtures | BLOCKED: isolated credentials/resources not supplied; no real student records used and no email sent |

Runner diagnosis: installed jsdom 30.0.1 requires Node ^22.22.2; default Node is 22.20.0. Official portable v22.22.2 passed Authenticode verification and standalone jsdom initialization in 26.103 seconds. TypeScript used about 1.18 GB memory and 21.84 seconds reading files. The host has 8 GB RAM and observed free memory often below 1 GB. The first full process-worker run hit its 600-second limit while heavy work overlapped. The final compatible-runtime process-worker run, executed alone after caches warmed, completed in 263.34 seconds. VM-pool failures did not reproduce with regular process isolation; this implicates that diagnostic pool/configuration rather than proving production regressions. The mismatch, cold-start cost and resource contention are supported findings; no single cause is asserted for every historical stall. Avoid overlapping heavy commands when reproducing. No test files were excluded or assertions removed to obtain success.

Executed failures identified stale approved-date/order/copy assertions and a missing sanitized staging template. These were corrected. The initial HTTP crawl exposed missing X-Robots-Tag; middleware was corrected and the repeated crawl passed. The diagnostic VM retry reported legacy marketplace/mock failures and CLI timeouts. All of those files pass in the final regular process-worker suite; no marketplace business logic was changed to force those results.

Final Lighthouse 12.8.2, Chrome headless, local production homepage after footer/favicon corrections:

| Preset | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| Mobile | 95 | 100 | 100 | 69 |
| Desktop | 100 | 100 | 100 | 69 |

No runtime error. SEO failed crawlability because indexing is intentionally disabled; do not enable indexing to improve a score. Before fixes accessibility and best practices were 96, with footer copyright contrast and a missing favicon request. Both audits now pass after a small footer contrast correction and icon reference to the existing approved logo. Images and layout were preserved. These are local single-run measurements, not hosted performance guarantees. Raw JSON files are lighthouse-mobile.json and lighthouse-desktop.json; before-fix reports were preserved separately.

Reproduce with compatible Node (portable executable is local and ignored):

```powershell
& deployment-output/node-22.22.2.exe scripts/run-bounded-validation.mjs types
& deployment-output/node-22.22.2.exe scripts/run-bounded-validation.mjs lint
& deployment-output/node-22.22.2.exe scripts/run-bounded-validation.mjs tests
& deployment-output/node-22.22.2.exe scripts/run-bounded-validation.mjs build
& deployment-output/node-22.22.2.exe scripts/check-audit-source.cjs
# Start the completed build on port 3100 in a separate terminal, then:
& deployment-output/node-22.22.2.exe scripts/check-audit-http.cjs
```

Optional full-suite diagnostic: set VALIDATION_TEST_POOL=vmForks before the bounded tests command. Pool choice does not reduce suite membership. Logs and JSON report capture exit codes and elapsed time. Build limit is 600 seconds, the standard-pool full-suite retry limit is 1,200 seconds (first run timed out at 600), lint 300 seconds and types 180 seconds. External schema validators, approved-staging browser/assistive-technology acceptance, enabled-state admin acceptance and hosting/CDN behavior remain required before release. Local browser smoke is recorded above; it does not cover every assistive technology or all route interactions.

Earlier VM-pool failures included admin-layout, catalogue approval/live/brand/quality fixtures, customer panel, order detail, returns queue, proxy/contact-verification/worker fixtures, two CLI timeouts and a stale Arts count. The stale count, private staging ignore pattern and CRLF portability were corrected. All files pass with regular process isolation. Preserve tests-vmForks.log/json and tests-forks-timeout.log/json as diagnostic history, not final acceptance results.

Final built candidate HTTP crawl repeated successfully after footer/favicon edits; noindex, route visibility and private-endpoint rejection remain intact. The final standard process-worker full suite passed. The 11 MariaDB integration tests and one operator-only runtime diagnostic retain their original opt-in conditions; no skip was added for this remediation. They remain external acceptance requirements.

Expanded final HTTP acceptance also passes all 44 course/department canonicals, department title normalization and unauthenticated admin-registration/worker POST rejection. Server stopped after verification.

Final evidence: tests.json (exit 0, pool forks), tests-results.json (703 total / 691 passed / 12 skipped / zero failed), build.json (exit 0, 371.388 seconds), http.json (passed true), controlled-node-tests.json (57/57), and final desktop/mobile Lighthouse JSON. Non-fatal test output includes React 18 fetchPriority/SVG-mock warnings and a Vite future-config-loader warning; production Lighthouse console audit passes.

Browser evidence: browser.json/log; home-390.png, home-768.png, home-1440.png and mobile-menu-focus.png. Routes: homepage, Mobile Kickstart, Arts & Languages department, contact, certificate verification and disabled admin shell. No enquiry or certificate form was submitted. An initial browser script assumed every navigation would return 200 and encountered a valid cached 304; caching was disabled for the successful fresh-response run. Reproduce with Node scripts/check-audit-browser.cjs <absolute installed puppeteer-core directory>; browser tooling was reused from the pinned Lighthouse npm cache and was not added to project dependencies. Local server was stopped afterward.
