import { useRef, useState, useEffect, useMemo } from "react";
import ForceGraph2d, { type ForceGraphMethods } from "react-force-graph-2d"
import { projects } from '../assets/projects.tsx';
import { processProjects } from "../utils/processProjects.tsx";

export default function Graph() {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const data = useMemo(() => processProjects(projects), [projects]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
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
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
      />
    </div>
  )
}


