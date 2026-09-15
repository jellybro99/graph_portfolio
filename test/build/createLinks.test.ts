import { describe, it, expect } from "vitest";
import { createLinks } from "@/build/processGraphData";
import type { Link } from "@/assets/types";

function unorderedPairKey(link: Link): string {
  return `${Math.min(link.source, link.target)}->${Math.max(link.source, link.target)}`;
}

describe("createLinks", () => {
  it("produces one link per pair when three projects share a single tag", () => {
    const categories = new Map([["shared", [0, 1, 2]]]);

    const links = createLinks(categories);

    expect(links).toHaveLength(3);
    expect(links).toEqual(
      expect.arrayContaining([
        { source: 0, target: 1 },
        { source: 0, target: 2 },
        { source: 1, target: 2 },
      ]),
    );
  });

  it("produces exactly one link when two projects share two tags, whatever order the tags list them in", () => {
    const categories = new Map([
      ["a", [0, 1]],
      ["b", [1, 0]],
    ]);

    const links = createLinks(categories);

    expect(links).toHaveLength(1);
    expect(links[0]).toEqual({ source: 0, target: 1 });
  });

  it("never emits self-links or the same unordered pair twice", () => {
    const categories = new Map([
      ["a", [0, 1, 2]],
      ["b", [2, 1]],
      ["c", [2, 0]],
    ]);

    const links = createLinks(categories);

    for (const link of links) {
      expect(link.source).not.toBe(link.target);
    }

    const pairKeys = links.map(unorderedPairKey);
    expect(new Set(pairKeys).size).toBe(pairKeys.length);
    expect(links).toHaveLength(3);
  });
});
