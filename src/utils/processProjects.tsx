import type { Project } from "../assets/projects.tsx";

export interface GraphData {
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

export function processProjects(projects: Array<Project>): GraphData {
  const data: GraphData = {
    nodes: [],
    links: []
  }

  projects.forEach((project, index) => {
    data.nodes.push({ id: index.toString(), name: project.name, val: 1 });
  })

  return data;
}
