import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  fireEvent,
  cleanup,
  act,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import App from "../src/App";
import { PopupStackProvider } from "../src/components/PopupStackProvider";
import projects from "./fixtures/processedProjects.json";

type GraphProps = {
  hovered: number;
  setHovered: (value: number) => void;
  setOverGraph: (value: boolean) => void;
  setPopup: (popupId: number) => void;
};

type PopupProps = {
  isOpen: boolean;
  close: () => void;
  title?: string;
  children: ReactNode;
};

// App re-renders on every hover change, so the question this file answers is how
// far that render reaches. Each probe below watches a child of App that the
// hover state does not feed: if its count holds still across a hover sweep, the
// render stopped at the component that needed the value.
//
// Counting renders needs a hook inside the component's own render path, and a
// memo() wrapper hides it: React reads `.type` off the wrapper when the element
// mounts, and bails out of the wrapper while its props stay shallow-equal -
// which, for a component that takes no props, is every parent re-render. So a
// memo-wrapped export gets its inner function swapped for a counting
// passthrough (counts renders inside the memo boundary), while a plain export is
// wrapped outright (its wrapper runs once per parent render, which without a
// memo boundary is the same thing).
const probes = vi.hoisted(() => {
  const counts = { infoHeader: 0, aboutPage: 0, projectCard: 0 };

  function countRenders<T>(exported: T, key: keyof typeof counts): T {
    const memo = exported as unknown as {
      $$typeof?: symbol;
      type?: (...args: unknown[]) => unknown;
    };

    if (memo.$$typeof === Symbol.for("react.memo") && memo.type) {
      const render = memo.type;
      memo.type = (...args: unknown[]) => {
        counts[key] += 1;
        return render(...args);
      };
      return exported;
    }

    const render = exported as unknown as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => {
      counts[key] += 1;
      return render(...args);
    }) as T;
  }

  return { counts, countRenders };
});

const graph = vi.hoisted(() => ({
  props: undefined as GraphProps | undefined,
}));

// jsdom has no canvas 2D context, so force-graph cannot hit-test a node: stub
// Graph out the way test/App.test.tsx does and drive node hover through the
// props App hands it.
vi.mock("@/components/Graph", () => ({
  default: (props: GraphProps) => {
    graph.props = props;
    return null;
  },
}));

vi.mock("@/components/InfoHeader", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/InfoHeader")>();
  return { default: probes.countRenders(actual.default, "infoHeader") };
});

vi.mock("@/components/AboutPage", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/AboutPage")>();
  return { default: probes.countRenders(actual.default, "aboutPage") };
});

// The real ProjectCard is replaced by a counter: App hands it to Popup as
// `children`, and an element that keeps its identity is one React will not
// re-render.
vi.mock("@/components/ProjectCard", () => ({
  default: () => {
    probes.counts.projectCard += 1;
    return <div />;
  },
}));

const popupCalls = vi.hoisted(() => ({ records: [] as PopupProps[] }));

// Record what App passes Popup, then render the real one: Popup keeps its
// children in state and re-reads them whenever the prop changes, so running the
// real component is what makes the ProjectCard assertion mean anything.
vi.mock("@/components/Popup", async (importOriginal) => {
  const { createElement } = await import("react");
  const { default: RealPopup } =
    await importOriginal<typeof import("@/components/Popup")>();

  return {
    default: (props: PopupProps) => {
      popupCalls.records.push(props);
      return createElement(RealPopup, props);
    },
  };
});

const [alpha, beta] = projects;

// jsdom has no matchMedia; App reads it through usePrefersDarkMode.
let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  probes.counts.infoHeader = 0;
  probes.counts.aboutPage = 0;
  probes.counts.projectCard = 0;
  popupCalls.records.length = 0;

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
  // Scoped to the list: an open popup repeats the project title in its heading.
  const list = utils.getByText(alpha.title).closest("ul") as HTMLElement;
  const row = (title: string) => within(list).getByText(title);

  return {
    ...utils,
    props,
    row,
    list,
    // force-graph reports containment on its container and a node on its
    // canvas; the list reports rows on mouseenter. All of them re-render App.
    graphEnter: () => act(() => props().setOverGraph(true)),
    graphHover: (id: number) => act(() => props().setHovered(id)),
    enterList: () => fireEvent.mouseEnter(list),
    leaveList: () => fireEvent.mouseLeave(list),
  };
}

// force-graph reports a node only when the node under the pointer changes, so a
// sweep is a run of distinct ids ending off-node, plus the list's own row
// enter/leave pairs.
function sweepHover(app: ReturnType<typeof renderApp>) {
  app.graphEnter();
  for (const project of projects) app.graphHover(project.id);
  app.graphHover(-1);

  app.enterList();
  for (const project of projects) {
    fireEvent.mouseEnter(app.row(project.title));
    fireEvent.mouseLeave(app.row(project.title));
  }
  app.leaveList();
}

// App's popup is the one rendered without children while it is closed;
// AboutPage's always passes its own image.
function closedPopupCalls() {
  return popupCalls.records.filter((record) => record.children == null);
}

describe("App render scope while hovering", () => {
  it("does not re-render AboutPage when the pointer sweeps the graph and the list", () => {
    const app = renderApp();
    expect(probes.counts.aboutPage).toBe(1);

    sweepHover(app);

    expect(probes.counts.aboutPage).toBe(1);

    // Liveness: AboutPage still re-renders for its own state, so a count of 1
    // above is a component React skipped rather than a dead probe.
    fireEvent.click(app.getByRole("img"));
    expect(probes.counts.aboutPage).toBe(2);
  });

  it("does not re-render InfoHeader when the pointer sweeps the graph and the list", () => {
    const app = renderApp();
    expect(probes.counts.infoHeader).toBe(1);

    sweepHover(app);

    expect(probes.counts.infoHeader).toBe(1);

    // Liveness: a header that never renders again at all would make the count
    // above meaningless, so mount a second App and watch it render.
    cleanup();
    renderApp();
    expect(probes.counts.infoHeader).toBe(2);
  });

  it("does not re-render the open popup's card when the pointer sweeps the graph and the list", () => {
    const app = renderApp();

    fireEvent.click(app.row(alpha.title));
    expect(probes.counts.projectCard).toBe(1);

    sweepHover(app);

    expect(probes.counts.projectCard).toBe(1);

    // Liveness: another row is another project, so the card must be rebuilt.
    fireEvent.click(app.row(beta.title));
    expect(probes.counts.projectCard).toBe(2);
  });

  it("hands Graph and the popup the same handlers across hover renders", () => {
    const app = renderApp();

    const setPopupBefore = app.props().setPopup;
    const closedBefore = closedPopupCalls();
    expect(closedBefore.length).toBeGreaterThan(0);

    sweepHover(app);

    // The popup re-rendered during the sweep - only then does the identity
    // comparison below say anything about the handler App chose to pass.
    const closedAfter = closedPopupCalls();
    expect(closedAfter.length).toBeGreaterThan(closedBefore.length);

    expect(app.props().setPopup).toBe(setPopupBefore);
    expect(closedAfter.at(-1)?.close).toBe(closedBefore.at(-1)?.close);
  });
});
