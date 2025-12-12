import * as thumbhash from "thumbhash";
import path from "path";
import sharp from "sharp";

export async function generateThumbhash(img: string): Promise<Uint8Array> {
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

export async function getThumbhashDataURL(img: string): Promise<string> {
  return thumbhash.thumbHashToDataURL(await generateThumbhash(img));
}
