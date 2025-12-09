import * as thumbhash from "thumbhash";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { projectsImages } from "../assets/projects";

async function generateThumbhash(img: string): Promise<Uint8Array> {
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

const previewHashes = [];

for (const projectImages of projectsImages) {
  const projectHashes = await Promise.all(
    projectImages.map(async (img: string) =>
      Array.from(await generateThumbhash(img)),
    ),
  );
  previewHashes.push(projectHashes);
}

const outputPath = "./src/assets/blurPreviewHashes.json";
fs.writeFileSync(outputPath, JSON.stringify(previewHashes));
