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
