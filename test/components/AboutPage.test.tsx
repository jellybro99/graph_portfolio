import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
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
    const { container } = renderAboutPage();
    const images = () => Array.from(container.querySelectorAll("img"));

    expect(images()).toHaveLength(1);

    // Clicking the graph opens the zoom popup, which mounts a second copy.
    fireEvent.click(images()[0]);
    expect(images()).toHaveLength(2);

    for (const image of images()) {
      expect(image.getAttribute("alt")?.trim()).toBeTruthy();
    }
  });

  it("does not clip its own contents", () => {
    // jsdom has no layout, so this pins the class contract rather than the
    // rendered overflow: overflow-hidden on this box is what cut the bullet
    // list off inside the fixed-height section. Reachability by scrolling still
    // has to be checked in a browser.
    const { container } = renderAboutPage();

    expect(container.firstElementChild?.className).not.toContain(
      "overflow-hidden",
    );
  });
});
