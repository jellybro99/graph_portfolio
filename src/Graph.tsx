import ForceGraph2d from "react-force-graph-2d"
import { projects } from './assets/projects.tsx';
import type { Project } from "./assets/projects.tsx"
// import ProjectCard from './ProjectCard.tsx';

function processProjects(projects: Array<Project>): GraphData {
  const data: GraphData = {
    nodes: [],
    links: []
  }

  projects.forEach((project, index) => {
    data.nodes.push({ id: index.toString(), name: project.name, val: 1 });
  })

  return data;
}

export default function Graph() {
  let data = processProjects(projects);
  return (
    <ForceGraph2d
      width={100}
      height={100}
      graphData={data}
    />
  )
}

interface GraphData {
  nodes: Array<{
    id: string,
    name: string,
    val: number
  }>,
  links: Array<{
    source: string,
    target: string
  }>
}
