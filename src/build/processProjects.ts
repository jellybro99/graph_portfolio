import { getThumbhashDataURL } from "@/utils/generateThumbhashes";
import type { RawProject, Project, Image } from "@/assets/types";

export async function processProjects(
  projects: RawProject[],
): Promise<Project[]> {
  return Promise.all(
    projects.map(
      async (project: RawProject): Promise<Project> => processProject(project),
    ),
  );
}

async function processProject(project: RawProject): Promise<Project> {
  return {
    ...project,
    images: await Promise.all(
      project.images.map(async (image) => processImage(image)),
    ),
  };
}

async function processImage(image: string): Promise<Image> {
  return {
    original: image,
    blurred: await getThumbhashDataURL(image),
    aspectRatio: 1,
  };
}
