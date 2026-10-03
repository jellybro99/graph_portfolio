import { useState } from "react";
import type { Image } from "@/assets/types";
import Popup from "@/components/Popup";
import ImageLoader from "@/components/ImageLoader";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export default function ImageChanger({
  images,
  title,
}: {
  images: Image[];
  title?: string;
}) {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [fullScreenImage, setFullscreenImage] = useState<boolean>(false);
  // imageIndex is not reset when the images prop is replaced under a mounted
  // ImageChanger (Popup swaps its content during its 150ms popout, and React
  // reuses this instance), so the index can point past the end of the new
  // array. Guard at read time - the alternative, syncing state to the prop,
  // loops or fights React.
  const shownIndex = Math.min(imageIndex, images.length - 1);
  const image = images[shownIndex];
  const alt =
    (title ? `Screenshot of ${title}` : "Project screenshot") +
    (images.length > 1 ? ` (${shownIndex + 1} of ${images.length})` : "");

  const prev = () =>
    setImageIndex((imageIndex + images.length - 1) % images.length);
  const next = () => setImageIndex((imageIndex + 1) % images.length);

  return (
    <div className="flex flex-1 min-h-0 justify-center relative">
      {images.length > 1 && (
        <button
          type="button"
          aria-label="Previous image"
          className="cursor-pointer absolute top-1/2 left-0 z-10 hover:text-(--color-accent)"
          onClick={prev}
        >
          <ChevronLeftIcon size={20} />
        </button>
      )}
      {/* A button so the zoom is reachable from the keyboard; its accessible
          name comes from the image's alt text. */}
      <button
        type="button"
        onClick={() => setFullscreenImage(true)}
        className="flex w-full min-h-0 justify-center cursor-zoom-in"
      >
        <ImageLoader
          image={image}
          alt={alt}
          className="border-2 border-(--color-text) hover:border-(--color-accent)"
        />
      </button>
      {images.length > 1 && (
        <button
          type="button"
          aria-label="Next image"
          className="cursor-pointer absolute top-1/2 right-0 z-10 hover:text-(--color-accent)"
          onClick={next}
        >
          <ChevronRightIcon size={20} />
        </button>
      )}
      <Popup
        isOpen={fullScreenImage}
        close={() => setFullscreenImage(false)}
        title={title}
      >
        <ImageLoader
          image={image}
          alt={alt}
          onClick={() => setFullscreenImage(false)}
          className="cursor-zoom-out"
        />
      </Popup>
    </div>
  );
}
