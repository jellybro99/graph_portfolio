import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseCommitCountFromLinkHeader,
  getNumGitHubCommits,
} from "@/utils/getNumGitHubCommits";

describe("parseCommitCountFromLinkHeader", () => {
  it('reads the page number from the rel="last" link', () => {
    const link =
      '<https://api.github.com/repos/x/y/commits?per_page=1&page=2>; rel="next", <https://api.github.com/repos/x/y/commits?per_page=1&page=42>; rel="last"';

    expect(parseCommitCountFromLinkHeader(link)).toBe(42);
  });

  it('finds rel="last" regardless of position in the header', () => {
    const link =
      '<https://api.github.com/repos/x/y/commits?per_page=1&page=42>; rel="last", <https://api.github.com/repos/x/y/commits?per_page=1&page=2>; rel="next"';

    expect(parseCommitCountFromLinkHeader(link)).toBe(42);
  });

  it("returns null when the header is missing", () => {
    expect(parseCommitCountFromLinkHeader(null)).toBeNull();
  });

  it("returns null when the header is empty", () => {
    expect(parseCommitCountFromLinkHeader("")).toBeNull();
  });

  it('returns null when there is no rel="last" entry', () => {
    const link =
      '<https://api.github.com/repos/x/y/commits?per_page=1&page=2>; rel="next"';

    expect(parseCommitCountFromLinkHeader(link)).toBeNull();
  });

  it("returns null when the last link has no angle-bracketed URL", () => {
    const link = 'not-a-url; rel="last"';

    expect(parseCommitCountFromLinkHeader(link)).toBeNull();
  });

  it("returns null when the URL is malformed", () => {
    const link = '<not a valid url>; rel="last"';

    expect(parseCommitCountFromLinkHeader(link)).toBeNull();
  });

  it("returns null when the URL has no page param", () => {
    const link =
      '<https://api.github.com/repos/x/y/commits?per_page=1>; rel="last"';

    expect(parseCommitCountFromLinkHeader(link)).toBeNull();
  });

  it("returns null when the page param is not a number", () => {
    const link =
      '<https://api.github.com/repos/x/y/commits?per_page=1&page=abc>; rel="last"';

    expect(parseCommitCountFromLinkHeader(link)).toBeNull();
  });

  it("returns null when the page param is negative", () => {
    const link =
      '<https://api.github.com/repos/x/y/commits?per_page=1&page=-3>; rel="last"';

    expect(parseCommitCountFromLinkHeader(link)).toBeNull();
  });
});

describe("getNumGitHubCommits", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mockFetch(link: string | null) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        headers: { get: () => link },
      }),
    );
  }

  it("returns the parsed commit count on the successful path", async () => {
    mockFetch(
      '<https://api.github.com/repos/x/y/commits?per_page=1&page=2>; rel="next", <https://api.github.com/repos/x/y/commits?per_page=1&page=7>; rel="last"',
    );

    await expect(getNumGitHubCommits("x", "y")).resolves.toBe(7);
  });

  it("warns and defaults to 0 when the header is missing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockFetch(null);

    await expect(getNumGitHubCommits("x", "y")).resolves.toBe(0);
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("warns and defaults to 0 when the header is malformed", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockFetch('<not a valid url>; rel="last"');

    await expect(getNumGitHubCommits("x", "y")).resolves.toBe(0);
    expect(warnSpy).toHaveBeenCalledOnce();
  });
});
