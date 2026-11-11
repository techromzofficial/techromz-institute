# Course enquiry acceptance report ? v6 candidate

Full automated run: **617 passed, 0 failed, 12 skipped**, JSON in test-results-readiness-final.json. Skipped tests include the write MariaDB integration suite and opt-in runtime diagnostic. The diagnostic was also run explicitly once and reported BLOCKED; its test completion is not a successful DB connection.

The final focused report test-results-readiness-focused.json records 49 passed / 0 failed, covering later regression changes. PASS below is scoped to the evidence column; mocked unit success does not establish staging or production acceptance. All staging and production end-to-end enquiry tests remain BLOCKED. No real SMTP email or production write was attempted.

| Required test | Result | Executed evidence / limitation |
|---|---|---|
| Published course form opens | PASS | React Testing Library modal tests; no rendered-browser claim |
| Correct course displayed automatically | PASS | Modal tests and authoritative backend title resolution |
| Required fields validated | PASS | Server validation and modal validity tests |
| Valid email accepted | PASS | Validator and mocked challenge route tests |
| Invalid email rejected | PASS | Validation tests |
| Invalid course ID rejected | PASS | Course enquiry route test |
| Unpublished course rejected | PASS | Catalogue filtering / route rejection; hidden URLs checked separately by local HTTP smoke |
| OTP email delivered to real inbox | BLOCKED | No approved configured SMTP credentials/mailbox scope or receipt confirmation |
| Correct OTP accepted | PASS | Transactional datastore fixture; real SMTP/DB integration remains BLOCKED |
| Incorrect OTP rejected | PASS | OTP lifecycle fixture |
| Expired OTP rejected | PASS | Fake-clock lifecycle fixture |
| Reused OTP rejected | PASS | Single-use lifecycle fixture |
| Maximum OTP attempts enforced | PASS | Default-policy lifecycle test; stricter-policy regression recorded in focused results |
| Resend cooldown enforced | PASS | Lifecycle and API rate-limit tests |
| Identifier rate limit enforced | PASS | Atomic counter / route tests with doubles; actual MariaDB BLOCKED |
| Global rate limit enforced | PASS | Shared limiter and route tests with doubles; actual MariaDB BLOCKED |
| Email modification requires re-verification | PASS | In-flight result invalidation and mismatched-grant tests |
| Unauthorized submission rejected | PASS | Missing/mismatched grant/session tests |
| Successful enquiry persisted in actual MariaDB | BLOCKED | No isolated database credentials; persistence SQL tested with doubles only |
| Correct course association stored in actual MariaDB | BLOCKED | Authoritative title and slug SQL parameters verified locally; actual DB not exercised |
| Enrolments notification received | BLOCKED | No real SMTP delivery or inbox confirmation |
| Duplicate submission prevented | PASS | Persistence fixture and idempotent orchestration tests |
| Concurrent duplicate submission prevented in actual MariaDB | BLOCKED | Dedicated real-DB integration test skipped; do not infer DB locking behavior from fixture |
| Database failure handled safely | PASS | Mocked repository/rate-limit failure and transaction rollback cases |
| SMTP authentication failure handled safely | PASS | Delivery error classification test; real authentication failure NOT RUN |
| Notification failure recovery works | PASS | Outbox claim/retry/reconciliation tests with doubles; real DB/SMTP recovery BLOCKED |
| Network interruption handled safely | PASS | Modal failure preservation and server idempotent replay tests; real browser transport interruption NOT RUN |
| Desktop layout works | NOT RUN | Browser host unavailable; Windows fallback stopped because current URL could not be determined |
| Mobile layout works | NOT RUN | No trusted browser viewport/rendering session |
| Accessibility checks pass | NOT RUN | Labels/dialog/keyboard behavior have component coverage; no full browser or automated accessibility audit |
| Untrusted Origin rejected | PASS | Direct route/request-boundary regressions |
| Spoofed host or proxy headers rejected | PASS | Direct regressions; forwarded headers remain untrusted |
| Production disabled flag prevents live submissions | PASS | Feature flag/API tests plus local production-server flags false; deployed production state unverified |

Certificate tests: normal same-origin INVALID reaches HTTP 400 locally in a direct NextRequest test; a valid-format unknown ID returns not_found with mocked durable limits; hostile hosts/Origins, spoofed forwarded headers, abuse-mode failures, storage failure and quota denial are exercised. A valid authorized staging certificate is BLOCKED. No artificial production certificate was created.

Local HTTP smoke uses a production Next.js server on loopback with enquiry/admin/registration/payment/seat flags explicitly false. It checks all 7 department pages, all 37 published courses, all 7 hidden course URLs, certificate page, disabled public APIs, protected administration and the worker authentication boundary. The first run found 60 PASS / 1 FAIL: the delivery worker returned 404 because middleware omitted its route. The exact path was added; unknown worker subpaths remain blocked. Final rebuilt HTTP run: **61 PASS / 0 FAIL**. Results are recorded separately in http-smoke-readiness.json after rebuilding. This is server HTTP coverage, not browser, console, mobile, screenshot or actual OTP coverage.

Actual SMTP connection/authentication: BLOCKED. OTP inbox receipt: BLOCKED. Notification inbox receipt: BLOCKED. Database persistence/course association/concurrency: BLOCKED. Authentication and enquiry role restrictions: local mocked backend coverage only; authenticated staging sessions, logout/session expiry, certificate issuance, attendance and assessment operation remain BLOCKED. Existing schema and primitives are preserved; their existence does not establish full administrative functionality.

Do not activate production until the remaining matrix is executed on isolated staging with approved mailboxes and DB, then source, deployment and feature approvals are obtained separately.
