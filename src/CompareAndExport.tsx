import { useState } from "react";
import { compareRepositories } from "./github";
import type { Repository, TreeComparison } from "./types";

interface Props { owner: string; repositories: Repository[]; }

export function CompareAndExport({ owner, repositories }: Props) {
  const [left, setLeft] = useState(repositories[0]?.name ?? "");
  const [right, setRight] = useState(repositories[1]?.name ?? "");
  const [result, setResult] = useState<TreeComparison | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const compare = async () => {
    setBusy(true); setMessage(""); setResult(null);
    try { setResult(await compareRepositories(owner, left, right)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Comparison failed."); }
    finally { setBusy(false); }
  };

  const exportPlan = () => {
    const plan = {
      generatedAt: new Date().toISOString(),
      owner,
      safeMode: true,
      repositories: repositories.map(({ name, kind, health, recommendation, lastActivity }) => ({
        name, kind, health, recommendation, lastActivity,
      })),
    };
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `repoforge-cleanup-plan-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className="toolbox">
      <div className="toolboxHead">
        <div><p className="eyebrow">SAFE TOOLS</p><h2>Compare before consolidating</h2></div>
        <button type="button" onClick={exportPlan}>Export cleanup plan</button>
      </div>
      <div className="compareControls">
        <label>First repository<select value={left} onChange={(event) => setLeft(event.target.value)}>
          {repositories.map((repo) => <option key={repo.name}>{repo.name}</option>)}
        </select></label>
        <span>versus</span>
        <label>Second repository<select value={right} onChange={(event) => setRight(event.target.value)}>
          {repositories.map((repo) => <option key={repo.name}>{repo.name}</option>)}
        </select></label>
        <button type="button" onClick={compare} disabled={busy}>{busy ? "Comparing…" : "Compare trees"}</button>
      </div>
      {message && <p className="compareError">{message}</p>}
      {result && <div className="compareResult">
        <article><span>First files</span><strong>{result.leftFiles}</strong></article>
        <article><span>Second files</span><strong>{result.rightFiles}</strong></article>
        <article><span>Shared paths</span><strong>{result.sharedPaths}</strong></article>
        <article><span>Identical files</span><strong>{result.identicalFiles}</strong></article>
        <p>Tree comparison is evidence only. Review unique paths and history before archiving either repository.</p>
      </div>}
    </section>
  );
}
