> Current proxy/IP policy: see [HOSTINGER_PROXY_ABUSE_PROTECTION.md](HOSTINGER_PROXY_ABUSE_PROTECTION.md). Older trusted-header prerequisites below are historical and superseded; IP headers are now optional unverified supplementary hints.

# Hostinger security without trusted client IP

## Security decision

The Institute application does not trust `X-Real-IP`, `X-Forwarded-For`, or any other HTTP client-address header. Hostinger has not confirmed that this website's origin is CDN-only, and a direct-origin caller may supply those headers. Next.js 15 route handlers also provide no independent socket peer address.

Sensitive routes fail closed unless all of the following are configured:

```text
INSTITUTE_ABUSE_PROTECTION_MODE=identifier-and-global
INSTITUTE_ALLOWED_HOSTS=techromzit.com,www.techromzit.com
```

This mode uses MariaDB atomic counters keyed with `INSTITUTE_SESSION_HASH_KEY`. It combines endpoint-global counters with purpose-specific identifiers:

| Operation | Independent counters |
| --- | --- |
| Email challenge | endpoint global, normalized email cooldown, normalized email daily limit, SMTP mailbox daily limit |
| Code verification | endpoint global, challenge ID |
| Registration | endpoint global, verified email, single-use grant, resolved student identity |
| Administrator login | endpoint global, normalized administrator account, database account lockout |
| Certificate lookup | endpoint global, normalized certificate ID |

Limiter subjects are keyed-hashed before storage. Email addresses, grants, administrator names, student IDs, and certificate IDs are not stored in plaintext rate-limit records.

## Request boundary

Sensitive POST routes require an exact configured hostname, a matching same-origin `Origin`, HTTPS in production, and (when present) `Sec-Fetch-Site: same-origin`. Localhost is added only outside production. This reduces accidental host confusion and cross-site browser submission, but it is not proof that traffic passed through Hostinger CDN: a direct-origin client can supply the expected Host and TLS SNI.

## Residual denial-of-service risk

Without a trustworthy client address or an approved external bot challenge, no application-only design can distinguish many rotating attackers from legitimate first-time users before an identifier is supplied. Global counters are therefore necessary backstops and can themselves be exhausted. The configured ceilings are deliberately higher than identifier limits, so ordinary abuse is contained by email, challenge, grant, account, student, or certificate buckets before the shared bucket.

The SMTP mailbox counter is intentionally shared. Exhausting it can pause all verification delivery, but prevents the Hostinger trial mailbox limit from being exceeded. The application does not retry indefinitely and does not create a usable grant until delivery succeeds.

Escalation controls are operational: keep feature gates disabled, temporarily disable the affected endpoint, review private application/CDN logs, apply Hostinger edge/WAF controls, or later add a server-verified anti-bot provider after explicit approval. Do not increase SMTP limits merely to restore availability.

## Staging validation

Use an isolated staging database, staging hostname, and non-production mailbox or mocked transport. Do not add an IP/header reflection endpoint.

1. Apply migrations 001 through 004 with the tracked migration runner and verify their checksums.
2. Configure all required secrets, the two settings above, and HTTPS. Keep registration/admin/seat feature gates false initially.
3. Confirm an unexpected Host, missing/mismatched Origin, and cross-site fetch metadata all return `503` before database work.
4. Rotate forged `X-Real-IP` and `X-Forwarded-For` values. Verify certificate, challenge, registration, and login counters remain attached to the same global and identifier subjects.
5. Confirm each identifier threshold returns `429` without consuming or creating a registration, session, challenge grant, certificate, payment, reservation, or enrolment.
6. Confirm the shared SMTP ceiling blocks delivery before an SMTP connection is opened.
7. Verify a legitimate request below every threshold succeeds, then verify single-use grants cannot be replayed.
8. If authorized, attempt a harmless direct-origin request using the staging hostname. It may reach the application, but forged IP headers must not alter any limiter decision.
9. Restore all feature gates to false after validation.

Production activation remains blocked until migration 004, runtime secrets, hostname configuration, HTTPS, database backups, SMTP credentials/capacity, first-admin provisioning, and the complete staging procedure are verified.

## References

- Hostinger, “CDN visitor IP addresses in logs and analytics”: https://www.hostinger.com/support/hostinger-cdn-visitor-ip-addresses-in-logs-and-analytics/
- Next.js 15 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-15
