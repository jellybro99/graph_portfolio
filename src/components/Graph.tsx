import { useRef, useState, useEffect, useMemo } from "react";
import ForceGraph2d, { type ForceGraphMethods } from "react-force-graph-2d";
import { projects } from "../assets/projects.tsx";
import { processProjects } from "../utils/processProjects.tsx";

export default function Graph({
  hovered,
  setHovered,
}: {
  hovered: number;
  setHovered: (value: number) => void;
}) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const data = useMemo(() => processProjects(projects), []);

  useEffect(() => {
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
        onNodeHover={(node) => setHovered(node ? Number(node.id) : -1)}
        nodeColor={(node) => (hovered === Number(node.id) ? "red" : "")} //TODO: set color using HTML and tailwind
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
      />
    </div>
  );
}
