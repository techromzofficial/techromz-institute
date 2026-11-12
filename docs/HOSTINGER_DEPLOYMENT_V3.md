# Hostinger production source ZIP V3

Artifact: `deployment-output/techromzit-hostinger-deploy-v3.zip`.
This package preserves the existing App Router application and default `.next`
output. It uses Next.js SSR/API routes and `next start`, with neither static export
nor standalone output. Node.js 22.x is required; use 22.22.2 or newer when running
the complete development/test dependency set (jsdom's engine requirement).

## Upload procedure

1. Log into hPanel and select the existing `techromzit.com` Node.js website.
2. Open Deployments, choose Redeploy, then Source files > Upload new files.
3. Upload `techromzit-hostinger-deploy-v3.zip`. `package.json` is at its root.
4. Preserve framework Next.js, Node.js 22.x, root `/`, package manager npm,
   build command `npm run build`, output `.next`. If a start command is requested,
   use `npm run start`. Install build dependencies, including devDependencies;
   TypeScript, ESLint, PostCSS and Tailwind are needed by the builder.
5. Add environment variables in hPanel before building. Preserve
   `INSTITUTE_ONLY_MODE=true`, `NEXT_PUBLIC_APP_URL=https://techromzit.com`, and
   `INSTITUTE_ALLOW_INDEXING=false`. Public URL and routing/indexing configuration
   must be present at build time; redeploy after changing them.
6. Configure the server-only values below and the feature flags appropriate to
   the validated release. `.env.example` is a reference containing placeholders,
   not production credentials and not automatically loaded by Next.js.
7. Start deployment and inspect installation, build and runtime logs.
8. Test `/`, `/institute/courses`, individual course pages, navigation, mobile
   layouts, `/robots.txt` and `/sitemap.xml`. Verify indexing remains disabled.
9. Complete database, administrator, enrolment and enquiry activation checks
   below, then test the actual enabled server workflows.

Hostinger's current documented alternative to a direct Upload new files button is
Dashboard > Deployments > Redeploy > Source files > Upload new files:
https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/
Node.js ZIP deployments are described at:
https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
Use the Node.js website deployment builder, rather than a static file upload.
This preparation does not upload, deploy, alter DNS or change the live site.

## Runtime secrets and activation

Configure these server-only SMTP variables in hPanel:

```dotenv
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=YOUR_HOSTINGER_MAILBOX_EMAIL
SMTP_PASS=YOUR_HOSTINGER_MAILBOX_PASSWORD
SMTP_FROM_EMAIL=YOUR_HOSTINGER_MAILBOX_EMAIL
ENQUIRY_RECIPIENT_EMAIL=enrolments@techromzit.com
```

From must equal the authenticated mailbox. Existing `INSTITUTE_SMTP_HOST`,
`INSTITUTE_SMTP_PORT`, `INSTITUTE_SMTP_SECURE`, `INSTITUTE_SMTP_USER`,
`INSTITUTE_SMTP_PASSWORD` and `INSTITUTE_SMTP_FROM` remain supported. Corresponding
`SMTP_*` values take precedence, including explicit empty values. Configure one
scheme consistently. TLS certificate validation and the approved port 465 remain
mandatory. SMTP is resolved in server code at runtime; private modules use
`server-only`, and mail API handlers use the Node.js runtime.

The source includes homepage, course listing/details, enquiry modal, OTP,
registration/enrolment, administrator authentication, payment review, navigation,
footer and public images/icons/fonts. Institute mode intentionally retains the
existing restrictions on legacy Retail routes. The legacy Retail backend is not
included; disabling Institute mode requires a separate Laravel backend.

Features are implemented but disabled by default. SMTP settings alone do not
activate them. Before enabling enquiries:

- Supply `INSTITUTE_DB_HOST`, `INSTITUTE_DB_PORT`, `INSTITUTE_DB_NAME`,
  `INSTITUTE_DB_USER`, `INSTITUTE_DB_PASSWORD`; configure connection limit and TLS
  for your database network using `.env.example`.
- Supply three independent base64-encoded 32-byte values for
  `INSTITUTE_PII_ENCRYPTION_KEY`, `INSTITUTE_PII_LOOKUP_KEY`,
  `INSTITUTE_SESSION_HASH_KEY`. Preserve them securely across deployments.
- Back up the database, apply migrations 001 through 006 with
  `npm run db:migrate:institute`, then run `npm run db:status:institute`.
  Existing migrations use MariaDB-specific `ADD COLUMN IF NOT EXISTS` and
  `CREATE INDEX IF NOT EXISTS`; prefer MariaDB 10.6+ and validate against the
  actual server. Do not assume unmodified migrations run on MySQL 8.
- Validate/provision the approved catalogue and intakes separately using the
  included scripts and `config/institute-initial-intakes.json` as reviewed input.
- Set `INSTITUTE_ALLOWED_HOSTS=techromzit.com,www.techromzit.com`,
  `INSTITUTE_ABUSE_PROTECTION_MODE=identifier-and-global`, and
  `INSTITUTE_TRUSTED_CLIENT_IP_HEADER` to a single-IP header that the Hostinger
  ingress demonstrably overwrites. Verify this on the actual hosting network;
  production enquiries fail closed without it. Block direct backend access.
- Set `INSTITUTE_ENQUIRY_WORKER_SECRET` to a random secret of at least 32 characters.
  Arrange a scheduler to POST every minute to
  `https://techromzit.com/api/institute/course-enquiries/delivery` with
  `Authorization: Bearer <secret>`. Keep the credential in the scheduler secret
  store, never the URL. Confirm the hosting plan supports the scheduler or use an
  authenticated external scheduler. Allow up to 300 seconds per invocation.
- Validate the database/SMTP/security setup, set
  `INSTITUTE_COURSE_ENQUIRY_ENABLED=true`, redeploy, and check GET
  `/api/institute/course-enquiries` reports availability. Readiness is not proof
  of SMTP connectivity, a running scheduler, or inbox delivery.

See `institute-phase2-deployment.md` for separate administrator provisioning,
registration, payment and seat-availability activation. Preserve their flags
until validated. Certificate issuance/revocation/PDF generation remain disabled;
optional student acknowledgement mail is not enabled.

## Post-deployment verification

Open a course > Email enquiry, request the email OTP, enter it and submit an
enquiry. Confirm the record persists and the delivery worker changes its status
to `notified`; manually confirm inbox/spam receipt at enrolments@techromzit.com.
Test wrong/expired OTPs, resend limits, changed email, duplicate submission,
unauthorized worker requests and administrator access restrictions. Enquiry
acceptance means saved and queued; SMTP acceptance does not prove inbox delivery.
Test enrolment separately after its activation prerequisites are complete.

Validate mailbox activation, outbound SMTP reachability, SPF, DKIM, DMARC and
mailbox quotas on the hosting account. Local automated SMTP checks use mocks.
No live SMTP delivery, target database migrations or Hostinger proxy/runtime
integration is asserted by this ZIP preparation. See
`institute-course-enquiry-hostinger-activation.md` for operational detail.

## Packaging policy

Include application source, public assets, package/lock files, Next.js/Tailwind/
PostCSS/TypeScript/ESLint configuration, database migrations, operational scripts,
safe `.env.example`, and deployment/activation instructions. Keep the existing
source tests and their configuration so the packaged source can be checked.
Exclude node_modules, .next, .git, private environment files, keys/certificates,
database dumps, logs, coverage, caches, temporary files and previous ZIPs.
Validation results, inventory and SHA-256 are saved beside the archive, outside
the upload package. Do not commit the generated artifact.
