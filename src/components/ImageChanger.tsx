import { useState } from "react";

export default function ImageChanger({ images }: { images: string[] }) {
  const [imageIndex, setImageIndex] = useState(0);
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
      <img src={images[imageIndex]} />
      {images.length > 1 && (
        <button className="cursor-pointer" onClick={next}>
          {">"}
        </button>
      )}
    </div>
  );
}
