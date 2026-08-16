import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import usePrefersDarkMode from "../../src/utils/usePrefersDarkMode";

describe("usePrefersDarkMode", () => {
  let originalMatchMedia: MediaQueryList;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    vi.spyOn(document.documentElement, "classList", "get").mockReturnValue({
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  it("initializes correctly when system is on dark mode", async () => {
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn((event, listener) => {
            // Simulate immediate state
            if (typeof listener === "function") listener({ matches: true });
          }),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(document.documentElement.classList.add).toHaveBeenCalledWith("dark");
    expect(document.documentElement.classList.add).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("initializes correctly when system is on light mode", async () => {
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn((event, listener) => {
            if (typeof listener === "function") listener({ matches: false });
          }),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      "dark",
    );
    expect(document.documentElement.classList.remove).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("handles theme change to dark mode", async () => {
    vi.spyOn(globalThis, "matchMedia")
      .mockImplementation(
        () =>
          ({
            matches: false,
            addEventListener: vi.fn((event, listener) => {
              if (typeof listener === "function") {
                // Trigger dark mode
                listener({ matches: true });
              }
            }),
          }) as unknown as MediaQueryList,
      )
      .mockClear();

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(document.documentElement.classList.add).toHaveBeenCalledWith("dark");

    unmount();
  });

  it("handles theme change to light mode", async () => {
    vi.spyOn(globalThis, "matchMedia")
      .mockImplementation(
        () =>
          ({
            matches: true,
            addEventListener: vi.fn((event, listener) => {
              if (typeof listener === "function") {
                // Trigger light mode
                listener({ matches: false });
              }
            }),
          }) as unknown as MediaQueryList,
      )
      .mockClear();

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
      "dark",
    );

    unmount();
  });

  it("listens to the correct matchMedia query", async () => {
    const addEventListenerSpy = vi.spyOn(window, "matchMedia", "get");
    vi.spyOn(globalThis, "matchMedia")
      .mockImplementation(
        () =>
          ({
            matches: true,
            addEventListener: vi.fn(),
          }) as unknown as MediaQueryList,
      )
      .mockClear();

    const { unmount } = renderHook(() => usePrefersDarkMode());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)",
    );

    unmount();
  });

  it("does not call removeEventListener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "matchMedia", "get");
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => usePrefersDarkMode());

    // Initial addEventListener should be called
    expect(removeEventListenerSpy).not.toHaveBeenCalled();

    unmount();

    // removeEventListener should be called once on cleanup
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)",
    );
  });
});
