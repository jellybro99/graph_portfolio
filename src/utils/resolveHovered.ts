// force-graph never reports a pointer-leave: it dispatches hover only inside
// `if (obj !== state.hoverObj)` in its render loop (`force-graph.js:12637`),
// and `getObjUnderPointer` reads a stored `pointerPos` (`:12406-12413`) that
// only pointer events reaching its own canvas update. Its sole `mouseout`
// (`:7093`) is bound to the tooltip element and only flips `mouseInside`, so
// once the pointer crosses onto the overlaid project list a stale graph hover
// id would shadow the list forever. Model pointer containment instead of
// last-writer precedence; the list overlays the canvas, so it wins when the
// pointer is inside both.
export default function resolveHovered(
  overGraph: boolean,
  graphHover: number,
  overList: boolean,
  listHover: number,
) {
  if (overList) return listHover;
  return overGraph ? graphHover : -1;
}
