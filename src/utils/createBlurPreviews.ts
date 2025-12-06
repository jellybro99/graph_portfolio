import * as thumbhash from "thumbhash";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { projects } from "../assets/projects";

async function thumbhashImage(img: string): Promise<ArrayLike<number>> {
  const imageSource = path.join("./src/assets/images", img);

  const imageData = sharp(imageSource);
  const { data, info } = await imageData
    .ensureAlpha()
    .resize({
      width: 100,
      height: 100,
      fit: "inside",
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return thumbhash.rgbaToThumbHash(info.width, info.height, data);
}

const blurPreviews = [];

for (const project of projects) {
  const previews = await Promise.all(
    project.images.map((img) => thumbhashImage(img)),
  );
  blurPreviews.push(previews);
}

const outputPath = "./src/assets/blurPreviewsData.json";
fs.writeFileSync(outputPath, JSON.stringify(blurPreviews));
