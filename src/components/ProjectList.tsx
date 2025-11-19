import { projects } from "../assets/projects.tsx";

export default function ProjectList() {
  return (
    <ul>
      {projects.map((project) => (
        <li key={project.title}>{project.title}</li>
      ))}
    </ul>
  );
}
