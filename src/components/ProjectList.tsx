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
      className="inline-block opacity-50"
      onMouseEnter={() => setOverList(true)}
      onMouseLeave={() => setOverList(false)}
    >
      {projects.map((project) => (
        <li key={project.id}>
          {/* A real button rather than an ARIA-patched <li>: it is focusable,
              and the browser activates it on Enter and on Space without a
              keydown handler having to suppress the page scroll Space
              otherwise performs. w-full and text-left keep the row-wide
              pointer target and the left alignment the plain <li> had, since a
              button is inline-block and centres its text. */}
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
