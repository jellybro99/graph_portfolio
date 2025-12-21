import { useRef, useState, useEffect } from "react";
import ForceGraph2d, { type ForceGraphMethods } from "react-force-graph-2d";
import graphData from "@/assets/processedGraphData.json" with { type: "json" };

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
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    const canvas = containerRef.current.querySelector("canvas");
    if (canvas) canvas.style.touchAction = "pan-y";

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
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
