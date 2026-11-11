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

Course enquiries require the configured database, SMTP email verification and scheduled delivery worker. Public routes do not expose OTPs or a local outbox. See [course enquiry activation](docs/institute-course-enquiry-hostinger-activation.md) and [V3 ZIP deployment](docs/HOSTINGER_DEPLOYMENT_V3.md).

## Deployment and source synchronization

- [Hostinger deployment](docs/HOSTINGER_DEPLOYMENT.md)
- [Hostinger course enquiry deployment V4](docs/HOSTINGER_DEPLOYMENT_V4.md)
- [Hostinger course enquiry deployment V5](docs/HOSTINGER_DEPLOYMENT_V5.md)
- [Keeping this repository synchronized](docs/SOURCE_SYNCHRONIZATION.md)
- [Institute release scope](docs/institute-release-scope.md)

Database migrations and feature activation require separate authorization. Creating or updating this repository does not deploy Hostinger, migrate a database, enable enquiries, or change `techromzit.com`.
