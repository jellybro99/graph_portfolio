import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import type { ForceGraphProps } from "react-force-graph-2d";
import Graph from "../../src/components/Graph";

// Same reasoning as Graph.test.tsx: jsdom has no canvas 2D context, so
// force-graph cannot mount. Mock the module, never the component under test -
// the real Graph still owns its element tree and its hooks - and capture the
// props it hands the mocked module so this file can drive the callbacks and
// read the values force-graph would receive.
const forceGraph = vi.hoisted(() => ({
  props: undefined as ForceGraphProps | undefined,
}));

vi.mock("react-force-graph-2d", async () => {
  const { createElement } = await import("react");

  return {
    default: (props: ForceGraphProps) => {
      forceGraph.props = props;
      return createElement("canvas");
    },
  };
});

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

const resizeObservers: ResizeCallback[] = [];
let coarsePointer = false;
let originalMatchMedia: typeof window.matchMedia;

// jsdom has no matchMedia; useIsMobile reads it at mount to decide nodeLabel.
function stubPointer(pointer: "coarse" | "fine") {
  coarsePointer = pointer === "coarse";
  window.matchMedia = vi.fn().mockImplementation(
    () =>
      ({
        get matches() {
          return coarsePointer;
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  ) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  resizeObservers.length = 0;
  originalMatchMedia = window.matchMedia;
  stubPointer("fine");

  // jsdom has neither ResizeObserver nor layout. The class below records the
  // callback Graph's mount effect registers, so the test can hand it the
  // content rect a real observer would report for the container.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeCallback) {
        resizeObservers.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.matchMedia = originalMatchMedia;
});

function capturedProps(): ForceGraphProps {
  if (!forceGraph.props) throw new Error("Graph did not render force-graph");
  return forceGraph.props;
}

function renderGraph() {
  const setPopup = vi.fn();
  const setHovered = vi.fn();
  const setOverGraph = vi.fn();

  render(
    <Graph
      hovered={-1}
      setHovered={setHovered}
      setOverGraph={setOverGraph}
      setPopup={setPopup}
    />,
  );

  return { setPopup, setHovered, setOverGraph };
}

function nodeLabel(node: { id: number; name: string }): string | null {
  const label = capturedProps().nodeLabel;
  if (typeof label !== "function") {
    throw new Error("Graph passed force-graph a non-function nodeLabel");
  }
  return label(node) as unknown as string | null;
}

function measure(width: number, height: number) {
  const observer = resizeObservers.at(-1);
  if (!observer) throw new Error("Graph registered no ResizeObserver");

  act(() => {
    observer([
      { contentRect: { width, height } } as unknown as ResizeObserverEntry,
    ]);
  });
}

describe("Graph interaction", () => {
  it("reports the clicked node's id to setPopup as a number", () => {
    const { setPopup, setHovered } = renderGraph();

    // force-graph's NodeObject ids are typed string | number, and the route to
    // a project is a numeric id lookup over App's projects.
    act(() => {
      capturedProps().onNodeClick?.(
        { id: "12", name: "Twelve" },
        new MouseEvent("click"),
      );
    });

    expect(setPopup).toHaveBeenCalledWith(12);
    expect(setHovered).toHaveBeenCalledWith(-1);
  });

  it("labels a node with its name when the pointer is fine", () => {
    renderGraph();

    expect(nodeLabel({ id: 7, name: "Alpha" })).toBe("Alpha");
  });

  it("labels a node with nothing when the pointer is coarse", () => {
    stubPointer("coarse");
    renderGraph();

    // A coarse pointer has no hover to reveal a tooltip with, and force-graph
    // renders labels through float-tooltip, which needs no suppressing when
    // there is none.
    expect(nodeLabel({ id: 7, name: "Alpha" })).toBeNull();
  });

  it("passes the container size the ResizeObserver reports to force-graph", () => {
    renderGraph();

    expect(capturedProps().width).toBe(0);
    expect(capturedProps().height).toBe(0);

    measure(800, 600);

    expect(capturedProps().width).toBe(800);
    expect(capturedProps().height).toBe(600);
  });
});
