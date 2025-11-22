import { describe, it, expect } from "vitest";
import { createNodes, createCategories, createLinks } from "../../src/utils/processProjects.ts";
import { type Project } from "../../src/assets/projects.tsx";

const sampleProjects: Project[] = [
  { title: "Alpha", link: "", github: "", description: "", images: [], tags: ["music", "web"] },
  { title: "Beta", link: "", github: "", description: "", images: [], tags: ["web"] },
  { title: "Gamma", link: "", github: "", description: "", images: [], tags: ["music"] },
];

describe("Process Projects", () => {
  it("createNodes creates named nodes", () => {
    const nodes = createNodes(sampleProjects);

    expect(nodes).toMatchObject([
      { id: 0, name: "Alpha" },
      { id: 1, name: "Beta" },
      { id: 2, name: "Gamma" }
    ])
  })

  it("createCategories creates categories from tags", () => {
    const categories = createCategories(sampleProjects);

    expect(categories)
  })

  it("createLinks creates links", () => {
    const categories = createCategories(sampleProjects);
    const links = createLinks(categories);

    expect(links).toMatchObject([
      { source: 0, target: 2 },
      { source: 2, target: 0 },
      { source: 0, target: 1 },
      { source: 1, target: 0 },
    ]);

  })
})

// might switch to just testing processProjects() because this seems a bit silly...

