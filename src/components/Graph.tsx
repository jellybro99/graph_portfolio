import { useRef, useEffect } from "react";
import ForceGraph2d, { type ForceGraphMethods } from "react-force-graph-2d";
import graphData from "@/assets/processedGraphData.json" with { type: "json" };
import useIsMobile from "@/utils/useIsMobile";
import useGraphThemeColors from "@/utils/useGraphThemeColors";
import useGraphDimensions from "@/utils/useGraphDimensions";
import useTooltipSuppression, {
  TOOLTIP_ELEMENT_SELECTOR,
} from "@/utils/useTooltipSuppression";

export default function Graph({
  hovered,
  setHovered,
  setOverGraph,
  setPopup,
}: {
  hovered: number;
  setHovered: (value: number) => void;
  setOverGraph: (value: boolean) => void;
  setPopup: (popupId: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const isMobile = useIsMobile();
  const themeColors = useGraphThemeColors();
  const dimensions = useGraphDimensions(containerRef);

  useEffect(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) canvas.style.cursor = hovered !== -1 ? "pointer" : "default";

    const tooltip = containerRef.current?.querySelector<HTMLElement>(
      TOOLTIP_ELEMENT_SELECTOR,
    );
    if (tooltip && hovered === -1) tooltip.style.display = "none";
  }, [hovered]);

  useTooltipSuppression(containerRef, hovered);

  return (
    // The pointer is usually already inside this full-viewport container at
    // mount, when no mouseenter fires, so movement reports containment too.
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseEnter={() => setOverGraph(true)}
      onMouseMove={() => setOverGraph(true)}
      onMouseLeave={() => setOverGraph(false)}
    >
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
          hovered === Number(node.id) ? themeColors.nodeHover : themeColors.node
        }
        linkColor={() => themeColors.link}
        width={dimensions.width}
        height={dimensions.height}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
}
