# RepoForge Dashboard

RepoForge is a local-first repository health and cleanup dashboard. It makes active projects, experiments, upstream mirrors, CI state, and cleanup candidates understandable without performing destructive actions.

## Version 0.4

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
- Explicit non-destructive design

## Run locally

```bash
npm install
npm run dev
```

Open the Vite address shown in the terminal.

## Validate

```bash
npm run build
```

## Planned next steps

1. Optional read-only token support for higher API limits
2. Optional Electron desktop wrapper

RepoForge never deletes or archives repositories automatically.
