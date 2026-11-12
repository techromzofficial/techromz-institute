# Hostinger operator checklist

- Keep production course enquiry, administration, registration, payment and seat flags false. Activation approvals are separate from deployment approval.
- Confirm the intended public URL https://techromzit.com at build and runtime, Institute-only mode true, exact allowed hosts, and abuse mode identifier-and-global.
- Review all 31 settings in ENVIRONMENT_CONFIGURATION_REPORT.md privately against the runtime Node process. Never paste secrets into chat or logs.
- Confirm the intended database/account, port and SSL mode through read-only application-pool and phpMyAdmin queries. Compare server identity and version; retain the existing backup. Verify six applied checksums and twenty tables without rerunning migrations.
- Preserve three independent existing 32-byte base64 keys. Confirm their availability and separation without disclosure.
- Confirm the source-approved SMTP endpoint/port/TLS settings against the hosting account. Use one naming scheme or exactly matching aliases. From must match authenticated mailbox; recipient is fixed to enrolments@techromzit.com. Actual SMTP authentication, OTP inbox receipt and notification inbox receipt remain unverified.
- Confirm bounded OTP values: expiry 1..10 minutes, attempts 1..5, cooldown 60..900 seconds. Defaults are 5 / 5 / 60. Blank or out-of-range configured values fail closed.
- Supply a strong worker secret and an authenticated scheduled delivery worker only in an approved environment. Establish monitoring and reconciliation for uncertain deliveries.
- Confirm an ingress-overwritten single-IP header and block direct backend access before configuring INSTITUTE_TRUSTED_CLIENT_IP_HEADER. No guessed proxy trust is acceptable.
- Use temporary INSTITUTE_SECURITY_DIAGNOSTICS=true only for private fixed-code diagnosis; disable it afterwards. Never publish request/header reflection endpoints.
- Complete staging DB, SMTP, browser, certificate and role tests. Approve source baseline and exact archive checksum before requesting production deployment.
