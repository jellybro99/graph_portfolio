export const projects: Array<Project> = [
  {
    title: "Graph Portfolio",
    link: "",
    github: "https://github.com/jellybro99/graph_portfolio",
    description: "",
    images: [],
    tags: ["react", "tailwind"],
  },
  {
    title: "WikiThee",
    link: "",
    github: "",
    description: "",
    images: [],
    tags: ["nextjs", "react", "mongo", "bootstrap"],
  },
  {
    title: "Just To-Do Something",
    link: "https://jellybro99.github.io/TODO",
    github: "https://github.com/jellybro99/TODO",
    description: "",
    images: [],
    tags: ["javascript", "css"],
  },
  {
    title: "Jellyboysplus",
    link: "https://jellyboysplus.netlify.app/",
    github: "https://github.com/jellybro99/shopping-cart",
    description: "",
    images: [],
    tags: ["react", "css"],
  },
];

export interface Project {
  title: string;
  link: string;
  github: string;
  description: string;
  images: string[];
  tags: string[];
}
