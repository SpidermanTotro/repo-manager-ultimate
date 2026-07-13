# RepoForge Dashboard

RepoForge is a local-first repository health and cleanup dashboard. It makes active projects, experiments, upstream mirrors, CI state, and cleanup candidates understandable without performing destructive actions.

## Version 0.5

- Responsive repository health dashboard
- Search and category filters
- Health, activity, and CI summaries
- Safe cleanup recommendations
- Seeded fallback data based on the current SpidermanTotro repository audit
- Live read-only scan of public GitHub repositories
- Loading, API failure, and public rate-limit handling
- Automatic metadata classification and activity signals
- On-demand open pull-request counts
- Latest GitHub Actions workflow status and date
- Explicit no-workflow, unavailable, pending, success, and failure states
- Read-only recursive tree comparison for duplicate review
- Downloadable JSON cleanup-plan exports
- Security-hardened Electron desktop wrapper
- Isolated renderer with Node integration disabled
- External navigation restricted to GitHub links
- Explicit non-destructive design

## Run locally

```bash
npm install
npm run dev
```

Open the Vite address shown in the terminal.

## Run as a desktop application

```bash
npm install
npm run desktop
```

For Vite live development, start `npm run dev` and then run:

```bash
REPOFORGE_DEV_URL=http://localhost:4173 npm run desktop:dev
```

## Validate

```bash
npm run build
```

## Planned next steps

1. Optional read-only token support for higher API limits
2. Signed desktop installers

RepoForge never deletes or archives repositories automatically.
