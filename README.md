# RepoForge Dashboard

RepoForge is a local-first repository health and cleanup dashboard. It makes active projects, experiments, upstream mirrors, CI state, and cleanup candidates understandable without performing destructive actions.

## Version 0.1

- Responsive repository health dashboard
- Search and category filters
- Health, activity, and CI summaries
- Safe cleanup recommendations
- Seeded data based on the current SpidermanTotro repository audit
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

1. GitHub API connector with read-only token support
2. Automated repository discovery
3. CI and pull-request health ingestion
4. Duplicate-content comparison
5. Exportable cleanup plans
6. Optional Electron desktop wrapper

RepoForge never deletes or archives repositories automatically.
