import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
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

  const utils = render(
    <ProjectList
      hovered={hovered}
      setHovered={setHovered}
      setOverList={setOverList}
      projects={projects}
      setPopup={vi.fn()}
    />,
  );

  return {
    ...utils,
    list: utils.getByText("Three").closest("ul") as HTMLElement,
    setHovered,
    setOverList,
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
});
