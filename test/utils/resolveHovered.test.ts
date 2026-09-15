import { describe, it, expect } from "vitest";
import resolveHovered from "../../src/utils/resolveHovered";

// overGraph, graphHover, overList, listHover, focusHover -> hovered, derived by
// hand from "list wins while the pointer is inside it, graph wins while the
// pointer is inside the canvas, keyboard focus wins only while neither
// containment is active, neither pointer nor focus means no hover".
const truthTable: [
  overGraph: boolean,
  graphHover: number,
  overList: boolean,
  listHover: number,
  focusHover: number,
  expected: number,
][] = [
  [true, 3, true, 5, -1, 5],
  [true, 3, true, -1, -1, -1],
  [true, -1, true, 5, -1, 5],
  [true, -1, true, -1, -1, -1],
  [true, 3, false, 5, -1, 3],
  [true, 3, false, -1, -1, 3],
  [true, -1, false, 5, -1, -1],
  [true, -1, false, -1, -1, -1],
  [false, 3, true, 5, -1, 5],
  [false, 3, true, -1, -1, -1],
  [false, -1, true, 5, -1, 5],
  [false, -1, true, -1, -1, -1],
  [false, 3, false, 5, -1, -1],
  [false, 3, false, -1, -1, -1],
  [false, -1, false, 5, -1, -1],
  [false, -1, false, -1, -1, -1],
  // Ticket 30: a row holds keyboard focus (focusHover = 7). It only wins where
  // the pointer sources above returned -1.
  [true, 3, true, 5, 7, 5],
  [true, 3, false, -1, 7, 3],
  [true, -1, false, -1, 7, -1],
  [true, -1, true, -1, 7, -1],
  [false, -1, true, 5, 7, 5],
  [false, -1, false, -1, 7, 7],
  [false, -1, false, -1, -1, -1],
];

describe("resolveHovered", () => {
  it.each(truthTable)(
    "overGraph=%s graphHover=%i overList=%s listHover=%i focusHover=%i -> %i",
    (overGraph, graphHover, overList, listHover, focusHover, expected) => {
      expect(
        resolveHovered(overGraph, graphHover, overList, listHover, focusHover),
      ).toBe(expected);
    },
  );

  it("highlights the hovered list row while the graph's id is stale", () => {
    // Regression from ticket 08: the pointer crossed onto the list, so
    // force-graph never cleared `graphHover`; last-writer precedence let it
    // shadow `listHover` and a different row never highlighted.
    expect(resolveHovered(true, 3, true, 5, -1)).toBe(5);
  });

  it("clears the highlight when the pointer leaves the list for a non-canvas area", () => {
    // Regression from ticket 08: with no containment signal the stale
    // `graphHover` stranded the highlight after the pointer left the list.
    expect(resolveHovered(false, 3, false, -1, -1)).toBe(-1);
  });

  it("keeps the graph hover after the list clears its own", () => {
    // Ticket 08's original bug: the list's mouse-leave cleared the shared
    // hover while the pointer was still on the node, and force-graph does not
    // re-fire `onNodeHover` for a node it never saw the pointer leave, so
    // nothing restored the highlight.
    expect(resolveHovered(true, 3, false, -1, -1)).toBe(3);
  });

  it("highlights the focused row while no pointer containment is active", () => {
    // Ticket 30: a keyboard user tabs to a row and neither containment flag is
    // set, so without the focus source the derivation discarded the focused id
    // and the row and its node never highlighted.
    expect(resolveHovered(false, -1, false, -1, 7)).toBe(7);
  });

  it("does not let a focused row override either pointer source", () => {
    // The pointer is engaged, so it decides - otherwise Tab-ing away from a
    // hovered row would move the mouse highlight onto the focused one.
    expect(resolveHovered(true, 3, false, -1, 7)).toBe(3);
    expect(resolveHovered(false, -1, true, 5, 7)).toBe(5);
    expect(resolveHovered(true, -1, false, -1, 7)).toBe(-1);
  });
});
