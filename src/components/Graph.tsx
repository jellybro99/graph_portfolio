import { useRef, useState, useEffect, useMemo } from "react";
import ForceGraph2d, { type ForceGraphMethods } from "react-force-graph-2d";
import { processProjects } from "@/utils/processProjects";
import { type Project } from "@/assets/projects";

export default function Graph({
  hovered,
  setHovered,
  projects,
  setPopup,
}: {
  hovered: number;
  setHovered: (value: number) => void;
  projects: Project[];
  setPopup: (popupId: number) => void;
}) {
  const containerRef = useRef(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const data = useMemo(() => processProjects(projects), [projects]);

  useEffect(() => {
    if (fgRef.current) fgRef.current.zoom(3);

    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph2d
        ref={fgRef}
        graphData={data}
        onNodeHover={(node) => setHovered(node ? Number(node.id) : -1)}
        onNodeClick={(node) => {
          setHovered(-1);
          setPopup(Number(node.id));
        }}
        nodeColor={(node) =>
          hovered === Number(node.id)
            ? getComputedStyle(document.documentElement)
                .getPropertyValue("--color-accent")
                .trim()
            : "#087D97"
        }
        linkColor={() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--color-text")
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
