import jellyboysplus from "@/assets/images/jellyboysplus.png";
import justTodoSomething from "@/assets/images/just-todo-something.png";

export const projects: Array<Project> = [
  {
    title: "Graph Portfolio",
    link: "https://jellybro99.github.io/graph_portfolio",
    github: "https://github.com/jellybro99/graph_portfolio",
    description:
      "Portfolio project for showcasing my projects, built with React, Tailwind, and the force graph library.",
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
    description:
      "Simplistic no-nonsense task manager built with CSS, HTML, and JS.",
    images: [justTodoSomething],
    tags: ["javascript", "css"],
  },
  {
    title: "Jellyboysplus",
    link: "https://jellyboysplus.netlify.app/",
    github: "https://github.com/jellybro99/shopping-cart",
    description:
      "Mockup e-commerce app using React + React router and styled components.",
    images: [jellyboysplus],
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
