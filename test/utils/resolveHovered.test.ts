import { describe, it, expect } from "vitest";
import resolveHovered from "../../src/utils/resolveHovered";

// overGraph, graphHover, overList, listHover -> hovered, derived by hand from
// "list wins while the pointer is inside it, graph wins while the pointer is
// inside the canvas, neither means no hover".
const truthTable: [
  overGraph: boolean,
  graphHover: number,
  overList: boolean,
  listHover: number,
  expected: number,
][] = [
  [true, 3, true, 5, 5],
  [true, 3, true, -1, -1],
  [true, -1, true, 5, 5],
  [true, -1, true, -1, -1],
  [true, 3, false, 5, 3],
  [true, 3, false, -1, 3],
  [true, -1, false, 5, -1],
  [true, -1, false, -1, -1],
  [false, 3, true, 5, 5],
  [false, 3, true, -1, -1],
  [false, -1, true, 5, 5],
  [false, -1, true, -1, -1],
  [false, 3, false, 5, -1],
  [false, 3, false, -1, -1],
  [false, -1, false, 5, -1],
  [false, -1, false, -1, -1],
];

describe("resolveHovered", () => {
  it.each(truthTable)(
    "overGraph=%s graphHover=%i overList=%s listHover=%i -> %i",
    (overGraph, graphHover, overList, listHover, expected) => {
      expect(resolveHovered(overGraph, graphHover, overList, listHover)).toBe(
        expected,
      );
    },
  );

  it("highlights the hovered list row while the graph's id is stale", () => {
    // Regression from ticket 08: the pointer crossed onto the list, so
    // force-graph never cleared `graphHover`; last-writer precedence let it
    // shadow `listHover` and a different row never highlighted.
    expect(resolveHovered(true, 3, true, 5)).toBe(5);
  });

  it("clears the highlight when the pointer leaves the list for a non-canvas area", () => {
    // Regression from ticket 08: with no containment signal the stale
    // `graphHover` stranded the highlight after the pointer left the list.
    expect(resolveHovered(false, 3, false, -1)).toBe(-1);
  });

  it("keeps the graph hover after the list clears its own", () => {
    // Ticket 08's original bug: the list's mouse-leave cleared the shared
    // hover while the pointer was still on the node, and force-graph does not
    // re-fire `onNodeHover` for a node it never saw the pointer leave, so
    // nothing restored the highlight.
    expect(resolveHovered(true, 3, false, -1)).toBe(3);
  });
});
