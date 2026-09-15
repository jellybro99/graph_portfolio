import { useState } from "react";
import type { Image } from "@/assets/types";
import Popup from "@/components/Popup";
import ImageLoader from "@/components/ImageLoader";

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
  const image = images[Math.min(imageIndex, images.length - 1)];

  const prev = () =>
    setImageIndex((imageIndex + images.length - 1) % images.length);
  const next = () => setImageIndex((imageIndex + 1) % images.length);

  return (
    <div className="flex flex-1 min-h-0 justify-center relative">
      {images.length > 1 && (
        <button
          className="cursor-pointer absolute top-1/2 left-0"
          onClick={prev}
        >
          {"<"}
        </button>
      )}
      <ImageLoader
        image={image}
        onClick={() => setFullscreenImage(true)}
        className="cursor-zoom-in border-2 border-(--color-text) hover:border-(--color-accent)"
      />
      {images.length > 1 && (
        <button
          className="cursor-pointer absolute top-1/2 right-0"
          onClick={next}
        >
          {">"}
        </button>
      )}
      <Popup
        isOpen={fullScreenImage}
        close={() => setFullscreenImage(false)}
        title={title}
      >
        <ImageLoader
          image={image}
          onClick={() => setFullscreenImage(false)}
          className="cursor-zoom-out"
        />
      </Popup>
    </div>
  );
}
