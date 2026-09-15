import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { Suspense, startTransition, useState } from "react";
import { render, cleanup, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Popup from "../../src/components/Popup";
import { PopupStackProvider } from "../../src/components/PopupStackProvider";

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

  it("calls the close prop that was committed, not one from a render React discarded", async () => {
    // A transition render that suspends is thrown away without being committed.
    // Popup registers a ref holding its close callback, so writing that ref
    // during render would leave the stack pointing at a callback from the
    // discarded render - Escape would then call a close nobody committed to.
    const committedClose = vi.fn();
    const discardedClose = vi.fn();
    let requestSuspend: ((suspend: boolean) => void) | null = null;

    const neverResolves = () => new Promise<void>(() => {});

    function Suspender({ suspend }: { suspend: boolean }) {
      if (suspend) throw neverResolves();
      return null;
    }

    function Wrapper() {
      const [suspend, setSuspend] = useState(false);
      requestSuspend = setSuspend;
      return (
        <PopupStackProvider>
          <Popup
            isOpen
            close={suspend ? discardedClose : committedClose}
            title="Project"
          >
            content
          </Popup>
          <Suspense fallback={null}>
            <Suspender suspend={suspend} />
          </Suspense>
        </PopupStackProvider>
      );
    }

    render(<Wrapper />);
    expect(document.body.textContent).toContain("content");

    await act(async () => {
      startTransition(() => requestSuspend?.(true));
    });

    // The suspended render was discarded, so the popup still shows.
    expect(document.body.textContent).toContain("content");

    pressEscape();

    expect(committedClose).toHaveBeenCalledTimes(1);
    expect(discardedClose).not.toHaveBeenCalled();
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

describe("Popup DOM placement", () => {
  it("renders the dialog as a child of document.body, not of whatever element nests <Popup> in JSX", () => {
    function AnimatedAncestor({ children }: { children: React.ReactNode }) {
      // Stands in for the outer project popup's animated wrapper div, which
      // applies a CSS transform via animate-popin/animate-popout. A fixed-
      // position descendant left under an ancestor like this is confined to
      // that ancestor's box instead of the viewport while the transform is
      // active - the layout bug behind the reported flash.
      return (
        <div
          data-testid="animated-ancestor"
          style={{ transform: "scale(0.9)" }}
        >
          {children}
        </div>
      );
    }

    render(
      <PopupStackProvider>
        <AnimatedAncestor>
          <Popup isOpen close={vi.fn()} title="Zoomed image">
            zoomed image
          </Popup>
        </AnimatedAncestor>
      </PopupStackProvider>,
    );

    const dialog = screen.getByRole("dialog");
    const ancestor = screen.getByTestId("animated-ancestor");

    expect(ancestor.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toBe(document.body);
  });

  it("portals nested popups (outer project popup + inner fullscreen popup) each directly under document.body", () => {
    function Nested({ innerOpen }: { innerOpen: boolean }) {
      return (
        <PopupStackProvider>
          <Popup isOpen close={vi.fn()} title="Project">
            <div>
              project card content
              <Popup isOpen={innerOpen} close={vi.fn()} title="Zoomed image">
                zoomed image
              </Popup>
            </div>
          </Popup>
        </PopupStackProvider>
      );
    }

    render(<Nested innerOpen={true} />);

    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(2);
    for (const dialog of dialogs) {
      expect(dialog.parentElement).toBe(document.body);
    }
  });

  it("carries its own text color class, since portalling to document.body means it can no longer inherit color from an app-level wrapper", () => {
    render(
      <PopupStackProvider>
        <Popup isOpen close={vi.fn()} title="Zoom">
          content
        </Popup>
      </PopupStackProvider>,
    );

    expect(screen.getByRole("dialog").className).toContain(
      "text-(--color-text)",
    );
  });
});

describe("Popup content", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the newly opened project's title and content after being reopened", () => {
    function Wrapper({
      isOpen,
      title,
      content,
    }: {
      isOpen: boolean;
      title: string;
      content: string;
    }) {
      return (
        <PopupStackProvider>
          <Popup isOpen={isOpen} close={vi.fn()} title={title}>
            {content}
          </Popup>
        </PopupStackProvider>
      );
    }

    const { rerender } = render(
      <Wrapper isOpen={true} title="First" content="first body" />,
    );
    expect(document.body.textContent).toContain("First");
    expect(document.body.textContent).toContain("first body");

    rerender(<Wrapper isOpen={false} title="First" content="first body" />);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(document.body.textContent).not.toContain("first body");

    rerender(<Wrapper isOpen={true} title="Second" content="second body" />);

    expect(document.body.textContent).toContain("Second");
    expect(document.body.textContent).toContain("second body");
    expect(document.body.textContent).not.toContain("First");
    expect(document.body.textContent).not.toContain("first body");
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

describe("Popup accessibility", () => {
  function popup(isOpen: boolean) {
    return (
      <PopupStackProvider>
        <Popup isOpen={isOpen} close={vi.fn()} title="Zoom">
          content
        </Popup>
      </PopupStackProvider>
    );
  }

  function closeButton() {
    return screen.getByRole("button", { name: "Close" });
  }

  it("exposes itself as a modal dialog with a labelled close button", () => {
    render(popup(true));

    expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("true");
    expect(closeButton()).toBeTruthy();
  });

  it("takes the dialog's accessible name from its visible title", () => {
    render(popup(true));

    const dialog = screen.getByRole("dialog", { name: "Zoom" });
    // The name has to come from the heading that is on screen, not from a
    // duplicate string: aria-labelledby must point at that exact element.
    const heading = screen.getByRole("heading", { name: "Zoom" });
    expect(heading.id).not.toBe("");
    expect(dialog.getAttribute("aria-labelledby")).toBe(heading.id);
  });

  it("leaves an untitled popup unnamed instead of pointing at the empty heading", () => {
    render(
      <PopupStackProvider>
        <Popup isOpen close={vi.fn()}>
          content
        </Popup>
      </PopupStackProvider>,
    );

    // The heading still renders (to the empty string), so a blind
    // aria-labelledby would announce a name that is present but blank.
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBeNull();
    expect(screen.queryByRole("dialog", { name: "" })).toBe(dialog);
  });

  it("leaves a whitespace-only title unassociated instead of naming the dialog blank", () => {
    render(
      <PopupStackProvider>
        <Popup isOpen close={vi.fn()} title="   ">
          content
        </Popup>
      </PopupStackProvider>,
    );

    // The heading keeps rendering the raw title, whose accessible name
    // normalizes to "": associating the dialog with it would announce a name
    // that is present but blank, which is what the untitled case avoids too.
    // The attribute is the only thing that can tell the two apart here: a
    // dialog takes its name from aria-labelledby and never from its contents,
    // so getByRole("dialog", { name: "" }) resolves whether or not the blank
    // heading is associated and cannot fail.
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBeNull();
    expect(screen.getByRole("heading").textContent).toBe("   ");
  });

  it("moves focus to the dialog itself when it opens, not to a control", () => {
    render(popup(true));

    // The container, not the close button: a control that receives focus on
    // open is ringed whenever the user agent calls the programmatic focus
    // keyboard-initiated, which is exactly what Chromium does here. jsdom
    // cannot settle whether a ring is painted, so this pins the only thing
    // that is under our control - which element ends up focused. It fails
    // under the previous behaviour, which focused the close button.
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
  });

  it("moves focus to the dialog itself when it reopens", () => {
    // On a reopen the container is not mounted yet on the commit that flips
    // isOpen back to true, so focus has to land after the render that mounts
    // it. The identity check fails both under the old close-button target and
    // if the focus move is dropped entirely, which leaves body focused.
    const { rerender } = render(popup(false));
    expect(document.activeElement).toBe(document.body);

    rerender(popup(true));

    expect(document.activeElement).toBe(screen.getByRole("dialog"));
  });

  it("reaches the close button with one Tab from the focused dialog", async () => {
    const user = userEvent.setup();
    render(popup(true));
    expect(document.activeElement).toBe(screen.getByRole("dialog"));

    await user.tab();

    // Pins the tab order the initial focus relies on: a Tab from the container
    // enters the dialog's own controls rather than continuing behind it, and
    // Close is the first of them. Fails if a focusable element is added inside
    // the dialog ahead of the close button. The starting assertion above is
    // what keeps this test honest: from body, a Tab would reach the close
    // button too.
    expect(document.activeElement).toBe(closeButton());
  });
});
