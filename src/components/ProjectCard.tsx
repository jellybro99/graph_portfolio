import type { Project } from "@/assets/projects";

export default function ProjectCard({
  project,
  close,
}: {
  project: Project;
  close: () => void;
}) {
  return (
    <div>
      {project.title}
      <button onClick={close}>close</button>
    </div>
  );
}
