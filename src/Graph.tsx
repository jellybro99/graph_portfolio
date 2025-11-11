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

  //change the size based on lines of code in project?
  //links based on what?


  return data;
}

export default function Graph() {
  let data = processProjects(projects);
  return (
    // <ProjectCard {...data[0]} />
    <ForceGraph2d
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
