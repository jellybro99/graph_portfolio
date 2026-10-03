import { type Project } from "@/assets/types";

export default function ProjectList({
  hovered,
  setHovered,
  setOverList,
  projects,
  setPopup,
  setFocusHover,
}: {
  hovered: number;
  setHovered: (value: number) => void;
  setOverList: (value: boolean) => void;
  projects: Project[];
  setPopup: (nodeId: number) => void;
  setFocusHover: (value: number) => void;
}) {
  return (
    <ul
      className="inline-block text-(--color-text-muted)"
      onMouseEnter={() => setOverList(true)}
      onMouseLeave={() => setOverList(false)}
    >
      {projects.map((project) => (
        <li key={project.id}>
          {/* A real button: focusable, and Enter/Space activate it without
              the page scrolling. w-full and text-left keep the full-row
              target and alignment. */}
          <button
            type="button"
            className={
              hovered == project.id
                ? "w-full text-left cursor-pointer text-(--color-accent)"
                : "w-full text-left cursor-pointer"
            }
            onMouseEnter={() => setHovered(project.id)}
            onMouseLeave={() => setHovered(-1)}
            onFocus={() => setFocusHover(project.id)}
            onBlur={() => setFocusHover(-1)}
            onClick={() => setPopup(project.id)}
          >
            {project.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
