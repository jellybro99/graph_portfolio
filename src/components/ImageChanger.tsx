import { useState } from "react";
import Popup from "@/components/Popup";
import ImageLoader from "@/components/ImageLoader";

export default function ImageChanger({
  images,
  blurPreviews,
  title,
}: {
  images: string[];
  blurPreviews: string[];
  title?: string;
}) {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [fullScreenImage, setFullscreenImage] = useState<boolean>(false);
  const prev = () =>
    setImageIndex((imageIndex + images.length - 1) % images.length);
  const next = () => setImageIndex((imageIndex + 1) % images.length);

  return (
    <div className="flex relative">
      {images.length > 1 && (
        <button className="cursor-pointer" onClick={prev}>
          {"<"}
        </button>
      )}
      <ImageLoader
        src={images[imageIndex]}
        onClick={() => setFullscreenImage(true)}
        placeholder={blurPreviews[imageIndex]}
        className="cursor-zoom-in border-2 border-(--color-text) hover:border-(--color-accent)"
      />
      {images.length > 1 && (
        <button className="cursor-pointer" onClick={next}>
          {">"}
        </button>
      )}
      <Popup
        isOpen={fullScreenImage}
        close={() => setFullscreenImage(false)}
        title={title}
      >
        <ImageLoader
          src={images[imageIndex]}
          placeholder={blurPreviews[imageIndex]}
          onClick={() => setFullscreenImage(false)}
          className="cursor-zoom-out"
        />
      </Popup>
    </div>
  );
}
