# Hostinger staging Web App configuration

Do not connect or redeploy staging until separately authorized.

When authorization is granted, connect the private GitHub repository `techromzofficial/techromz-institute` to the existing Hostinger staging Web App with these settings:

- Branch: `main`
- Application root: `./`
- Framework: Next.js
- Node.js: 22.x
- Package manager: npm
- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm run start`

Set `INSTITUTE_ONLY_MODE=true` for the Institute staging Web App. Keep all of the following values `false`:

```text
INSTITUTE_ALLOW_INDEXING=false
INSTITUTE_ADMIN_ENABLED=false
INSTITUTE_REGISTRATION_ENABLED=false
INSTITUTE_PAYMENT_ENABLED=false
INSTITUTE_SEAT_AVAILABILITY_ENABLED=false
INSTITUTE_COURSE_ENQUIRY_ENABLED=false
```

Do not configure database or SMTP credentials merely to prove the application builds. Server-only database, encryption, session and SMTP values may be added to Hostinger only during a separately approved activation process. Never put them in GitHub, `.env` files, build logs, or `NEXT_PUBLIC_*` variables.

After connecting, confirm the first staging deployment uses Node 22, runs `npm ci`, builds from `./`, and remains non-indexable. Do not point production DNS, change `techromzit.com`, run migrations, provision administrators, send diagnostic mail, or enable any feature flag as part of the repository connection.
