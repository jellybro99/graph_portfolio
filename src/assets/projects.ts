import { thumbHashToDataURL } from "thumbhash";
import rawBlurPreviews from "./blurPreviewsData.json" with { type: "json" };

const blurPreviews: string[][] = rawBlurPreviews.map((project: number[][]) =>
  project.map((image) => thumbHashToDataURL(image)),
);

export const images: string[][] = [
  ["graph-portfolio.png"],
  [],
  ["just-todo-something.png"],
  ["jellyboysplus.png"],
];

const projectsBase = [
  {
    title: "Graph Portfolio",
    link: "https://jellybro99.github.io/graph_portfolio",
    github: "https://github.com/jellybro99/graph_portfolio",
    description:
      "Portfolio project for showcasing my projects, built with React, Tailwind, and the force graph library.",
    tags: ["react", "tailwind"],
  },
  {
    title: "WikiThee",
    link: "",
    github: "",
    description: "",
    tags: ["nextjs", "react", "mongo", "bootstrap"],
  },
  {
    title: "Just To-Do Something",
    link: "https://jellybro99.github.io/TODO",
    github: "https://github.com/jellybro99/TODO",
    description:
      "Simplistic no-nonsense task manager built with CSS, HTML, and JS.",
    tags: ["javascript", "css"],
  },
  {
    title: "Jellyboysplus",
    link: "https://jellyboysplus.netlify.app/",
    github: "https://github.com/jel]lybro99/shopping-cart",
    description:
      "Mockup e-commerce app using React + React router and styled components.",
    tags: ["react", "css"],
  },
];

export const projects: Project[] = projectsBase.map(
  (project, index): Project => {
    return {
      ...project,
      images: images[index],
      blurPreviews: blurPreviews[index],
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
