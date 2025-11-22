import { type Project } from "@/assets/projects";

export default function ProjectList({
  hovered,
  setHovered,
  projects,
}: {
  hovered: number;
  setHovered: (value: number) => void;
  projects: Project[];
}) {
  return (
    <ul>
      {projects.map((project, index) => (
        <li
          key={index}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(-1)}
          className={hovered == index ? "text-red-900" : ""}
        >
          {project.title}
        </li>
      ))}
    </ul>
  );
}
