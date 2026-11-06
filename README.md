# Techromz Institute

Standalone Next.js source repository for the Techromz Institute website. The application is extracted from the Institute implementation in the Retail Eco System worktree, with the frontend placed at the repository root for Hostinger Web App deployment.

## Local validation

Use Node.js 22.x and npm:

```bash
npm ci
npm test
npm run type-check
npm run lint
INSTITUTE_ONLY_MODE=true npm run build
npm audit
```

All Institute write features and indexing are disabled by default. Copy `.env.example` only as a reference; never commit a populated `.env` file.

## Deployment and source synchronization

- [Hostinger deployment](docs/HOSTINGER_DEPLOYMENT.md)
- [Keeping this repository synchronized](docs/SOURCE_SYNCHRONIZATION.md)
- [Institute release scope](docs/institute-release-scope.md)

Database migrations and feature activation require separate authorization. Creating or updating this repository does not deploy Hostinger, migrate a database, enable enquiries, or change `techromzit.com`.
