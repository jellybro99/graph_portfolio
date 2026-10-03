const imageModules = import.meta.glob("../assets/images/*", {
  eager: true,
}) as Record<string, { default: string }>;

export default function resolveImage(fileName: string): string {
  const image = imageModules[`../assets/images/${fileName}`];

  // Fail with the missing file's name rather than a bare undefined-property
  // error.
  if (!image) {
    throw new Error(
      `resolveImage: no asset named "${fileName}" in src/assets/images`,
    );
  }

  return image.default;
}
