import { describe, it, expect, vi } from "vitest";
import type { GraphData, Node, Project, RawProject } from "@/assets/types";

// Runs the real build.ts, stubbing only its JSON input, the fs writes, and the
// commit lookups (network), so assertions read the ids build.ts assigned.
const build = vi.hoisted(() => ({
  rawProjectsData: [] as unknown[],
  writeFileSync: vi.fn<(target: string, contents: string) => void>(),
  getNumGitHubCommitsFromURL: vi.fn(),
}));

// "fs" is a CommonJS builtin, so the mock needs a `default` for the interop
// wrapper as well as the named export build.ts imports.
vi.mock("fs", () => ({
  default: { writeFileSync: build.writeFileSync },
  writeFileSync: build.writeFileSync,
}));
vi.mock("@/assets/rawProjectsData.json", () => ({
  default: build.rawProjectsData,
}));
vi.mock("@/utils/getNumGitHubCommits", () => ({
  getNumGitHubCommitsFromURL: build.getNumGitHubCommitsFromURL,
}));

type RawProjectWithoutId = Omit<RawProject, "id">;

function rawProject(title: string): RawProjectWithoutId {
  // No images: processProjects has nothing to thumbhash, so the pipeline runs
  // without the sharp-backed image utilities.
  return { title, link: "", github: "", description: "", tags: [], images: [] };
}

const alpha = rawProject("Alpha");
const beta = rawProject("Beta");
const gamma = rawProject("Gamma");
const delta = rawProject("Delta");
const inserted = rawProject("Inserted");

function writtenAsset(fileName: string): unknown {
  const call = build.writeFileSync.mock.calls.find(([target]) =>
    String(target).endsWith(fileName),
  );

  if (!call) throw new Error(`build.ts did not write ${fileName}`);

  return JSON.parse(call[1]);
}

function writtenProjects(): Project[] {
  return writtenAsset("processedProjects.json") as Project[];
}

function writtenGraphNodes(): Node[] {
  return (writtenAsset("processedGraphData.json") as GraphData).nodes;
}

function idsByTitle(projects: Project[]): Map<string, number> {
  return new Map(projects.map((project) => [project.title, project.id]));
}

async function runBuild(rawProjectsData: RawProjectWithoutId[]): Promise<void> {
  build.rawProjectsData.length = 0;
  build.rawProjectsData.push(...rawProjectsData);
  build.writeFileSync.mockClear();
  build.getNumGitHubCommitsFromURL.mockReset();
  build.getNumGitHubCommitsFromURL.mockResolvedValue(0);

  vi.resetModules();
  await import("@/build/build");
}

describe("build.ts project ids", () => {
  it("stamps each project with its position in the raw data file", async () => {
    await runBuild([alpha, beta, gamma, delta]);

    const projects = writtenProjects();

    expect(projects.map((project) => project.id)).toEqual([0, 1, 2, 3]);
    expect(projects.map((project) => project.title)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
      "Delta",
    ]);
  });

  it("reassigns every later id when a project is inserted mid-file", async () => {
    await runBuild([alpha, beta, gamma, delta]);
    const before = idsByTitle(writtenProjects());

    await runBuild([alpha, beta, inserted, gamma, delta]);
    const after = idsByTitle(writtenProjects());

    // Ids are array positions, not stable keys, so a mid-file insert shifts
    // everything after it.
    expect(before.get("Gamma")).toBe(2);
    expect(before.get("Delta")).toBe(3);
    expect(after.get("Gamma")).toBe(3);
    expect(after.get("Delta")).toBe(4);
    expect([...after.values()]).toEqual([0, 1, 2, 3, 4]);
  });

  it("keys both written assets to the same ids", async () => {
    await runBuild([alpha, beta, gamma, delta]);

    const projects = writtenProjects();
    const nodes = writtenGraphNodes();

    expect(nodes.map((node) => node.id)).toEqual(
      projects.map((project) => project.id),
    );

    for (const node of nodes) {
      expect(projects.find((project) => project.id === node.id)?.title).toBe(
        node.name,
      );
    }
  });
});
