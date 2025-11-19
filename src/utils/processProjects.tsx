import type { Project } from "../assets/projects.tsx";

export interface GraphData {
  nodes: Array<{
    id: number;
    name: string;
    val: number;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
}

export function processProjects(projects: Array<Project>): GraphData {
  const data: GraphData = {
    nodes: [],
    links: [],
  };

  projects.forEach((project, index) => {
    data.nodes.push({ id: index, name: project.title, val: 1 });
  });

  return data;
}
