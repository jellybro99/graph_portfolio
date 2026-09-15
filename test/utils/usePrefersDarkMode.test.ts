import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePrefersDarkMode from "../../src/utils/usePrefersDarkMode";

describe("usePrefersDarkMode", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn() as unknown as typeof window.matchMedia;
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove("dark");
    vi.clearAllMocks();
  });

  it("initializes correctly when system is on dark mode", () => {
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    unmount();
  });

  it("initializes correctly when system is on light mode", () => {
    document.documentElement.classList.add("dark");

    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    unmount();
  });

  it("handles theme change to dark mode", () => {
    let changeHandler: (event: MediaQueryListEvent) => void = () => {};
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn((_event, listener) => {
            changeHandler = listener as (event: MediaQueryListEvent) => void;
          }),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    // Initial light mode must not apply the dark class.
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    act(() => {
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    unmount();
  });

  it("handles theme change to light mode", () => {
    let changeHandler: (event: MediaQueryListEvent) => void = () => {};
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn((_event, listener) => {
            changeHandler = listener as (event: MediaQueryListEvent) => void;
          }),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    // Initial dark mode must apply the dark class.
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      changeHandler({ matches: false } as MediaQueryListEvent);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    unmount();
  });

  it("listens to the correct matchMedia query", () => {
    const matchMediaSpy = vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(matchMediaSpy).toHaveBeenCalledWith("(prefers-color-scheme: dark)");

    unmount();
  });

  it("removes the change listener on unmount", () => {
    const removeEventListener = vi.fn();
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener,
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    // Initial addEventListener should be called
    expect(removeEventListener).not.toHaveBeenCalled();

    unmount();

    // removeEventListener should be called once on cleanup
    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
