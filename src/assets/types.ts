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
  images: Image[];
  tags: string[];
}

export interface Image {
  original: string;
  blurred: string;
  height: number;
  width: number;
}

export interface RawProject {
  title: string;
  link: string;
  github: string;
  description: string;
  tags: string[];
  images: string[];
}
