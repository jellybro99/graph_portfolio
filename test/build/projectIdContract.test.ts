import { describe, it, expect, vi } from "vitest";
import type { RawProject } from "@/assets/types";

vi.mock("@/utils/getNumGitHubCommits", () => ({
  getNumGitHubCommitsFromURL: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/utils/generateThumbhashes", () => ({
  getThumbhashDataURL: vi.fn().mockResolvedValue("data:image/png;base64,"),
  getImageSize: vi.fn().mockResolvedValue({ height: 1, width: 1 }),
}));

const { processProjects } = await import("@/build/processProjects");
const { processGraphData } = await import("@/build/processGraphData");

function withIds(projects: Omit<RawProject, "id">[]): RawProject[] {
  return projects.map((project, id) => ({ ...project, id }));
}

const baseProjects: Omit<RawProject, "id">[] = [
  {
    title: "Alpha",
    link: "",
    github: "https://github.com/example/alpha",
    description: "",
    tags: ["x"],
    images: [],
  },
  {
    title: "Beta",
    link: "",
    github: "https://github.com/example/beta",
    description: "",
    tags: ["x", "y"],
    images: [],
  },
  {
    title: "Gamma",
    link: "",
    github: "https://github.com/example/gamma",
    description: "",
    tags: ["y"],
    images: [],
  },
  {
    title: "Delta",
    link: "",
    github: "https://github.com/example/delta",
    description: "",
    tags: ["z"],
    images: [],
  },
];

describe("project id contract", () => {
  it("keeps graph nodes and processed projects keyed to the same id, whatever order the source data is in", async () => {
    const orders = [
      baseProjects,
      [...baseProjects].reverse(),
      [baseProjects[1], baseProjects[3], baseProjects[0], baseProjects[2]],
    ];

    for (const order of orders) {
      const rawProjects = withIds(order);

      const [projects, graphData] = await Promise.all([
        processProjects(rawProjects),
        processGraphData(rawProjects),
      ]);

      expect(graphData.nodes).toHaveLength(rawProjects.length);

      for (const node of graphData.nodes) {
        const project = projects.find((p) => p.id === node.id);
        expect(project?.title).toBe(node.name);
      }
    }
  });

  it("id lookup finds the right project after the processed list is reordered; positional indexing would not", async () => {
    const rawProjects = withIds(baseProjects);

    const [projects, graphData] = await Promise.all([
      processProjects(rawProjects),
      processGraphData(rawProjects),
    ]);

    const shuffledProjects = [...projects].reverse();
    const targetNode = graphData.nodes[0]; // id 0, title "Alpha"

    const byId = shuffledProjects.find((p) => p.id === targetNode.id);
    expect(byId?.title).toBe(targetNode.name);

    // Demonstrates the bug this contract prevents: array position no longer
    // matches id once the list is reordered.
    expect(shuffledProjects[targetNode.id]?.title).not.toBe(targetNode.name);
  });
});
