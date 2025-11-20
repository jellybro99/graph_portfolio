import { projects } from "../assets/projects.tsx";

export default function ProjectList({
  hovered,
  setHovered,
}: {
  hovered: number;
  setHovered: (value: number) => void;
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
