import { writeFileSync } from "fs";
import path from "path";
import rawProjectsData from "@/assets/rawProjectsData.json";
import type { RawProject } from "@/assets/types";
import { processProjects } from "./processProjects";
import { processGraphData } from "./processGraphData";

// id assigned once here so both build outputs stay keyed to the same project.
const projects: RawProject[] = rawProjectsData.map((project, id) => ({
  ...project,
  id,
}));

const processedProjects = await processProjects(projects);
const processedProjectsPath = path.join(
  "./",
  "src",
  "assets",
  "processedProjects.json",
);

writeFileSync(processedProjectsPath, JSON.stringify(processedProjects));

const processedGraphData = await processGraphData(projects);
const processedGraphDataPath = path.join(
  "./",
  "src",
  "assets",
  "processedGraphData.json",
);

writeFileSync(processedGraphDataPath, JSON.stringify(processedGraphData));
