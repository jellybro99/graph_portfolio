import * as thumbhash from "thumbhash";
import path from "path";
import sharp from "sharp";

export async function generateThumbhash(image: string): Promise<Uint8Array> {
  const imageSource = path.join("src", "assets", "images", image);

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

export async function getThumbhashDataURL(image: string): Promise<string> {
  return thumbhash.thumbHashToDataURL(await generateThumbhash(image));
}

export async function getImageSize(
  image: string,
): Promise<{ height: number; width: number }> {
  const imageSource = path.join("src", "assets", "images", image);

  const imageData = await sharp(imageSource).metadata();
  return {
    height: imageData.height,
    width: imageData.width,
  };
}
