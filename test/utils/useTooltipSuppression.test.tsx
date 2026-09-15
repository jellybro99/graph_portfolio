import { describe, it, expect, afterEach } from "vitest";
import { createRef, type ReactNode, type RefObject } from "react";
import { render, cleanup } from "@testing-library/react";
import useTooltipSuppression from "../../src/utils/useTooltipSuppression";

// The hook reads containerRef.current inside its effect, so the container has
// to come from a real render: only React assigns the ref before effects run.
// jsdom creates a canvas *element* fine - it only has no 2D context, and this
// hook only touches style, so nothing here needs a canvas mock.
function Harness({
  hovered,
  containerRef,
  children,
}: {
  hovered: number;
  containerRef: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
}) {
  useTooltipSuppression(containerRef, hovered);

  return <div ref={containerRef}>{children}</div>;
}

// float-tooltip's visible state: the element force-graph appends to the
// container, and the canvas whose cursor Graph's own effect sets to "pointer"
// while a node is hovered.
function tooltipFixture() {
  return (
    <>
      <div className="float-tooltip-kap" style={{ display: "inline" }} />
      <canvas style={{ cursor: "pointer" }} />
    </>
  );
}

function renderHarness(hovered: number, children: ReactNode) {
  const containerRef = createRef<HTMLDivElement>();
  const view = render(
    <Harness hovered={hovered} containerRef={containerRef}>
      {children}
    </Harness>,
  );
  const container = containerRef.current;
  if (!container) throw new Error("Harness did not attach the container ref");

  return { container, view };
}

function tooltipOf(container: HTMLElement): HTMLElement {
  const tooltip = container.querySelector<HTMLElement>(".float-tooltip-kap");
  if (!tooltip) throw new Error("fixture has no tooltip element");
  return tooltip;
}

function canvasOf(container: HTMLElement): HTMLCanvasElement {
  const canvas = container.querySelector("canvas");
  if (!canvas) throw new Error("fixture has no canvas element");
  return canvas;
}

// The hook listens on the container, so the events are dispatched there - the
// element they bubble up to in the browser after starting at the canvas.
function dispatchMouse(
  container: HTMLElement,
  type: "mousemove" | "mouseover",
) {
  container.dispatchEvent(new MouseEvent(type, { bubbles: true }));
}

afterEach(() => {
  cleanup();
});

describe("useTooltipSuppression", () => {
  it("hides a stale tooltip on mousemove while nothing is hovered", () => {
    const { container } = renderHarness(-1, tooltipFixture());
    const tooltip = tooltipOf(container);
    const canvas = canvasOf(container);

    dispatchMouse(container, "mousemove");

    expect(tooltip.style.display).toBe("none");
    expect(canvas.style.cursor).toBe("default");
  });

  it("hides a stale tooltip on mouseover while nothing is hovered", () => {
    const { container } = renderHarness(-1, tooltipFixture());
    const tooltip = tooltipOf(container);
    const canvas = canvasOf(container);

    dispatchMouse(container, "mouseover");

    expect(tooltip.style.display).toBe("none");
    expect(canvas.style.cursor).toBe("default");
  });

  it("leaves a hovered tooltip alone", () => {
    const { container } = renderHarness(3, tooltipFixture());
    const tooltip = tooltipOf(container);
    const canvas = canvasOf(container);

    dispatchMouse(container, "mousemove");

    // Node 3 is hovered, so the tooltip on screen is legitimate: suppressing it
    // here would break the only feedback a hovered node has.
    expect(tooltip.style.display).toBe("inline");
    expect(canvas.style.cursor).toBe("pointer");
  });

  it("stops suppressing after unmount", () => {
    const { container, view } = renderHarness(-1, tooltipFixture());
    const tooltip = tooltipOf(container);
    const canvas = canvasOf(container);

    view.unmount();

    // Put the tooltip back in the state it would be in before a stale event.
    // Without this reset the assertions below would hold even if the listeners
    // had survived unmount, because a prior suppression is indistinguishable
    // from no suppression.
    tooltip.style.display = "inline";
    canvas.style.cursor = "pointer";

    dispatchMouse(container, "mousemove");

    expect(tooltip.style.display).toBe("inline");
    expect(canvas.style.cursor).toBe("pointer");
  });

  it("does not throw when the container holds neither a tooltip nor a canvas", () => {
    const { container } = renderHarness(-1, null);

    // jsdom does not let a throwing listener fail dispatchEvent - it reports
    // the error as an "error" event on window - so an expect(...).not.toThrow()
    // would pass whether or not the handler dereferences null. Collect the
    // reported errors instead.
    const listenerErrors: unknown[] = [];
    const onWindowError = (event: ErrorEvent) => {
      listenerErrors.push(event.error);
    };
    window.addEventListener("error", onWindowError);

    try {
      dispatchMouse(container, "mousemove");
      dispatchMouse(container, "mouseover");
    } finally {
      window.removeEventListener("error", onWindowError);
    }

    expect(listenerErrors).toEqual([]);
  });
});
