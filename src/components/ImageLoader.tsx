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
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full aspect-video">
      <img
        src={image.blurred}
        className={
          "absolute inset-0 w-full transition-opacity duration-300 pointer-events-none " +
          (isLoaded ? "opacity-0" : "opacity-100")
        }
        aria-hidden
      />

      <img
        src={resolveImage(image.original)}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)}
        className={
          "w-full transition-opacity duration-300 " +
          (isLoaded ? "opacity-100" : "opacity-0") +
          (className ? " " + className : "")
        }
      />
    </div>
  );
}
