import { useEffect, useRef, type RefObject } from "react";

// force-graph renders its hover labels through float-tooltip, which appends
// this element to the graph container (`state.tooltip = new Tooltip(container)`
// in force-graph's index, and float-tooltip's own `el.append('div').attr('class',
// 'float-tooltip-kap')`). force-graph exposes no API to hide it, so hiding it
// means reaching for this class name and depending on the library keeping it.
export const TOOLTIP_ELEMENT_SELECTOR = ".float-tooltip-kap";

export default function useTooltipSuppression(
  containerRef: RefObject<HTMLDivElement | null>,
  hovered: number,
) {
  const hoveredRef = useRef(hovered);
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  // A popup overlay blocks pointer events reaching the graph while open, so
  // force-graph's tooltip content goes stale. Once the overlay unmounts,
  // the browser fires a "mouseover" on the now-exposed container even
  // though the cursor never moved, and the next real "mousemove" re-shows
  // that stale content at the new cursor position for a frame before
  // force-graph's own render loop catches up and clears it. Suppress both.
  //
  // This only works because of where the two sets of listeners sit in the DOM.
  // float-tooltip appends the tooltip and binds its "mousemove"/"mouseover"
  // handlers to the container it is handed, and force-graph hands it a
  // `div.force-graph-container` that it creates *inside* react-kapsule's
  // wrapper (force-graph.js:12383-12386, `state.tooltip = new Tooltip(container)`
  // at :12528; float-tooltip.js:1798,1809,1823). This hook attaches to the React
  // div those wrappers live in, i.e. their *ancestor*. The two sets are on
  // different elements, and ours runs second because the event bubbles up from
  // descendant to ancestor - a structural guarantee of DOM propagation, not a
  // registration-order race. What would break it is either library calling
  // `stopPropagation` (neither does today), or force-graph reparenting the
  // tooltip outside this container.
  //
  // The inline `display: none` set here survives until the next pointer event:
  // force-graph only feeds the tooltip inside `if (obj !== state.hoverObj)`
  // (force-graph.js:12651), so the tooltip is not re-asserted per frame and
  // force-graph's render loop does not race us back to a visible tooltip.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const suppressStaleTooltip = () => {
      if (hoveredRef.current !== -1) return;
      const tooltip = container.querySelector<HTMLElement>(
        TOOLTIP_ELEMENT_SELECTOR,
      );
      if (tooltip) tooltip.style.display = "none";
      const canvas = container.querySelector("canvas");
      if (canvas) canvas.style.cursor = "default";
    };

    container.addEventListener("mouseover", suppressStaleTooltip);
    container.addEventListener("mousemove", suppressStaleTooltip);
    return () => {
      container.removeEventListener("mouseover", suppressStaleTooltip);
      container.removeEventListener("mousemove", suppressStaleTooltip);
    };
    // react-hooks/exhaustive-deps cannot tell that a ref passed across a hook
    // boundary is stable, so the ref is listed as a dependency. Ref identity is
    // stable by React's contract: the listeners are still attached once on
    // mount and removed on unmount, exactly as with an empty array.
  }, [containerRef]);
}
