import * as thumbhash from "thumbhash";
import sharp from "sharp";
import { projects } from "../assets/projects";

async function thumbhashImage(imageSource: string): Promise<ArrayLike<number>> {
  console.log(imageSource);
  const imageData = sharp(imageSource);
  const { data, info } = await imageData
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return thumbhash.rgbaToThumbHash(info.width, info.height, data);
}

projects.forEach((project) => {
  project.images.forEach(async (image, index) => {
    project.blurPreviews[index] = await thumbhashImage(image);
    console.log(project.blurPreviews[index]);
  });
});

//write to blurPreviewsData.json
