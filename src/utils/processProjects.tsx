import type { Project } from "../assets/projects.tsx";

export interface GraphData {
  nodes: Array<{
    id: number;
    name: string;
    val: number;
  }>;
  links: Array<{
    source: number;
    target: number;
  }>;
}

export function processProjects(projects: Array<Project>): GraphData {
  const data: GraphData = {
    nodes: [],
    links: [],
  };

  const categories = new Map();

  projects.forEach((project, index) => {
    data.nodes.push({ id: index, name: project.title, val: index });
    project.tags.forEach((tag) => {
      if (categories.has(tag)) {
        categories.get(tag).push(index);
      } else {
        categories.set(tag, [index]);
      }
    })
  });

  console.log(categories);

  // for each node, add it to a list for each of its categories
  // then for each node in each category, add a link in the array for it to every other node in the category.

  //going to use bidirectional links because this not directional

  data.links.push({ source: 1, target: 2 });
  data.links.push({ source: 3, target: 0 });
  data.links.push({ source: 0, target: 3 });

  return data;
}
