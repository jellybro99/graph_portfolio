import { useEffect, useState, type RefObject } from "react";

// containerRef is stable; effects list it only because exhaustive-deps can't
// tell that a ref passed into a hook is.
export default function useGraphDimensions(
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = containerRef.current.querySelector("canvas");
    if (canvas) canvas.style.touchAction = "pan-y";

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  return dimensions;
}
