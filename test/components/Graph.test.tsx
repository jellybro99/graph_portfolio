import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import type { ForceGraphProps } from "react-force-graph-2d";
import Graph from "../../src/components/Graph";
import resolveHovered from "../../src/utils/resolveHovered";

// jsdom has no canvas 2D context, so force-graph cannot mount or hit-test a
// node. Mock the module, never the component under test: the real Graph still
// owns its container div and its containment handlers, and force-graph's props
// are captured so the test can drive a node hover and read the colours Graph
// resolves for it.
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

const HOVERED_NODE = 7;
const OTHER_NODE = 8;
const DEFAULT_COLOR = "#111111";
const HOVER_COLOR = "#222222";

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  window.matchMedia = vi.fn().mockImplementation(
    () =>
      ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  ) as unknown as typeof window.matchMedia;

  // jsdom implements neither ResizeObserver nor canvas sizing, and Graph's
  // mount effect constructs an observer to measure its container.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  // useGraphThemeColors resolves these; distinct values keep the colour
  // assertions below from passing for the wrong reason.
  document.documentElement.className = "";
  document.documentElement.style.setProperty("--color-node", DEFAULT_COLOR);
  document.documentElement.style.setProperty("--color-node-hover", HOVER_COLOR);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.matchMedia = originalMatchMedia;
  document.documentElement.className = "";
  document.documentElement.style.cssText = "";
});

// App turns the containment Graph reports into the node it highlights through
// resolveHovered, so wire the real Graph the same way (no list hover) and assert
// the colour the canvas would paint, not the callback that set it.
function GraphUnderPointerTracking() {
  const [graphHover, setGraphHover] = useState(-1);
  const [overGraph, setOverGraph] = useState(false);

  return (
    <Graph
      hovered={resolveHovered(overGraph, graphHover, false, -1)}
      setHovered={setGraphHover}
      setOverGraph={setOverGraph}
      setPopup={() => {}}
    />
  );
}

function capturedProps(): ForceGraphProps {
  if (!forceGraph.props) throw new Error("Graph did not render force-graph");
  return forceGraph.props;
}

// force-graph reports the node under the pointer; jsdom cannot, so the test
// plays that part through the props Graph handed the mocked module.
function hover(nodeId: number) {
  act(() => {
    capturedProps().onNodeHover?.({ id: nodeId }, null);
  });
}

function nodeColor(nodeId: number) {
  const { nodeColor: resolveColor } = capturedProps();
  if (typeof resolveColor !== "function") {
    throw new Error("Graph passed force-graph a non-function nodeColor");
  }
  return resolveColor({ id: nodeId });
}

function renderGraph() {
  const utils = render(<GraphUnderPointerTracking />);
  const container = utils.container.querySelector("div.absolute.inset-0");
  if (!container) throw new Error("Graph rendered no container");

  return { container: container as HTMLElement };
}

describe("Graph containment", () => {
  it("resolves a node to the hover colour when containment comes from movement, with no mouseenter", () => {
    const { container } = renderGraph();

    // The container is absolute inset-0 with no positioned ancestor, so it
    // covers the whole first viewport and the pointer is already inside it at
    // mount: no mouseenter ever fires. Movement inside it is the only
    // containment signal available, and force-graph reports a node hover only
    // after a pointermove has reached its canvas.
    fireEvent.mouseMove(container);
    hover(HOVERED_NODE);

    expect(nodeColor(HOVERED_NODE)).toBe(HOVER_COLOR);
    expect(nodeColor(OTHER_NODE)).toBe(DEFAULT_COLOR);
  });

  it("clears containment when the pointer leaves the container", () => {
    const { container } = renderGraph();

    fireEvent.mouseMove(container);
    hover(HOVERED_NODE);
    expect(nodeColor(HOVERED_NODE)).toBe(HOVER_COLOR);

    fireEvent.mouseLeave(container);

    expect(nodeColor(HOVERED_NODE)).toBe(DEFAULT_COLOR);
  });
});
