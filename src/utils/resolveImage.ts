const imageModules = import.meta.glob("../assets/images/*", {
  eager: true,
}) as Record<string, { default: string }>;

export default function resolveImage(fileName: string): string {
  const image = imageModules[`../assets/images/${fileName}`];

  // imageModules is keyed by path, so a name no asset matches is undefined and
  // reading .default off it throws a bare "Cannot read properties of
  // undefined" with nothing in it naming the file the caller asked for.
  if (!image) {
    throw new Error(
      `resolveImage: no asset named "${fileName}" in src/assets/images`,
    );
  }

  return image.default;
}
