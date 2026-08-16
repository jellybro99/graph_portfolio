import { type Project } from "@/assets/types";

export default function ProjectList({
  hovered,
  setHovered,
  projects,
  setPopup,
}: {
  hovered: number;
  setHovered: (value: number) => void;
  projects: Project[];
  setPopup: (nodeId: number) => void;
}) {
  return (
    <ul className="inline-block opacity-50">
      {projects.map((project) => (
        <li
          key={project.id}
          className={
            hovered == project.id ? "text-(--color-accent) cursor-pointer" : ""
          }
          onMouseEnter={() => setHovered(project.id)}
          onMouseLeave={() => setHovered(-1)}
          onClick={() => setPopup(project.id)}
        >
          {project.title}
        </li>
      ))}
    </ul>
  );
}
