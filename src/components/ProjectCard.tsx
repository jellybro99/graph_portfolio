import type { Project } from "@/assets/projects";

export default function ProjectCard(props: Project) {
  return <div>{props.title}</div>;
}
