import type { Node, Link, GraphData, RawProject } from "@/assets/types";
import { getNumGitHubCommitsFromURL } from "@/utils/getNumGitHubCommits";

export async function processGraphData(
  projects: RawProject[],
): Promise<GraphData> {
  const nodes = createNodes(projects);
  const categories = createCategories(projects);
  const links = createLinks(categories);
  //potentially change this to using a seperate node to represent categories
  //

  const commits = await Promise.all(
    projects.map((project) => getNumGitHubCommitsFromURL(project.github)),
  );

  await sizeNodes(commits, nodes);

  return { nodes, links };
}

function createNodes(projects: RawProject[]): Array<Node> {
  return projects.map((project, index) => ({
    id: index,
    name: project.title,
    val: 1,
  }));
}

function createCategories(projects: RawProject[]): Map<string, number[]> {
  const map = new Map<string, number[]>();

  projects.forEach((project, index) => {
    project.tags.forEach((tag) => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(index);
    });
  });

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

async function sizeNodes(rawSizes: number[], nodes: Node[]): Promise<void> {
  const maxNodeSize = 5;
  const maxCommits = Math.max(1, ...rawSizes);
  const scalar = maxNodeSize / maxCommits;

  nodes.forEach((node, index) => {
    node.val = Math.max(rawSizes[index] * scalar, 1);
  });
}
