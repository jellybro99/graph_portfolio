import { writeFileSync } from "fs";
import rawProjectsData from "@/assets/rawProjectsData.json";
import { processProjects } from "./processProjects";
import { processGraphData } from "./processGraphData";

const processedProjects = await processProjects(rawProjectsData);
const processedProjectsPath = "./src/assets/processedProjectsData.json";

writeFileSync(processedProjectsPath, JSON.stringify(processedProjects));

const processedGraphData = await processGraphData(rawProjectsData);
const processedGraphDataPath = "./src/assets/processedGraphData.json";

writeFileSync(processedGraphDataPath, JSON.stringify(processedGraphData));
