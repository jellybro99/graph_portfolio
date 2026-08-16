import { useRef, useState, useEffect } from "react";
import ForceGraph2d, { type ForceGraphMethods } from "react-force-graph-2d";
import graphData from "@/assets/processedGraphData.json" with { type: "json" };
import useIsMobile from "@/utils/useIsMobile";

export default function Graph({
  hovered,
  setHovered,
  setPopup,
}: {
  hovered: number;
  setHovered: (value: number) => void;
  setPopup: (popupId: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = containerRef.current.querySelector("canvas");
    if (canvas) canvas.style.touchAction = "pan-y";

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) canvas.style.cursor = hovered !== -1 ? "pointer" : "default";

    const tooltip =
      containerRef.current?.querySelector<HTMLElement>(".float-tooltip-kap");
    if (tooltip && hovered === -1) tooltip.style.display = "none";
  }, [hovered]);

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
      const tooltip =
        container.querySelector<HTMLElement>(".float-tooltip-kap");
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
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <ForceGraph2d
        ref={fgRef}
        graphData={graphData}
        onNodeHover={(node) => setHovered(node ? Number(node.id) : -1)}
        onNodeClick={(node) => {
          setHovered(-1);
          setPopup(Number(node.id));
        }}
        nodeLabel={isMobile ? () => null : (node) => node.name}
        nodeColor={(node) =>
          hovered === Number(node.id)
            ? getComputedStyle(document.documentElement)
                .getPropertyValue("--color-node-hover")
                .trim()
            : getComputedStyle(document.documentElement)
                .getPropertyValue("--color-node")
                .trim()
        }
        linkColor={() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--color-link")
            .trim()
        }
        width={dimensions.width}
        height={dimensions.height}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
}
