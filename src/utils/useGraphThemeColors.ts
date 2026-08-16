import { useEffect, useState } from "react";

const THEME_COLOR_VARS = {
  node: "--color-node",
  nodeHover: "--color-node-hover",
  link: "--color-link",
} as const;

type GraphThemeColors = Record<keyof typeof THEME_COLOR_VARS, string>;

function resolveThemeColors(): GraphThemeColors {
  const style = getComputedStyle(document.documentElement);
  return {
    node: style.getPropertyValue(THEME_COLOR_VARS.node).trim(),
    nodeHover: style.getPropertyValue(THEME_COLOR_VARS.nodeHover).trim(),
    link: style.getPropertyValue(THEME_COLOR_VARS.link).trim(),
  };
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

    return () => observer.disconnect();
  }, []);

  return colors;
}
