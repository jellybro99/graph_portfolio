export const data: Array<project> =
  [
    {
      name: "Graph Portfolio",
      link: "",
      github: "https://github.com/jellybro99/graph_portfolio",
      description: "",
      images: []
    }
  ]

export interface project {
  name: string,
  link: string,
  github: string,
  description: string,
  images: Array<string>
}
