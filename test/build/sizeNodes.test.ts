import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Node, RawProject } from "@/assets/types";

// processGraphData's sizeNodes is private, so this file drives the real sizing
// path and stubs only the commit lookups that feed it: the raw sizes arrive as
// the resolved commit counts, and the assertions read the resulting node values.
const commitCounts = vi.hoisted(() => ({
  getNumGitHubCommitsFromURL: vi.fn(),
}));

vi.mock("@/utils/getNumGitHubCommits", () => ({
  getNumGitHubCommitsFromURL: commitCounts.getNumGitHubCommitsFromURL,
}));

const { processGraphData } = await import("@/build/processGraphData");

// Mirrors sizeNodes' private maxNodeSize: the busiest project in a build is
// scaled to this value, so a change to it is a change to the rendered graph.
const MAX_NODE_SIZE = 5;

function rawProject(id: number, title: string, github: string): RawProject {
  return {
    id,
    title,
    github,
    link: "",
    description: "",
    tags: [],
    images: [],
  };
}

// A url missing from the map stands for a failed fetch, which
// getNumGitHubCommitsFromURL resolves as 0.
function commitsByURL(counts: Record<string, number>) {
  commitCounts.getNumGitHubCommitsFromURL.mockImplementation(
    async (url: string) => counts[url] ?? 0,
  );
}

function valOf(nodes: Node[], id: number): number {
  const node = nodes.find((candidate) => candidate.id === id);

  if (!node) throw new Error(`no node with id ${id}`);

  return node.val;
}

beforeEach(() => {
  commitCounts.getNumGitHubCommitsFromURL.mockReset();
});

describe("processGraphData node sizing", () => {
  it("keeps every node finite and at least 1 when every commit fetch failed", async () => {
    commitsByURL({});

    const { nodes } = await processGraphData([
      rawProject(0, "Alpha", "https://github.com/example/alpha"),
      rawProject(1, "Beta", "https://github.com/example/beta"),
      rawProject(2, "Gamma", "https://github.com/example/gamma"),
    ]);

    for (const node of nodes) {
      expect(Number.isFinite(node.val)).toBe(true);
      expect(node.val).toBeGreaterThanOrEqual(1);
    }

    // An all-zero build floors maxCommits at 1, so the scale factor is 5 rather
    // than a division by zero that would leave every node NaN.
    expect(nodes.map((node) => node.val)).toEqual([1, 1, 1]);
  });

  it("floors a quiet project at 1 and scales the busiest project to the maximum node size", async () => {
    commitsByURL({
      "https://github.com/example/quiet": 0,
      "https://github.com/example/tiny": 1,
      "https://github.com/example/mid": 3,
      "https://github.com/example/busy": 12,
    });

    const { nodes } = await processGraphData([
      rawProject(0, "Quiet", "https://github.com/example/quiet"),
      rawProject(1, "Tiny", "https://github.com/example/tiny"),
      rawProject(2, "Mid", "https://github.com/example/mid"),
      rawProject(3, "Busy", "https://github.com/example/busy"),
    ]);

    // 0 commits and 1/12 of the busiest project both scale below 1, and the
    // floor holds them at 1 instead of letting a node shrink out of the graph.
    expect(valOf(nodes, 0)).toBe(1);
    expect(valOf(nodes, 1)).toBe(1);
    // Above the floor the value is proportional to the commit count: 3 * 5/12.
    expect(valOf(nodes, 2)).toBeCloseTo(3 * (MAX_NODE_SIZE / 12));
    expect(valOf(nodes, 3)).toBe(MAX_NODE_SIZE);
  });
});
