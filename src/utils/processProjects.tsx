import type { Project } from "../assets/projects.tsx";

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface Node {
  id: number;
  name: string;
  val: number;
}

interface Link {
  source: number;
  target: number;
}

export function processProjects(projects: Project[]): GraphData {
  const nodes = createNodes(projects);
  const categories = createCategories(projects);
  const links = createLinks(categories);

  return { nodes, links }
}

function createNodes(projects: Project[]): Array<Node> {
  return projects.map((project, index) => ({ id: index, name: project.title, val: index }));
}

function createCategories(projects: Project[]): Map<string, number[]> {
  const map = new Map<string, number[]>()

  projects.forEach((project, index) => {
    project.tags.forEach((tag) => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(index);
    })
  })

  return map;
}

function createLinks(categories: Map<string, number[]>): Link[] {
  const links = new Set<Link>();

  for (const ids of categories.values()) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = 0; j < ids.length; j++) {
        if (i != j) links.add({ source: ids[i], target: ids[j] });
      }
    }
  }

  return [...links];
}

// for each node, add it to a list for each of its categories
// then for each node in each category, add a link in the array for it to every other node in the category.
