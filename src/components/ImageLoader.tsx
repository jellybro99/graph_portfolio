import { useState } from "react";

export default function ProgressiveImage({
  src,
  placeholder,
  onClick,
  className,
}: {
  src: string;
  placeholder: string;
  onClick: () => void;
  className: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <img src={placeholder} className="relative w-full aspect-video" />
      )}
      <img
        src={src}
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        className={
          className +
          " " +
          (loaded ? "opacity-100" : "opacity-0") +
          " transition-opacity duration-500"
        }
      />
    </>
  );
}
