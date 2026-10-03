import type { Project } from "@/assets/types";
import ImageChanger from "@/components/ImageChanger";
import { ExternalLinkIcon, GitHubIcon } from "@/components/icons";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-4 max-w-xl flex-1 min-h-0 max-h-120">
      {project.images.length > 0 && (
        <ImageChanger images={project.images} title={project.title} />
      )}
      <p>{project.description}</p>
      <ul className="flex justify-end gap-2">
        {project.github && (
          <li>
            <a
              href={project.github}
              target="_blank"
              aria-label="GitHub repository"
              className="hover:text-(--color-accent)"
            >
              <GitHubIcon />
            </a>
          </li>
        )}
        {project.link && (
          <li>
            <a
              href={project.link}
              target="_blank"
              aria-label="Live site"
              className="hover:text-(--color-accent)"
            >
              <ExternalLinkIcon />
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
