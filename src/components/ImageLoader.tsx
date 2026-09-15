import { useState } from "react";
import type { Image } from "@/assets/types";
import resolveImage from "@/utils/resolveImage";

export default function ImageLoader({
  image,
  onClick,
  className,
}: {
  image: Image;
  onClick: () => void;
  className?: string;
}) {
  const src = resolveImage(image.original);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = loadedSrc === src;
  const aspectRatio = image.width / image.height;

  return (
    <div className="relative w-full h-full" style={{ aspectRatio }}>
      <img
        src={image.blurred}
        className={
          "absolute inset-0 w-full h-full object-contain transition-opacity duration-300 pointer-events-none " +
          (isLoaded ? "opacity-0" : "opacity-100") +
          (className ? " " + className : "")
        }
        aria-hidden
      />

      <img
        src={src}
        onClick={onClick}
        onLoad={() => setLoadedSrc(src)}
        className={
          "w-full transition-opacity duration-300 " +
          (isLoaded ? "opacity-100" : "opacity-0") +
          (className ? " " + className : "")
        }
      />
    </div>
  );
}
