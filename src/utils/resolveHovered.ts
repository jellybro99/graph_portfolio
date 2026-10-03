// force-graph never reports the pointer leaving a node, so its last hover id
// goes stale once the pointer moves onto the project list. Precedence follows
// pointer containment instead: the list overlays the graph and wins, and
// keyboard focus applies only while the pointer is over neither, so moving
// focus never changes a mouse user's highlight.
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
