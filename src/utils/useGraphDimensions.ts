import { useEffect, useState, type RefObject } from "react";

// react-hooks/exhaustive-deps cannot tell that a ref passed across a hook
// boundary is stable, so the ref is listed as a dependency. Ref identity is
// stable by React's contract: the observer still attaches once on mount and
// disconnects on unmount, exactly as with an empty array.
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
