import { getThumbhashDataURL } from "@/utils/generateThumbhashes";
import type { RawProject, Project } from "@/assets/types";

export async function processProjects(
  projects: RawProject[],
): Promise<Project[]> {
  return Promise.all(
    projects.map(async (project: RawProject): Promise<Project> => {
      return {
        ...project,
        blurredImages: await Promise.all(
          project.images.map(async (img: string) => getThumbhashDataURL(img)),
        ),
      };
    }),
  );
}
