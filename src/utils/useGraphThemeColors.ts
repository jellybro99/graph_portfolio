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

    // The observer only reports changes made after observe(). A class change
    // between the initial render and here - App's dark-class effect under
    // StrictMode, whose record is discarded when StrictMode disconnects the
    // first observer - would otherwise leave the graph on stale colors. Keep
    // the existing object when nothing changed, so a normal mount does not
    // re-render.
    const current = resolveThemeColors();
    setColors((previous) =>
      sameColors(previous, current) ? previous : current,
    );

    return () => observer.disconnect();
  }, []);

  return colors;
}
