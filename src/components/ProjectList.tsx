import { projects } from "../assets/projects.tsx";

export default function ProjectList() {
  return (
    <ul>
      {projects.map((project, index) => (
        <li key={index}>{project.title}</li>
      ))}
    </ul>
  );
}
