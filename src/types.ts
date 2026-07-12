export type Health = "healthy" | "attention" | "review";
export type RepoKind = "active" | "experiment" | "upstream" | "cleanup";

export interface Repository {
  name: string;
  description: string;
  language: string;
  kind: RepoKind;
  health: Health;
  openPulls: number;
  lastActivity: string;
  checks: string;
  recommendation: string;
  htmlUrl?: string;
  stars?: number;
  sizeKb?: number;
}
