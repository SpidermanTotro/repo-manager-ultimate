import { useMemo, useState } from "react";
import { repositories } from "./data";
import type { Health, RepoKind } from "./types";

const kindLabels: Record<RepoKind | "all", string> = {
  all: "All repositories",
  active: "Active",
  experiment: "Experiments",
  upstream: "Upstream",
  cleanup: "Cleanup",
};

const healthLabels: Record<Health, string> = {
  healthy: "Healthy",
  attention: "Needs attention",
  review: "Review",
};

function App() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RepoKind | "all">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return repositories.filter((repo) => {
      const matchesKind = kind === "all" || repo.kind === kind;
      const matchesQuery =
        !needle ||
        repo.name.toLowerCase().includes(needle) ||
        repo.description.toLowerCase().includes(needle) ||
        repo.language.toLowerCase().includes(needle);
      return matchesKind && matchesQuery;
    });
  }, [kind, query]);

  const healthy = repositories.filter((repo) => repo.health === "healthy").length;
  const attention = repositories.length - healthy;
  const cleanup = repositories.filter((repo) => repo.kind === "cleanup").length;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brandMark">RF</span>
          <div>
            <strong>RepoForge</strong>
            <span>Repository command centre</span>
          </div>
        </div>
        <button className="scanButton" type="button">
          <span aria-hidden="true">↻</span> Run health scan
        </button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">ACCOUNT OVERVIEW</p>
          <h1>Know what is healthy, what needs work, and what is safe to clean.</h1>
          <p className="heroCopy">
            A local-first dashboard for repository health, CI visibility, duplicates,
            upstream tracking, and deliberate cleanup.
          </p>
        </section>

        <section className="stats" aria-label="Repository summary">
          <article><span>Total tracked</span><strong>{repositories.length}</strong><small>across 4 categories</small></article>
          <article><span>Healthy</span><strong className="green">{healthy}</strong><small>verified checks passing</small></article>
          <article><span>Needs attention</span><strong className="amber">{attention}</strong><small>review before action</small></article>
          <article><span>Cleanup queue</span><strong className="violet">{cleanup}</strong><small>never delete automatically</small></article>
        </section>

        <section className="workspace">
          <div className="controls">
            <label className="search">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search repositories, languages, or descriptions"
              />
            </label>
            <div className="filters" aria-label="Repository type">
              {(Object.keys(kindLabels) as Array<RepoKind | "all">).map((value) => (
                <button
                  type="button"
                  className={kind === value ? "active" : ""}
                  onClick={() => setKind(value)}
                  key={value}
                >
                  {kindLabels[value]}
                </button>
              ))}
            </div>
          </div>

          <div className="tableHeader">
            <div>
              <h2>Repository health</h2>
              <p>{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
            </div>
            <span className="safeBadge">Safe mode enabled</span>
          </div>

          <div className="repoGrid">
            {filtered.map((repo) => (
              <article className="repoCard" key={repo.name}>
                <div className="repoTop">
                  <div>
                    <span className={`healthDot ${repo.health}`} />
                    <span className="kind">{kindLabels[repo.kind]}</span>
                  </div>
                  <span className={`healthPill ${repo.health}`}>{healthLabels[repo.health]}</span>
                </div>
                <h3>{repo.name}</h3>
                <p>{repo.description}</p>
                <dl>
                  <div><dt>Language</dt><dd>{repo.language}</dd></div>
                  <div><dt>Last activity</dt><dd>{repo.lastActivity}</dd></div>
                  <div><dt>Checks</dt><dd>{repo.checks}</dd></div>
                </dl>
                <div className="recommendation">
                  <span>Recommended</span>
                  <strong>{repo.recommendation}</strong>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="emptyState">
              <strong>No repositories match this view.</strong>
              <button type="button" onClick={() => { setQuery(""); setKind("all"); }}>Reset filters</button>
            </div>
          )}
        </section>

        <section className="principles">
          <div><span>01</span><h2>Inspect first</h2><p>Collect evidence before proposing a change.</p></div>
          <div><span>02</span><h2>Preserve history</h2><p>Archive and consolidate before considering deletion.</p></div>
          <div><span>03</span><h2>Verify fixes</h2><p>Build, lint, and test every repair before merging.</p></div>
        </section>
      </main>

      <footer>RepoForge 0.1 · Local-first · No destructive actions</footer>
    </div>
  );
}

export default App;
