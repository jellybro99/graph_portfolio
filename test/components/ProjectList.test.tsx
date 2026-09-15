import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectList from "../../src/components/ProjectList";
import { type Project } from "../../src/assets/types";

const projects: Project[] = [
  {
    id: 3,
    title: "Three",
    link: "https://example.com/three",
    github: "",
    description: "",
    images: [],
    tags: [],
  },
  {
    id: 5,
    title: "Five",
    link: "https://example.com/five",
    github: "",
    description: "",
    images: [],
    tags: [],
  },
];

function renderList(hovered = -1) {
  const setHovered = vi.fn();
  const setOverList = vi.fn();
  const setPopup = vi.fn();
  const setFocusHover = vi.fn();

  const utils = render(
    <ProjectList
      hovered={hovered}
      setHovered={setHovered}
      setOverList={setOverList}
      projects={projects}
      setPopup={setPopup}
      setFocusHover={setFocusHover}
    />,
  );

  return {
    ...utils,
    list: utils.getByText("Three").closest("ul") as HTMLElement,
    setHovered,
    setOverList,
    setPopup,
    setFocusHover,
  };
}

afterEach(cleanup);

describe("ProjectList", () => {
  it("reports containment when the pointer enters and leaves the list", () => {
    // App derives the hovered project from pointer containment, and the list
    // must say when it holds the pointer: force-graph reports no pointer-leave,
    // so nothing else can tell App that a stale graph hover must stop winning.
    const { list, setOverList } = renderList();

    fireEvent.mouseEnter(list);
    expect(setOverList).toHaveBeenLastCalledWith(true);

    fireEvent.mouseLeave(list);
    expect(setOverList).toHaveBeenLastCalledWith(false);
  });

  it("reports the row the pointer is on", () => {
    const { getByText, setHovered } = renderList();

    fireEvent.mouseEnter(getByText("Five"));
    expect(setHovered).toHaveBeenLastCalledWith(5);

    fireEvent.mouseLeave(getByText("Five"));
    expect(setHovered).toHaveBeenLastCalledWith(-1);
  });

  it("renders the highlighted row for the project it is told is hovered", () => {
    const { getByText } = renderList(5);

    expect(getByText("Five").className).toContain("text-(--color-accent)");
    expect(getByText("Three").className).not.toContain("text-(--color-accent)");
  });

  it("shows the pointer cursor on every row, hovered or not", () => {
    // The cursor used to be conditional on the hover class, so a row gave no
    // click affordance until the pointer was already on it.
    const { getByText } = renderList(5);

    expect(getByText("Three").className).toContain("cursor-pointer");
    expect(getByText("Five").className).toContain("cursor-pointer");
  });

  it("exposes each row as a native button inside its list item", () => {
    const { getByRole, getAllByRole } = renderList();

    const row = getByRole("button", { name: "Three" });
    expect(row.tagName).toBe("BUTTON");
    // Without type="button" the button defaults to type="submit".
    expect(row.getAttribute("type")).toBe("button");
    expect(row.closest("li")).not.toBeNull();

    // One button per row: the list items are not ARIA-patched into extra
    // buttons, which is what a role="button" on the <li> would produce.
    expect(getAllByRole("button")).toHaveLength(projects.length);
    const item = row.closest("li") as HTMLElement;
    expect(item.getAttribute("role")).toBeNull();
    expect(item.getAttribute("tabindex")).toBeNull();
  });

  it("reaches every row with Tab", async () => {
    const user = userEvent.setup();
    const { getByRole } = renderList();

    await user.tab();
    expect(document.activeElement).toBe(getByRole("button", { name: "Three" }));

    await user.tab();
    expect(document.activeElement).toBe(getByRole("button", { name: "Five" }));
  });

  it("opens the focused row with Enter", async () => {
    const user = userEvent.setup();
    const { setPopup } = renderList();

    await user.tab();
    await user.keyboard("{Enter}");

    expect(setPopup).toHaveBeenLastCalledWith(3);
  });

  it("opens the focused row with Space", async () => {
    const user = userEvent.setup();
    const { setPopup } = renderList();

    await user.tab();
    await user.keyboard(" ");

    // jsdom has no layout and never scrolls (window.scrollTo is a
    // not-implemented stub and no event scrolls the document), so the "Space
    // did not scroll the page" half of ticket 30 cannot be observed here: an
    // assertion on window.scrollY passes for any implementation. What is
    // observable - and what a hand-rolled keydown handler gets wrong - is that
    // Space activates the row at all: user-event fires this click only for a
    // real <button>. The scroll itself is left to the operator check.
    expect(setPopup).toHaveBeenLastCalledWith(3);
  });

  it("reports the row that holds keyboard focus", () => {
    // App needs the focused id as its own source: it must not be written into
    // the pointer-containment flag, or tabbing away from a row would clear a
    // mouse highlight that is still valid.
    const { getByRole, setFocusHover } = renderList();
    const row = getByRole("button", { name: "Five" });

    act(() => row.focus());
    expect(setFocusHover).toHaveBeenLastCalledWith(5);

    act(() => row.blur());
    expect(setFocusHover).toHaveBeenLastCalledWith(-1);
  });
});
