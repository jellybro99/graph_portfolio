import { getThumbhashDataURL } from "@/utils/createBlurPreviewHashes";
import type { RawProject, Project } from "@/assets/types";

export async function processProjects(
  projects: RawProject[],
): Promise<Project[]> {
  return Promise.all(
    projects.map(async (project: RawProject): Promise<Project> => {
      const blurPreviews = await Promise.all(
        project.images.map(async (img: string) => getThumbhashDataURL(img)),
      );

      return {
        ...project,
        blurPreviews,
      };
    }),
  );
}
