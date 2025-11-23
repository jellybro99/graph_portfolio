import type { Project } from "@/assets/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return <div>{project.title}</div>;
}
