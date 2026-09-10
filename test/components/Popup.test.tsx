import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import Popup from "../../src/components/Popup";
import { PopupStackProvider } from "../../src/components/PopupStackProvider";

let matches = false;
let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;

beforeEach(() => {
  matches = false;
  changeHandler = undefined;
  window.matchMedia = vi.fn().mockImplementation(
    () =>
      ({
        get matches() {
          return matches;
        },
        addEventListener: (
          _event: string,
          handler: (event: MediaQueryListEvent) => void,
        ) => {
          changeHandler = handler;
        },
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  ) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function pressEscape() {
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}

function flipMobile(next: boolean) {
  matches = next;
  act(() => {
    changeHandler?.({ matches: next } as MediaQueryListEvent);
  });
}

describe("Popup close stack", () => {
  it("closes only the topmost popup on Escape, then the next one on a later Escape", () => {
    const closeOuter = vi.fn();
    const closeInner = vi.fn();

    function Wrapper({ innerOpen }: { innerOpen: boolean }) {
      return (
        <PopupStackProvider>
          <Popup isOpen close={closeOuter} title="Outer">
            outer content
          </Popup>
          <Popup isOpen={innerOpen} close={closeInner} title="Inner">
            inner content
          </Popup>
        </PopupStackProvider>
      );
    }

    const { rerender } = render(<Wrapper innerOpen={false} />);
    // Inner opens after outer, so inner is the topmost popup.
    rerender(<Wrapper innerOpen={true} />);

    pressEscape();

    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();

    // Parent reacts to closeInner by unmounting/closing the inner popup.
    rerender(<Wrapper innerOpen={false} />);

    pressEscape();

    expect(closeOuter).toHaveBeenCalledTimes(1);
  });

  it("keeps correct stacking order even when the close prop's identity changes on every render", () => {
    const closeOuter = vi.fn();
    const closeInner = vi.fn();

    function Wrapper({ innerOpen }: { innerOpen: boolean }) {
      return (
        <PopupStackProvider>
          {/* Inline closures below get a new function identity on every render. */}
          <Popup isOpen close={() => closeOuter()} title="Outer">
            outer content
          </Popup>
          {innerOpen && (
            <Popup isOpen close={() => closeInner()} title="Inner">
              inner content
            </Popup>
          )}
        </PopupStackProvider>
      );
    }

    const { rerender } = render(<Wrapper innerOpen={false} />);
    rerender(<Wrapper innerOpen={true} />);

    // Re-render the outer popup with brand-new inline closures, simulating
    // an unrelated parent re-render while both popups remain open.
    rerender(<Wrapper innerOpen={true} />);
    rerender(<Wrapper innerOpen={true} />);

    pressEscape();

    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();
  });

  it("closes the innermost popup first when nested inside another popup's content (matches App: a project popup containing ImageChanger's own fullscreen popup)", () => {
    const closeOuter = vi.fn();
    const closeInner = vi.fn();

    function Nested({ innerOpen }: { innerOpen: boolean }) {
      return (
        <PopupStackProvider>
          <Popup isOpen close={closeOuter} title="Project">
            <div>
              project card content
              <Popup isOpen={innerOpen} close={closeInner} title="Zoomed image">
                zoomed image
              </Popup>
            </div>
          </Popup>
        </PopupStackProvider>
      );
    }

    const { rerender } = render(<Nested innerOpen={false} />);
    rerender(<Nested innerOpen={true} />);

    pressEscape();

    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();
  });
});

describe("Popup mobile suppression", () => {
  it("does not render when suppressOnMobile is true and the viewport is mobile", () => {
    matches = true;

    render(
      <PopupStackProvider>
        <Popup isOpen close={vi.fn()} title="Zoom" suppressOnMobile>
          content
        </Popup>
      </PopupStackProvider>,
    );

    expect(document.querySelector(".animate-popin")).toBeNull();
  });

  it("renders when suppressOnMobile is true but the viewport is not mobile", () => {
    matches = false;

    render(
      <PopupStackProvider>
        <Popup isOpen close={vi.fn()} title="Zoom" suppressOnMobile>
          content
        </Popup>
      </PopupStackProvider>,
    );

    expect(document.querySelector(".animate-popin")).not.toBeNull();
  });

  it("force-closes an open popup when the viewport flips to mobile mid-open", () => {
    const close = vi.fn();

    render(
      <PopupStackProvider>
        <Popup isOpen close={close} title="Zoom" suppressOnMobile>
          content
        </Popup>
      </PopupStackProvider>,
    );

    expect(close).not.toHaveBeenCalled();

    flipMobile(true);

    expect(close).toHaveBeenCalledTimes(1);
  });
});

describe("Popup close animation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays in the DOM until the popout animation's 150ms timer elapses, then unmounts", () => {
    function Wrapper({ isOpen }: { isOpen: boolean }) {
      return (
        <PopupStackProvider>
          <Popup isOpen={isOpen} close={vi.fn()} title="Zoom">
            content
          </Popup>
        </PopupStackProvider>
      );
    }

    const { rerender } = render(<Wrapper isOpen={true} />);
    rerender(<Wrapper isOpen={false} />);

    expect(document.querySelector(".animate-popout")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(document.querySelector(".animate-popout")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(document.querySelector(".animate-popout")).toBeNull();
  });

  it("cancels the pending close timer if reopened before it fires", () => {
    const close = vi.fn();

    function Wrapper({ isOpen }: { isOpen: boolean }) {
      return (
        <PopupStackProvider>
          <Popup isOpen={isOpen} close={close} title="Zoom">
            content
          </Popup>
        </PopupStackProvider>
      );
    }

    const { rerender } = render(<Wrapper isOpen={true} />);
    rerender(<Wrapper isOpen={false} />);
    rerender(<Wrapper isOpen={true} />);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(document.querySelector(".animate-popin")).not.toBeNull();
  });
});
