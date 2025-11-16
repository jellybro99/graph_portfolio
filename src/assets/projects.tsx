export const projects: Array<Project> =
  [
    {
      title: "Graph Portfolio",
      link: "",
      github: "https://github.com/jellybro99/graph_portfolio",
      description: "",
      images: [],
      tags: []
    }
  ]

export interface Project {
  title: string,
  link: string,
  github: string,
  description: string,
  images: Array<string>,
  tags: Array<string>
}
