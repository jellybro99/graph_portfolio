import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import App from "../src/App";
import { PopupStackProvider } from "../src/components/PopupStackProvider";
import projects from "./fixtures/processedProjects.json";

type GraphProps = {
  hovered: number;
  setHovered: (value: number) => void;
  setOverGraph: (value: boolean) => void;
  setPopup: (popupId: number) => void;
};

// jsdom has no canvas 2D context, so force-graph cannot hit-test a node.
// Stub Graph out, keep the props App hands it, and let the test act as the
// graph side: report containment and node hover the way force-graph does.
const graph = vi.hoisted(() => ({
  props: undefined as GraphProps | undefined,
}));

vi.mock("@/components/Graph", () => ({
  default: (props: GraphProps) => {
    graph.props = props;
    return null;
  },
}));

const [alpha, beta] = projects;
const ACCENT = "text-(--color-accent)";

// jsdom has no matchMedia; App reads it through useApplyDarkModeClass.
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
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

function renderApp() {
  const utils = render(
    <PopupStackProvider>
      <App />
    </PopupStackProvider>,
  );

  const props = () => {
    if (!graph.props) throw new Error("App did not render Graph");
    return graph.props;
  };
  const row = (title: string) => utils.getByText(title);
  const list = row(alpha.title).closest("ul") as HTMLElement;

  return {
    ...utils,
    props,
    row,
    list,
    highlighted: (title: string) => row(title).className.includes(ACCENT),
    // force-graph reports containment on its container and node hover on the
    // canvas; both are wired to App by Graph, which is stubbed here.
    graphEnter: () => act(() => props().setOverGraph(true)),
    graphHover: (id: number) => act(() => props().setHovered(id)),
    enterList: () => fireEvent.mouseEnter(list),
    leaveList: () => fireEvent.mouseLeave(list),
  };
}

describe("App hover wiring", () => {
  it("highlights the list row of the node the graph reports", () => {
    const app = renderApp();

    app.graphEnter();
    app.graphHover(beta.id);

    expect(app.highlighted(beta.title)).toBe(true);
    expect(app.highlighted(alpha.title)).toBe(false);
    expect(app.props().hovered).toBe(beta.id);
  });

  it("moves the highlight to a different list row while the graph hover is stale", () => {
    const app = renderApp();

    // force-graph only reports a hover when the node under the pointer
    // changes, so after the pointer crosses onto the list this id stays set.
    app.graphEnter();
    app.graphHover(alpha.id);
    expect(app.highlighted(alpha.title)).toBe(true);

    app.enterList();
    // The list holds the pointer, so its own (empty) hover must win.
    expect(app.highlighted(alpha.title)).toBe(false);

    fireEvent.mouseEnter(app.row(beta.title));

    expect(app.highlighted(beta.title)).toBe(true);
    expect(app.highlighted(alpha.title)).toBe(false);
  });

  it("clears the highlight when nothing is hovered", () => {
    const app = renderApp();

    app.graphEnter();
    app.graphHover(alpha.id);
    expect(app.highlighted(alpha.title)).toBe(true);

    app.enterList();
    app.leaveList();
    act(() => app.props().setOverGraph(false));

    expect(app.highlighted(alpha.title)).toBe(false);
    expect(app.props().hovered).toBe(-1);
  });

  it("restores the node highlight when the pointer leaves the list onto that still-hovered node", () => {
    const app = renderApp();

    app.graphEnter();
    app.graphHover(alpha.id);

    app.enterList();
    fireEvent.mouseEnter(app.row(alpha.title));
    fireEvent.mouseLeave(app.row(alpha.title));
    // Back on the canvas, over a node force-graph never saw the pointer leave.
    app.leaveList();

    expect(app.highlighted(alpha.title)).toBe(true);
    expect(app.props().hovered).toBe(alpha.id);
  });

  it("opens the popup for the clicked list row", () => {
    const app = renderApp();

    fireEvent.click(app.row(beta.title));

    expect(app.getByRole("heading", { name: beta.title })).toBeTruthy();
    expect(app.getByText(beta.description)).toBeTruthy();
  });
});
