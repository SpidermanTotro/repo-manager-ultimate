import type { Health, RepoKind, Repository } from "./types";

const API_ROOT = "https://api.github.com";
const ACTIVE_REPOS = new Set([
  "AgentFoundry-instantly",
  "azeroth-pilot-reloaded-Pro-",
  "NebulaUltimate",
  "repo-manager-ultimate",
  "book-publish-forge",
  "AgentFoundry-TrinityCore-Studio",
]);
const UPSTREAM_REPOS = new Set([
  "TrinityCore", "codex", "continue", "gemini-cli", "Kimi-K2", "nvm", "Vitruvian",
]);

interface GitHubRepository {
  name: string;
  description: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  size: number;
  open_issues_count: number;
  pushed_at: string;
  html_url: string;
  stargazers_count: number;
}

function classify(repo: GitHubRepository): RepoKind {
  if (ACTIVE_REPOS.has(repo.name)) return "active";
  if (UPSTREAM_REPOS.has(repo.name) || repo.fork) return "upstream";
  if (
    repo.archived ||
    repo.size === 0 ||
    /(^|[-_])(test|new)([-_]|$)|your_username|https-github|github\.io/i.test(repo.name)
  ) return "cleanup";
  return "experiment";
}

function score(repo: GitHubRepository, kind: RepoKind): Health {
  if (repo.archived || kind === "cleanup" || repo.size === 0) return "review";
  const ageMs = Date.now() - new Date(repo.pushed_at).getTime();
  return ageMs > 365 * 24 * 60 * 60 * 1000 ? "attention" : "healthy";
}

function recommendation(repo: GitHubRepository, kind: RepoKind): string {
  if (repo.archived) return "Archived — preserve";
  if (repo.size === 0) return "Review for archive";
  if (kind === "upstream") return "Document upstream sync";
  if (kind === "cleanup") return "Compare before archiving";
  if (kind === "experiment") return "Name and document purpose";
  return "Keep active and verify CI";
}

function mapRepository(repo: GitHubRepository): Repository {
  const kind = classify(repo);
  return {
    name: repo.name,
    description: repo.description || "No repository description provided.",
    language: repo.language || "Not detected",
    kind,
    health: score(repo, kind),
    openPulls: repo.open_issues_count,
    lastActivity: new Intl.DateTimeFormat("en-AU", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(repo.pushed_at)),
    checks: repo.archived ? "Repository archived" : "Live public metadata loaded",
    recommendation: recommendation(repo, kind),
    htmlUrl: repo.html_url,
    stars: repo.stargazers_count,
    sizeKb: repo.size,
  };
}

export async function scanPublicRepositories(owner: string): Promise<Repository[]> {
  const response = await fetch(
    `${API_ROOT}/users/${encodeURIComponent(owner)}/repos?per_page=100&sort=pushed`,
    { headers: { Accept: "application/vnd.github+json" } },
  );

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const hint = remaining === "0" ? " GitHub's public API rate limit was reached." : "";
    throw new Error(`GitHub scan failed (HTTP ${response.status}).${hint}`);
  }

  const payload = (await response.json()) as GitHubRepository[];
  return payload.map(mapRepository);
}

interface WorkflowRun {
  name: string;
  status: string;
  conclusion: string | null;
  updated_at: string;
}

interface WorkflowResponse {
  workflow_runs: WorkflowRun[];
}

export async function inspectRepository(owner: string, name: string): Promise<import("./types").RepoInspection> {
  const headers = { Accept: "application/vnd.github+json" };
  const [pullResponse, workflowResponse] = await Promise.all([
    fetch(`${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/pulls?state=open&per_page=30`, { headers }),
    fetch(`${API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/actions/runs?per_page=1`, { headers }),
  ]);

  if (pullResponse.status === 403 || workflowResponse.status === 403) {
    return {
      openPulls: null,
      workflowName: "API limit reached",
      workflowState: "unavailable",
      message: "Wait for GitHub's public API limit to reset, then retry.",
    };
  }

  const openPulls = pullResponse.ok
    ? ((await pullResponse.json()) as unknown[]).length
    : null;

  if (workflowResponse.status === 404) {
    return { openPulls, workflowName: "No Actions workflow", workflowState: "none" };
  }

  if (!workflowResponse.ok) {
    return {
      openPulls,
      workflowName: `Workflow check unavailable (HTTP ${workflowResponse.status})`,
      workflowState: "unavailable",
    };
  }

  const workflows = (await workflowResponse.json()) as WorkflowResponse;
  const latest = workflows.workflow_runs[0];
  if (!latest) {
    return { openPulls, workflowName: "No workflow runs found", workflowState: "none" };
  }

  const workflowState =
    latest.status !== "completed"
      ? "pending"
      : latest.conclusion === "success"
        ? "success"
        : "failure";

  return {
    openPulls,
    workflowName: latest.name,
    workflowState,
    workflowUpdatedAt: new Intl.DateTimeFormat("en-AU", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(latest.updated_at)),
  };
}
