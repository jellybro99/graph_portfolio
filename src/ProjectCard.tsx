import type { project } from './assets/projects.tsx';

export default function ProjectCard(props: project) {

  return (
    <div>
      {props.name}
    </div>
  )
}
