import { type Project } from "@/assets/types";

export default function ProjectList({
  hovered,
  setHovered,
  setOverList,
  projects,
  setPopup,
}: {
  hovered: number;
  setHovered: (value: number) => void;
  setOverList: (value: boolean) => void;
  projects: Project[];
  setPopup: (nodeId: number) => void;
}) {
  return (
    <ul
      className="inline-block opacity-50"
      onMouseEnter={() => setOverList(true)}
      onMouseLeave={() => setOverList(false)}
    >
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
