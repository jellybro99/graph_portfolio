export interface Node {
  id: number;
  name: string;
  val: number;
}

export interface Link {
  source: number;
  target: number;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface Project {
  title: string;
  link: string;
  github: string;
  description: string;
  images: string[];
  blurPreviews: string[];
  tags: string[];
}

export interface RawProject {
  title: string;
  link: string;
  github: string;
  description: string;
  tags: string[];
  images: string[];
}
