import { useEffect } from "react";

export default function usePrefersDarkMode() {
  useEffect(() => {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");

    if (matcher.matches) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    const blob = (event: MediaQueryListEvent) => {
      if (event.matches) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };

    matcher.addEventListener("change", blob);
    return () => matcher.removeEventListener("change", blob);
  }, []);
}
