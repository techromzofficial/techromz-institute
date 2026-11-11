# Certificate verification investigation ? 11 November 2026

**Production root cause: BLOCKED / not confirmed. This candidate does not claim to fix the deployed 503.** No authenticated Hostinger runtime or deployed-source fingerprint was available. No production verification POST was sent, and no production rate-limit bucket was consumed.

The exact route is `src/app/api/institute/certificates/verify/route.ts`. Before this change the first statement combined `!isIdentifierRateLimitMode()` and `!isAllowedSensitiveRequest(request)` into the same 503. `INVALID` never reached ID validation if either guard failed.

| 503 path | Dependencies / evidence needed |
|---|---|
| Abuse mode or request boundary | Mode must equal `identifier-and-global`; approved host, Host/URL authority equality, HTTPS in production, exact Origin, same-origin fetch metadata |
| Rate-limit storage | Actual application pool, valid session hash key, migration 004 and atomic counter writes |
| Repository configuration | Server-only database configuration and durable MySQL repository |
| Repository lookup | Reachable MariaDB, intended schema and certificate query success |

`requestSecurity.ts` reads `request.url`, Host, Origin and Sec-Fetch-Site. It does not use X-Forwarded-Host, X-Forwarded-Proto or Forwarded as authority. `request.nextUrl` is not needed by this certificate handler. Hostinger request URL/proxy/port values were not available. Internal HTTP versus public HTTPS and internal host mismatch remain hypotheses, alongside mode, runtime settings, DB and deployed-source mismatch.

Implemented: fixed-code diagnostics behind server-only `INSTITUTE_SECURITY_DIAGNOSTICS=true`, default false. Codes are `abuse_mode_configuration`, `allowed_hosts_configuration`, `host_url_mismatch`, `hostname_not_allowed`, `https_required`, `origin_missing`, `origin_invalid`, `origin_mismatch`, `cross_site_request`, `rate_limit_storage_unavailable`, `certificate_repository_unconfigured`, `certificate_repository_unavailable`. No raw headers, URL, certificate ID, error payload or secrets are logged. Diagnostics have no public endpoint. Disable the switch after diagnosis; protect runtime log access.

Also bounded certificate JSON to 32 KiB, required JSON content type, rejected malformed Origin values containing paths/credentials, and rejected partially invalid production host configuration. Normal same-origin `INVALID` is expected to return HTTP 400 / outcome `invalid`; a syntactically valid unknown ID returns HTTP 200 / `not_found` once durable rate limits succeed. Infrastructure failures remain 503. Regression results and their mocked scope are in the test report.

Operator action: confirm the approved deployed commit/ZIP, collect one fixed failure code from an authorized staging reproduction, and privately inspect the corresponding request construction and configuration. If HTTP termination is the cause, Hostinger must establish an authenticated/isolated backend boundary and documented overwritten proxy metadata before a trusted-proxy change can be designed. Do not set a guessed trust flag or trust forwarded headers merely because they exist. Repeat the invalid-ID check on staging after correcting the confirmed cause; a production deployment still requires approval.
