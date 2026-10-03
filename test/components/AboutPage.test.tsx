import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import AboutPage from "../../src/components/AboutPage";
import { PopupStackProvider } from "../../src/components/PopupStackProvider";

afterEach(cleanup);

function renderAboutPage() {
  return render(
    <PopupStackProvider>
      <AboutPage />
    </PopupStackProvider>,
  );
}

describe("AboutPage", () => {
  it("gives both of its images alternative text", () => {
    renderAboutPage();
    // The zoom popup portals to document.body rather than nesting under this
    // component's own container, so the query has to look at the whole body.
    const images = () => Array.from(document.body.querySelectorAll("img"));

    expect(images()).toHaveLength(1);

    // Clicking the graph opens the zoom popup, which mounts a second copy.
    fireEvent.click(images()[0]);
    expect(images()).toHaveLength(2);

    for (const image of images()) {
      expect(image.getAttribute("alt")?.trim()).toBeTruthy();
    }
  });

  it("opens the zoom popup from a button named by the image", () => {
    renderAboutPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "An Obsidian vault shown as a graph of linked notes",
      }),
    );

    expect(screen.getByRole("dialog", { name: "Obsidian Graph" })).toBeTruthy();
  });

  it("does not clip its own contents", () => {
    // jsdom has no layout, so this checks the class: overflow-hidden here clips
    // the bullet list.
    const { container } = renderAboutPage();

    expect(container.firstElementChild?.className).not.toContain(
      "overflow-hidden",
    );
  });
});
