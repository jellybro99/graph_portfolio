export const projects: Array<Project> =
  [
    {
      name: "Graph Portfolio",
      link: "",
      github: "https://github.com/jellybro99/graph_portfolio",
      description: "",
      images: []
    }
  ]

export interface Project {
  name: string,
  link: string,
  github: string,
  description: string,
  images: Array<string>
}
