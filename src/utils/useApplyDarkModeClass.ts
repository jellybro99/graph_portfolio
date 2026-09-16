import { useEffect } from "react";

function applyDarkClass(isDark: boolean): void {
  document.documentElement.classList.toggle("dark", isDark);
}

export default function useApplyDarkModeClass(): void {
  useEffect(() => {
    const matcher = window.matchMedia("(prefers-color-scheme: dark)");
    applyDarkClass(matcher.matches);

    const themeHandler = (event: MediaQueryListEvent) => {
      applyDarkClass(event.matches);
    };

    matcher.addEventListener("change", themeHandler);
    return () => matcher.removeEventListener("change", themeHandler);
  }, []);
}
