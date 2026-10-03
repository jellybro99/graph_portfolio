import { useEffect, useRef, type RefObject } from "react";

// force-graph renders hover labels through float-tooltip and exposes no API to
// hide them, so this depends on float-tooltip keeping its class name.
export const TOOLTIP_ELEMENT_SELECTOR = ".float-tooltip-kap";

export default function useTooltipSuppression(
  containerRef: RefObject<HTMLDivElement | null>,
  hovered: number,
) {
  const hoveredRef = useRef(hovered);
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  // After a popup closes, the browser fires a mouseover on the uncovered
  // container and the next mousemove re-shows force-graph's stale tooltip for a
  // frame. Hide it while no node is hovered. float-tooltip's listeners sit on a
  // descendant of this container, so the bubbling event reaches ours last. The
  // hidden state holds because force-graph only updates the tooltip when the
  // hovered node changes.
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
    // containerRef is stable; it is listed only because exhaustive-deps can't
    // tell.
  }, [containerRef]);
}
