import { describe, it, expect } from "vitest";
import resolveHovered from "../../src/utils/resolveHovered";

describe("resolveHovered", () => {
  it("keeps the graph hover after the list clears its own", () => {
    // The reported bug: the list's mouse-leave cleared the shared hover while
    // the pointer was still on the node, and force-graph does not re-fire
    // `onNodeHover` for a node it never saw the pointer leave, so nothing
    // restored the highlight.
    expect(resolveHovered(3, -1)).toBe(3);
  });

  it("prefers the graph hover over a list hover", () => {
    expect(resolveHovered(3, 5)).toBe(3);
  });

  it("falls back to the list hover when the graph is not hovering", () => {
    expect(resolveHovered(-1, 5)).toBe(5);
  });

  it("reports no hover when neither surface is hovering", () => {
    expect(resolveHovered(-1, -1)).toBe(-1);
  });
});
