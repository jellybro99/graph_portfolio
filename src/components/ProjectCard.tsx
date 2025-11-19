import type { Project } from "../assets/projects.tsx";

export default function ProjectCard(props: Project) {
  return <div>{props.title}</div>;
}
