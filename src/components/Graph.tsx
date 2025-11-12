import { useRef } from "react";
import ForceGraph2d, { type ForceGraphMethods } from "react-force-graph-2d"
import { projects } from '../assets/projects.tsx';
import { processProjects } from "../utils/processProjects.tsx";



//use a ref for the container to get the width and height - use a useffect on window resize to change it :0

export default function Graph() {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef(null);

  let data = processProjects(projects);
  return (
    <div ref={containerRef}>
      <ForceGraph2d
        ref={fgRef}
        graphData={data}
      />
    </div>
  )
}


