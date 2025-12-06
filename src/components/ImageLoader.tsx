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
    <div className="relative">
      {!loaded && (
        <img src={placeholder} className="absolute w-full aspect-video" />
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
    </div>
  );
}
