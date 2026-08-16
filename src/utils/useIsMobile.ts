import { useEffect, useState } from "react";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  );

  useEffect(() => {
    const matcher = window.matchMedia("(pointer: coarse)");

    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    matcher.addEventListener("change", handler);
    return () => matcher.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
