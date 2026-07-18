import { beforeEach, describe, expect, it, vi } from "vitest";
import { inspectRepository, scanPublicRepositories } from "./github";

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("session-only GitHub authorization", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it.each([undefined, "", "   "])(
    "defaults to unauthenticated requests when token is %j",
    async (token) => {
      vi.mocked(fetch).mockResolvedValueOnce(response([]));

      await scanPublicRepositories("SpidermanTotro", token);

      expect(fetch).toHaveBeenCalledOnce();
      const options = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
      expect(new Headers(options.headers).get("Authorization")).toBeNull();
      expect(new Headers(options.headers).get("Accept")).toBe(
        "application/vnd.github+json",
      );
    },
  );

  it("uses a trimmed token only as an in-memory Authorization header", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response([]));

    await scanPublicRepositories("SpidermanTotro", "  github_pat_secret  ");

    const options = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(new Headers(options.headers).get("Authorization")).toBe(
      "Bearer github_pat_secret",
    );
  });

  it("passes the same session token to PR and Actions inspection requests", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({ workflow_runs: [] }));

    await inspectRepository("SpidermanTotro", "repo-manager-ultimate", "token");

    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [, options] of vi.mocked(fetch).mock.calls) {
      expect(new Headers(options?.headers).get("Authorization")).toBe(
        "Bearer token",
      );
    }
  });
});
