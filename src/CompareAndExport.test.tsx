import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CompareAndExport } from "./CompareAndExport";
import type { Repository } from "./types";

vi.mock("./github", () => ({ compareRepositories: vi.fn() }));

const repository: Repository = {
  name: "repo-manager-ultimate",
  description: "Repository manager",
  language: "TypeScript",
  kind: "active",
  health: "healthy",
  openPulls: 0,
  lastActivity: "18 Jul 2026",
  checks: "Healthy",
  recommendation: "Keep active",
};

describe("cleanup-plan export safety", () => {
  it("never serializes the session token into an export", async () => {
    const blobs: Array<{ parts: BlobPart[] }> = [];
    class CapturingBlob {
      parts: BlobPart[];
      constructor(parts: BlobPart[]) {
        this.parts = parts;
        blobs.push(this);
      }
    }
    vi.stubGlobal("Blob", CapturingBlob);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(
      <CompareAndExport
        owner="SpidermanTotro"
        repositories={[repository]}
        token="github_pat_must_not_escape"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /export cleanup plan/i }));

    const exported = blobs[0].parts.join("");
    expect(exported).not.toContain("github_pat_must_not_escape");
    expect(JSON.parse(exported)).toMatchObject({
      owner: "SpidermanTotro",
      safeMode: true,
    });
  });
});
