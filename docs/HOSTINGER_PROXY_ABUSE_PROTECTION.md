# Hostinger proxy and course enquiry abuse protection

This is the current proxy/IP policy and supersedes older instructions requiring a trusted client-IP header before enquiries could become available. All five live feature flags remain false. No production hosting configuration, deployment, data, emails or migrations were changed.

## Hosting constraints and guarantees

The hosting constraints supplied by the operator are Hostinger Business Web Hosting with CDN, X-Real-IP recommended for CDN-routed visitor identification, no verified direct-origin isolation, and no documented cryptographically authenticated proxy identity or origin firewall allowlist for this deployment. This implementation does not infer stronger guarantees. It does not discover or invent trusted CDN IP ranges, claim to block direct-origin requests, or use HTTP headers as proof of a proxy's identity.

Host, Origin and Sec-Fetch-Site restrict expected browser request context; a non-browser direct-origin caller can supply matching headers. The application still requires an exact approved Host equal to the Next request URL authority, an approved hostname, production HTTPS in request.url, canonical matching Origin and same-origin fetch metadata where present. Forwarded, X-Forwarded-Host and X-Forwarded-Proto do not override those checks. No reverse-proxy HTTPS/hostname bypass was added. Any internal-HTTP/public-HTTPS mismatch remains a separate hosting diagnosis; spoofing protocol headers cannot resolve it.

The historical variable INSTITUTE_TRUSTED_CLIENT_IP_HEADER may remain X-Real-IP as requested. The name does not confer trust. requestSecurity.unverifiedClientIp reads only that explicitly configured header, accepts one syntactically valid IPv4/IPv6, and treats it solely as a caller-controlled hint. Missing, malformed or list values return null; there is no fallback header, first-IP selection, user identity, authorization or primary rate-limit exemption. No IP header is required for readiness.

An attacker may rotate hints to evade a supplementary IP bucket, or spoof a victim's hint to consume that bucket. The same request still consumes/checks all primary buckets first. Application code cannot establish that requests passed through the CDN or that a visitor IP is authentic under the stated hosting constraints. Those guarantees would require independently enforced ingress isolation/authentication, if the hosting platform later supports it.

## Primary database-backed limits

The existing shared limiter uses transactions, parameterized SQL, an atomic INSERT/ON DUPLICATE KEY UPDATE and a SELECT FOR UPDATE in institute_rate_limits. Keys are HMAC-SHA256(scope + subject) with INSTITUTE_SESSION_HASH_KEY; raw emails, session IDs and IP hints are not stored in counter subject_hash. Email inputs are trimmed/lowercased before rate checks, and contact persistence also uses the existing private lookup HMAC. Limiter policies require positive safe integers and returned counter/retry state must be valid; missing rows, invalid state, key/configuration errors and database errors fail closed before OTP verification, enquiry persistence or email dispatch. A database failure never falls back to process memory or IP-only allowance.

| Operation | Primary counters | Supplementary counter, after primary checks |
|---|---|---|
| OTP request | Global 120/15 min; normalized email 1/configured cooldown and 12/day; mailbox 45/day; signed enquiry session 20/15 min | Unverified IP hint 20/15 min |
| OTP verification | Global 300/15 min; challenge ID 6/15 min; signed enquiry session 30/15 min | Unverified IP hint 60/15 min |
| Enquiry submission | Global 60/hour; verified normalized email 3/hour; mailbox 100/day; signed session 6/hour | Unverified IP hint 10/15 min |

These are fixed-window request counters. Resends also use the existing persistent per-email lock/cooldown and at most four OTP issuances per rolling 15 minutes. Failed OTP attempts are tracked under a database row lock (default five, configurable downwards); expiry defaults five minutes (bounded 1..10), cooldown defaults 60 seconds (bounded 60..900), and verified codes are single-use. Resend invalidates prior codes/grants under the existing policy. OTPs are crypto.randomInt values stored only as keyed per-challenge digests and never returned/logged publicly. Verification grants are bound to normalized email, purpose, course context and the authenticated enquiry session; changing headers does not change those bindings.

Counter requests which fail one primary bucket can still increment other primary buckets: partial counter commits are conservative and never authorize an operation. Primary limits count valid operation requests after guards/body/course checks; they do not guarantee resistance to connection floods or unbounded malformed traffic at the hosting edge. Global and mailbox caps may be deliberately exhausted to deny service, especially when bots rotate email addresses and obtain new sessions. Clearing cookies and obtaining another legitimate server-issued session cannot reset email/global limits. Session signatures prove server issuance, not a unique human. No application-only bot-proof or DDoS guarantee is claimed.

## Session authenticity and duplicate protection

The enquiry cookie retains its name, HttpOnly, SameSite=Strict, /api/institute path and Secure in production. It now contains a server-generated random 32-byte ID, expiry and domain-separated HMAC using the existing session hash key. The server validates MAC and expiry rather than accepting any client-chosen 43-character string. IDs are used for primary session counters and existing course-bound verification/idempotency; the cookie is not proxy identity or a staff login. It expires after twenty minutes. Reusing the same session and idempotency key with the same normalized payload returns the existing enquiry; changing only IP cannot create another row. The database uniqueness constraint and transaction/grant consumption remain; no schema migration or new secret is required.

Deployment compatibility: previously unsigned cookies are rejected, and affected in-flight users must obtain/verify another OTP. Existing encrypted enquiries and migration history remain untouched. Coordinate any future approved deployment while flags are disabled. Retries after cookie expiry/new sessions and deliberate new idempotency keys are separate submissions, so operational deduplication is still needed for prospect follow-up; no promise of lifelong email deduplication is made.

## Remaining operational controls

Keep INSTITUTE_COURSE_ENQUIRY_ENABLED, INSTITUTE_ADMIN_ENABLED, INSTITUTE_REGISTRATION_ENABLED, INSTITUTE_PAYMENT_ENABLED and INSTITUTE_SEAT_AVAILABILITY_ENABLED=false. The existing bearer-authenticated delivery worker remains separately gated. Primary limiter tables/keys, migrations/checksums, stable clocks, SMTP capacity, outbox scheduling/monitoring, approved staging mailboxes and actual database/inbox delivery must be validated before activation. No production settings should be changed merely to match the sanitized .env.example.

The implementation is locally reviewable. Real Hostinger origin isolation, deployed request URL behavior, intended MariaDB connectivity/concurrency and SMTP/inbox receipt remain unverified. No production POSTs, origin probes, email or high-volume tests are part of this task. Test evidence and exact results are recorded in deployment-output/proxy-security/ and appended below after verification.


## Exact changes in this patch

| File | Change |
|---|---|
| src/features/education/administration/requestSecurity.ts | Replace the misleading trustedClientIp/header-readiness API with unverifiedClientIp; optional validated hint only, no fallback or proxy identity claim. Host/Origin/HTTPS guards unchanged. |
| src/features/education/administration/rateLimit.ts | Retain transactional database/HMAC limiter; reject invalid policy integers and missing/malformed counter state. |
| src/features/education/administration/enquirySession.ts | Sign server-issued random session IDs and expiry with the existing session key; reject unsigned, tampered and expired cookies. Existing cookie security attributes retained. |
| src/app/api/institute/contact-verification/challenge/route.ts | Normalize email; check unchanged global/email/cooldown/mailbox limits plus a new session limit before any optional IP hint. Sign accepted session cookies. |
| src/app/api/institute/contact-verification/verify/route.ts | Require authenticated enquiry session, preserve challenge/global and DB OTP checks, add session limit; optional IP check comes last. |
| src/app/api/institute/course-enquiries/route.ts | Remove IP-header availability prerequisite; require signed session; preserve email/global/mailbox and transactional idempotency; add session cap before supplementary IP check. Existing worker/OTP configuration gates preserved. |
| src/tests/institute-header-spoofing.test.ts | New route-level spoofing/direct-origin/session/storage/duplicate regressions using real limiter, signing and enquiry SQL services with an isolated transactional SQL double; OTP service/mail delivery doubled. |
| Existing proxy, environment, contact and enquiry route tests | Update assertions for optional unverified hints, signed sessions, additional primary session buckets and no IP readiness dependency. |
| .env.example | Document X-Real-IP as optional unverified supplementary input; preserve five disabled flags and all secret placeholders. |
| Prior proxy/environment documentation | Add explicit supersession notices rather than rewriting historical test results. |

Pre-existing uncommitted environment/worker/SMTP audit edits have been preserved. They are not claimed as newly implemented by this patch. No dependency, SQL migration, production secret or database content was changed. The old v6 ZIP was preserved and does not include these changes; a new candidate must be separately reviewed for any future deployment.

## Regression matrix and evidence scope

| Required case | Executed local evidence |
|---|---|
| Spoofed X-Real-IP / changed email-session combinations | Route tests rotate X-Real-IP with the same normalized email and independently enforce the same signed-session caps. |
| Direct-origin assumptions | Matching Host/Origin is explicitly shown not to prove CDN traversal; an exhausted primary email bucket still blocks the request. No live origin probe was performed. |
| Same email, different IP hints and sessions | First request accepted; subsequent requests rejected by persistent normalized-email cooldown regardless of hint/session rotation. |
| Same signed session, different IPs/emails/challenges | Session request/verification/submission caps remain attached to server-issued ID. |
| Global limits | Exhausted shared global counter blocks a new session/challenge/IP. |
| OTP expiry / attempts / replay / resend | Existing fake-clock transactional OTP lifecycle tests exercise expiry, five-attempt/default and stricter policies, one-use consumption and resend cooldown/replacement. |
| Duplicate enquiries | Real enquiry SQL service returns one stored reference when retrying identical content/session/key with a different IP, using a transactional SQL double. |
| Rate-limit storage/configuration failure | Challenge/verification/submission return controlled unavailable responses before delivery, verification or persistence when primary storage fails; malformed counters/unsafe policies fail closed. |
| Legitimate requests | Valid signed session, published course and primary quotas pass even without an IP hint; primary prerequisites still determine availability. |
| Host/Origin/HTTPS/header protocol spoofing | Existing request-security regressions rerun without guard relaxation. |
| All live feature gates | Existing explicit-default tests rerun; template and build process keep five flags false. |

Focused run: 60 tests passed across 8 files, exit 0. Broader Institute/course/certificate run: **196 tests passed, 12 skipped**, 31 files passed / 2 skipped, exit 0. The skipped tests are the real MariaDB write suite and opt-in read-only runtime diagnostic; they are not passes. Logs are in deployment-output/proxy-security/tests.log and regression-tests.log. Lint, type checks and the production build all passed with exit 0. Machine-readable results are in deployment-output/proxy-security/validation-results.json.

These results establish local source-level regression behavior, not actual MariaDB lock/concurrency guarantees, deployed Hostinger runtime behavior or SMTP/inbox receipt. Those remain pending isolated staging validation. Primary limits cannot prevent infrastructure-level floods, widespread email/session rotation from exhausting shared quotas, forged supplementary-IP harassment, or growth of retained counter rows without operational retention/monitoring. No proxy identity, bot-proofing or unlimited availability guarantee is claimed.


All application instances must share the same primary limiter database and consistent HMAC keys/policies. Changing keys can partition/reset counter identities and invalidate cookies/grants; no key rotation is required for this patch. Keep counter retention and capacity under operational review; no expired production rows were deleted by this task.

Production-readiness status: **source/local security regressions passed; live features remain disabled**. Primary abuse protection does not depend on an authenticated IP source or a newly invented proxy mechanism. Activation still needs real isolated staging DB/concurrency evidence, actual OTP/notification receipt, ordinary HTTPS/Host/Origin behavior and separate deployment/activation approval. Local Node is 22.20.0; installed jsdom declares ^22.22.2 within Node 22, so align the supported staging toolchain and repeat acceptance. No complete vulnerability clearance, CDN traversal guarantee or production enquiry success is claimed.
