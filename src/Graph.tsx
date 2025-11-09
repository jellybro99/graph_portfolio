//import ForceGraph2d from "react-force-graph-2d"
import { data } from './assets/projects.tsx';
import ProjectCard from './ProjectCard.tsx';

export default function Graph() {
  return (
    <ProjectCard {...data[0]} />
  )
}
