import { describe, it, afterEach, vi, expect } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import Popup from "../../src/components/Popup";

afterEach(() => {
  cleanup();
});

function pressEscape() {
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
}

describe("Popup close stack", () => {
  it("closes only the topmost popup on Escape, then the next one on a later Escape", () => {
    const closeOuter = vi.fn();
    const closeInner = vi.fn();

    function Wrapper({ innerOpen }: { innerOpen: boolean }) {
      return (
        <>
          <Popup isOpen close={closeOuter} title="Outer">
            outer content
          </Popup>
          <Popup isOpen={innerOpen} close={closeInner} title="Inner">
            inner content
          </Popup>
        </>
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
        <>
          {/* Inline closures below get a new function identity on every render. */}
          <Popup isOpen close={() => closeOuter()} title="Outer">
            outer content
          </Popup>
          {innerOpen && (
            <Popup isOpen close={() => closeInner()} title="Inner">
              inner content
            </Popup>
          )}
        </>
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
});
