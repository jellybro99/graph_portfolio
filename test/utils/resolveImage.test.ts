import { describe, it, expect } from "vitest";
import resolveImage from "../../src/utils/resolveImage";

describe("resolveImage", () => {
  it("resolves a checked-in asset to its bundled URL", () => {
    expect(resolveImage("obsidian-graph.png")).toEqual(expect.any(String));
  });

  it("names the file it could not find instead of failing on undefined", () => {
    expect(() => resolveImage("not-a-real-image.png")).toThrow(
      /not-a-real-image\.png/,
    );
  });
});
