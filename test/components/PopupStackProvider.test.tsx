import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { StrictMode } from "react";
import { render, cleanup } from "@testing-library/react";
import Popup from "../../src/components/Popup";
import { PopupStackProvider } from "../../src/components/PopupStackProvider";

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation(
    () =>
      ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  ) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.style.overflow = "";
});

function ScrollLockedPopup({ isOpen }: { isOpen: boolean }) {
  return (
    <PopupStackProvider>
      <Popup isOpen={isOpen} close={vi.fn()} title="Zoom">
        content
      </Popup>
    </PopupStackProvider>
  );
}

describe("PopupStackProvider body scroll lock", () => {
  it("sets body overflow to hidden while a popup is open", () => {
    render(<ScrollLockedPopup isOpen />);

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores the overflow that was set before the popup opened, not an empty string", () => {
    document.body.style.overflow = "scroll";

    const { rerender } = render(<ScrollLockedPopup isOpen />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<ScrollLockedPopup isOpen={false} />);

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("restores the previous overflow when the provider unmounts with a popup still open", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = render(<ScrollLockedPopup isOpen />);
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("captures the previous overflow only on the first push and restores it only on the last pop", () => {
    document.body.style.overflow = "scroll";

    function TwoPopups({
      outerOpen,
      innerOpen,
    }: {
      outerOpen: boolean;
      innerOpen: boolean;
    }) {
      return (
        <PopupStackProvider>
          <Popup isOpen={outerOpen} close={vi.fn()} title="Outer">
            outer content
          </Popup>
          <Popup isOpen={innerOpen} close={vi.fn()} title="Inner">
            inner content
          </Popup>
        </PopupStackProvider>
      );
    }

    const { rerender } = render(<TwoPopups outerOpen innerOpen={false} />);
    expect(document.body.style.overflow).toBe("hidden");

    // Second push must not re-capture "hidden" as the value to restore.
    rerender(<TwoPopups outerOpen innerOpen />);
    expect(document.body.style.overflow).toBe("hidden");

    // First pop leaves the lock in place.
    rerender(<TwoPopups outerOpen innerOpen={false} />);
    expect(document.body.style.overflow).toBe("hidden");

    // Last pop releases it back to the pre-popup value.
    rerender(<TwoPopups outerOpen={false} innerOpen={false} />);
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("nets out to the correct end state under StrictMode double-invoked effects", () => {
    document.body.style.overflow = "scroll";

    function StrictWrapper({ isOpen }: { isOpen: boolean }) {
      return (
        <StrictMode>
          <ScrollLockedPopup isOpen={isOpen} />
        </StrictMode>
      );
    }

    const { rerender, unmount } = render(<StrictWrapper isOpen />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<StrictWrapper isOpen={false} />);
    expect(document.body.style.overflow).toBe("scroll");

    rerender(<StrictWrapper isOpen />);
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });
});
