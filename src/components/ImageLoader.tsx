import { useState } from "react";

export default function ImageLoader({
  src,
  placeholder,
  onClick,
  className,
}: {
  src: string;
  placeholder: string;
  onClick: () => void;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full aspect-video">
      <img
        src={placeholder}
        className={
          "absolute inset-0 w-full transition-opacity duration-300 pointer-events-none " +
          (isLoaded ? "opacity-0" : "opacity-100")
        }
        aria-hidden
      />

      <img
        src={src}
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
