import rawBlurPreviewsData from "./blurPreviewsData.json" with { type: "json" };
const blurPreviewsData: ArrayLike<number>[][] = rawBlurPreviewsData;

export const projects: Array<Project> = [
  {
    title: "Graph Portfolio",
    link: "https://jellybro99.github.io/graph_portfolio",
    github: "https://github.com/jellybro99/graph_portfolio",
    description:
      "Portfolio project for showcasing my projects, built with React, Tailwind, and the force graph library.",
    images: ["graph-portfolio.png"],
    blurPreviews: blurPreviewsData[0],
    tags: ["react", "tailwind"],
  },
  {
    title: "WikiThee",
    link: "",
    github: "",
    description: "",
    images: [],
    blurPreviews: blurPreviewsData[1],
    tags: ["nextjs", "react", "mongo", "bootstrap"],
  },
  {
    title: "Just To-Do Something",
    link: "https://jellybro99.github.io/TODO",
    github: "https://github.com/jellybro99/TODO",
    description:
      "Simplistic no-nonsense task manager built with CSS, HTML, and JS.",
    images: ["just-todo-something.png"],
    blurPreviews: blurPreviewsData[2],
    tags: ["javascript", "css"],
  },
  {
    title: "Jellyboysplus",
    link: "https://jellyboysplus.netlify.app/",
    github: "https://github.com/jel]lybro99/shopping-cart",
    description:
      "Mockup e-commerce app using React + React router and styled components.",
    images: ["jellyboysplus.png"],
    blurPreviews: blurPreviewsData[3],
    tags: ["react", "css"],
  },
];

export interface Project {
  title: string;
  link: string;
  github: string;
  description: string;
  images: string[];
  blurPreviews: ArrayLike<number>[];
  tags: string[];
}
