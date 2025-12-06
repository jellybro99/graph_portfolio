import { Suspense, useState } from "react";
import { thumbHashToDataURL } from "thumbhash";
import Popup from "@/components/Popup";

export default function ImageChanger({
  images,
  blurPreviews,
  title,
}: {
  images: string[];
  blurPreviews: ArrayLike<number>[];
  title?: string;
}) {
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
      <Suspense
        fallback={<img src={thumbHashToDataURL(blurPreviews[imageIndex])} />}
      >
        <img
          src={images[imageIndex]}
          onClick={() => setFullscreenImage(true)}
          className="cursor-zoom-in border-2 border-(--color-text) hover:border-(--color-accent)"
        />
      </Suspense>
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
        <img
          src={images[imageIndex]}
          className="cursor-zoom-out"
          onClick={() => setFullscreenImage(false)}
        />
      </Popup>
    </div>
  );
}
