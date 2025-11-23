import { type Project } from "@/assets/projects";

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
      {projects.map((project, index) => (
        <li
          key={index}
          className={hovered == index ? "text-red-900 cursor-pointer" : ""}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(-1)}
          onClick={() => setPopup(index)}
        >
          {project.title}
        </li>
      ))}
    </ul>
  );
}
