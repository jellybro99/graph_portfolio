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
  return projects.map((project) => ({
    id: project.id,
    name: project.title,
    val: 1,
  }));
}

function createCategories(projects: RawProject[]): Map<string, number[]> {
  const map = new Map<string, number[]>();

  projects.forEach((project) => {
    project.tags.forEach((tag) => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(project.id);
    });
  });

  return map;
}

// A Set of the pair key, not of the Link objects: Set compares objects by
// reference, so `new Set<Link>()` would keep every duplicate. Ids arrive in
// tag-encounter order and a pair can be visited once per shared tag, so the key
// is canonical for the unordered pair and the emitted direction matches it.
export function createLinks(categories: Map<string, number[]>): Link[] {
  const links: Link[] = [];
  const seenPairs = new Set<string>();

  for (const ids of categories.values()) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const source = Math.min(ids[i], ids[j]);
        const target = Math.max(ids[i], ids[j]);
        const key = `${source}->${target}`;

        if (seenPairs.has(key)) continue;

        seenPairs.add(key);
        links.push({ source, target });
      }
    }
  }

  return links;
}

async function sizeNodes(rawSizes: number[], nodes: Node[]): Promise<void> {
  const maxNodeSize = 5;
  const maxCommits = Math.max(1, ...rawSizes);
  const scalar = maxNodeSize / maxCommits;

  nodes.forEach((node, index) => {
    node.val = Math.max(rawSizes[index] * scalar, 1);
  });
}
