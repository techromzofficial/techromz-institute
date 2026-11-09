# Techromz Institute

Standalone Next.js source repository for the Techromz Institute website. The application is extracted from the Institute implementation in the Retail Eco System worktree, with the frontend placed at the repository root for Hostinger Web App deployment.

## Local validation

Use Node.js 22.x and npm:

```bash
npm ci
npm test
npm run type-check
npm run lint
npm run build
npm audit
```

The Institute homepage is served at `/` by default. Set `INSTITUTE_ONLY_MODE=false` only when intentionally running the legacy Retail app. All Institute write features and indexing are disabled by default. Copy `.env.example` only as a reference; never commit a populated `.env` file.

For UI-only local course enquiry testing without SMTP or a database, set `INSTITUTE_COURSE_ENQUIRY_LOCAL_TEST_MODE=true` in `.env.local` and run `npm run dev -- --hostname 0.0.0.0 --port 3200`. Set `INSTITUTE_DEV_ALLOWED_ORIGINS` to the computer's private IPv4 address (without a port), then restart the dev server. Open `http://<this-computer-private-ip>:3200` on this computer or another device on the same trusted private network. This mode is development-only, returns the OTP in the modal, and captures enquiries in an in-memory local outbox; it never sends email or persists enquiries. Only loopback and RFC1918 private IPv4 hosts are accepted. Keep this setting false for deployment.

## Deployment and source synchronization

- [Hostinger deployment](docs/HOSTINGER_DEPLOYMENT.md)
- [Keeping this repository synchronized](docs/SOURCE_SYNCHRONIZATION.md)
- [Institute release scope](docs/institute-release-scope.md)

Database migrations and feature activation require separate authorization. Creating or updating this repository does not deploy Hostinger, migrate a database, enable enquiries, or change `techromzit.com`.
