import { useEffect, useState } from "react";

const THEME_COLOR_VARS = {
  node: "--color-node",
  nodeHover: "--color-node-hover",
  link: "--color-link",
} as const;

type ThemeColorKey = keyof typeof THEME_COLOR_VARS;
type GraphThemeColors = Record<ThemeColorKey, string>;

const THEME_COLOR_KEYS = Object.keys(THEME_COLOR_VARS) as ThemeColorKey[];

function resolveThemeColors(): GraphThemeColors {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    THEME_COLOR_KEYS.map((key) => [
      key,
      style.getPropertyValue(THEME_COLOR_VARS[key]).trim(),
    ]),
  ) as GraphThemeColors;
}

function sameColors(a: GraphThemeColors, b: GraphThemeColors): boolean {
  return THEME_COLOR_KEYS.every((key) => a[key] === b[key]);
}

export default function useGraphThemeColors(): GraphThemeColors {
  const [colors, setColors] = useState(resolveThemeColors);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColors(resolveThemeColors());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // The observer misses class changes made before observe(), e.g. App's dark
    // class under StrictMode, whose record is dropped when the first observer
    // is disconnected. Re-read once observing.
    const current = resolveThemeColors();
    setColors((previous) =>
      sameColors(previous, current) ? previous : current,
    );

    return () => observer.disconnect();
  }, []);

  return colors;
}
