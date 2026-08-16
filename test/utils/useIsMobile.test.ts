import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useIsMobile from "../../src/utils/useIsMobile";

describe("useIsMobile", () => {
  let originalMatchMedia: MediaQueryList;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn() as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  it("initializes correctly when pointer is coarse", () => {
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { result, unmount } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    unmount();
  });

  it("initializes correctly when pointer is fine", () => {
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { result, unmount } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    unmount();
  });

  it("updates when pointer type changes to coarse", () => {
    let changeHandler: (event: MediaQueryListEvent) => void = () => {};
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn((event, listener) => {
            changeHandler = listener as (event: MediaQueryListEvent) => void;
          }),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { result, unmount } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);

    unmount();
  });

  it("updates when pointer type changes to fine", () => {
    let changeHandler: (event: MediaQueryListEvent) => void = () => {};
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn((event, listener) => {
            changeHandler = listener as (event: MediaQueryListEvent) => void;
          }),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { result, unmount } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    act(() => {
      changeHandler({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);

    unmount();
  });

  it("listens to the correct matchMedia query", () => {
    const matchMediaSpy = vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => useIsMobile());

    expect(matchMediaSpy).toHaveBeenCalledWith("(pointer: coarse)");

    unmount();
  });

  it("calls removeEventListener on unmount", () => {
    const removeEventListener = vi.fn();
    vi.spyOn(globalThis, "matchMedia").mockImplementation(
      () =>
        ({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener,
        }) as unknown as MediaQueryList,
    );

    const { unmount } = renderHook(() => useIsMobile());

    expect(removeEventListener).not.toHaveBeenCalled();

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
