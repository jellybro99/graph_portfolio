// force-graph only reports a hover when the node under the pointer changes
// (`force-graph.js:12637`, `if (obj !== state.hoverObj)`), so it will not
// re-assert a node the pointer never left — e.g. when the pointer crosses back
// onto that node from the project list overlaying it. The list must therefore
// not be able to clear the graph's own hover, hence two hover sources with the
// graph taking precedence.
export default function resolveHovered(graphHover: number, listHover: number) {
  return graphHover !== -1 ? graphHover : listHover;
}
