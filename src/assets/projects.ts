import { thumbHashToDataURL } from "thumbhash";
import blurPreviewHashes from "./blurPreviewHashes.json" with { type: "json" };
import rawProjectsData from "./rawProjectsData.json" with { type: "json" };

const projectsPreviews: string[][] = blurPreviewHashes.map(
  (project: number[][]) => project.map((image) => thumbHashToDataURL(image)),
);

export const projectsImages: string[][] = [
  ["graph-portfolio.png"],
  [],
  ["just-todo-something.png"],
  ["jellyboysplus.png"],
];

export const projects: Project[] = rawProjectsData.map(
  (project, index): Project => {
    return {
      ...project,
      images: projectsImages[index],
      blurPreviews: projectsPreviews[index],
    };
  },
);

export interface Project {
  title: string;
  link: string;
  github: string;
  description: string;
  images: string[];
  blurPreviews: string[];
  tags: string[];
}
