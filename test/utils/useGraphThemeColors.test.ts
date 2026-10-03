import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useGraphThemeColors from "../../src/utils/useGraphThemeColors";

describe("useGraphThemeColors", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.documentElement.style.setProperty("--color-node", "#111111");
    document.documentElement.style.setProperty("--color-node-hover", "#222222");
    document.documentElement.style.setProperty("--color-link", "#333333");
  });

  afterEach(() => {
    document.documentElement.className = "";
    document.documentElement.style.cssText = "";
    document.documentElement.removeAttribute("data-unrelated");
  });

  it("resolves theme colors from CSS custom properties on mount", () => {
    const { result, unmount } = renderHook(() => useGraphThemeColors());

    expect(result.current).toEqual({
      node: "#111111",
      nodeHover: "#222222",
      link: "#333333",
    });

    unmount();
  });

  it("re-resolves colors when the documentElement class changes", async () => {
    const { result, unmount } = renderHook(() => useGraphThemeColors());

    expect(result.current.node).toBe("#111111");

    document.documentElement.style.setProperty("--color-node", "#999999");
    document.documentElement.classList.add("dark");

    await waitFor(() => {
      expect(result.current.node).toBe("#999999");
    });

    unmount();
  });

  // A class change between render and observe() must still be picked up. In the
  // browser StrictMode causes this; jsdom keeps records across disconnect, so
  // the change is made in that window directly.
  it("resolves colors again once observing, catching changes since render", () => {
    let changed = false;
    const { result, unmount } = renderHook(() => {
      const colors = useGraphThemeColors();
      if (!changed) {
        changed = true;
        document.documentElement.style.setProperty("--color-node", "#999999");
        document.documentElement.classList.add("dark");
      }
      return colors;
    });

    expect(result.current.node).toBe("#999999");

    unmount();
  });

  it("does not re-resolve for unrelated attribute changes", async () => {
    const { result, unmount } = renderHook(() => useGraphThemeColors());
    const initial = result.current;

    document.documentElement.style.setProperty("--color-node", "#999999");
    document.documentElement.setAttribute("data-unrelated", "value");

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current).toBe(initial);

    unmount();
  });

  it("stops observing after unmount", async () => {
    const { result, unmount } = renderHook(() => useGraphThemeColors());
    unmount();

    document.documentElement.style.setProperty("--color-node", "#abcabc");
    document.documentElement.classList.add("dark");

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.node).toBe("#111111");
  });
});
