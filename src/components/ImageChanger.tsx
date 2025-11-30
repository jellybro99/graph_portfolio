import { useState } from "react";
import Popup from "@/components/Popup";

export default function ImageChanger({ images }: { images: string[] }) {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [fullScreenImage, setFullscreenImage] = useState<boolean>(false);
  const prev = () =>
    setImageIndex((imageIndex + images.length - 1) % images.length);
  const next = () => setImageIndex((imageIndex + 1) % images.length);

  return (
    <div className="flex">
      {images.length > 1 && (
        <button className="cursor-pointer" onClick={prev}>
          {"<"}
        </button>
      )}
      <img
        src={images[imageIndex]}
        onClick={() => setFullscreenImage(true)}
        className="cursor-zoom-in border-2 border-(--color-text) hover:border-(--color-accent)"
      />
      {images.length > 1 && (
        <button className="cursor-pointer" onClick={next}>
          {">"}
        </button>
      )}
      {fullScreenImage && (
        <Popup close={() => setFullscreenImage(false)}>
          <img
            src={images[imageIndex]}
            className="cursor-zoom-out"
            onClick={() => setFullscreenImage(false)}
          />
        </Popup>
      )}
    </div>
  );
}
