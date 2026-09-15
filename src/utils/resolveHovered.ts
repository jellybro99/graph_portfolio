// force-graph never reports a pointer-leave: it dispatches hover only inside
// `if (obj !== state.hoverObj)` in its render loop (`force-graph.js:12637`),
// and `getObjUnderPointer` reads a stored `pointerPos` (`:12406-12413`) that
// only pointer events reaching its own canvas update. Its sole `mouseout`
// (`:7093`) is bound to the tooltip element and only flips `mouseInside`, so
// once the pointer crosses onto the overlaid project list a stale graph hover
// id would shadow the list forever. Model pointer containment instead of
// last-writer precedence; the list overlays the canvas, so it wins when the
// pointer is inside both.
//
// Keyboard focus is a third, independent source. A focused row has to
// highlight its node, but it must not be modelled as pointer containment:
// sharing a flag with `overList` would let a Tab away clear the mouse
// highlight while the pointer is still over the list. It is therefore derived
// last, so it only takes effect where the pointer sources above returned -1
// and a mouse user's highlight is unchanged by focus moving around the page.
// Optional for a caller that tracks only the pointer (Graph's own test wires
// the derivation that way): omitting it derives exactly what the pointer-only
// version returned.
export default function resolveHovered(
  overGraph: boolean,
  graphHover: number,
  overList: boolean,
  listHover: number,
  focusHover = -1,
) {
  if (overList) return listHover;
  if (overGraph) return graphHover;
  return focusHover;
}
