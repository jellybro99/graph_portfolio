const imageModules = import.meta.glob("../assets/images/*", {
  eager: true,
}) as Record<string, { default: string }>;

export default function resolveImages(fileName: string): string {
  return imageModules[`../assets/images/${fileName}`].default;
}
