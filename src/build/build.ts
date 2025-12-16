import { writeFileSync } from "fs";
import path from "path";
import rawProjectsData from "@/assets/rawProjectsData.json";
import { processProjects } from "./processProjects";
import { processGraphData } from "./processGraphData";

const processedProjects = await processProjects(rawProjectsData);
const processedProjectsPath = path.join(
  "./",
  "src",
  "assets",
  "processedProjects.json",
);

writeFileSync(processedProjectsPath, JSON.stringify(processedProjects));

const processedGraphData = await processGraphData(rawProjectsData);
const processedGraphDataPath = path.join(
  "./",
  "src",
  "assets",
  "processedGraphData.json",
);

writeFileSync(processedGraphDataPath, JSON.stringify(processedGraphData));
