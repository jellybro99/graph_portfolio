import { describe, it, afterEach, vi, expect } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import ImageChanger from "../../src/components/ImageChanger";
import { PopupStackProvider } from "../../src/components/PopupStackProvider";
import type { Image } from "../../src/assets/types";

const images: Image[] = [
  {
    original: "obsidian-graph.png",
    blurred: "data:image/png;base64,placeholder",
    width: 1600,
    height: 900,
  },
];

function stubPointer(coarse: boolean) {
  window.matchMedia = vi.fn().mockImplementation(
    () =>
      ({
        get matches() {
          return coarse;
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  ) as unknown as typeof window.matchMedia;
}

function realImage(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector<HTMLImageElement>(
    "img:not([aria-hidden])",
  );
  if (!img) throw new Error("real image not rendered");
  return img;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ImageChanger zoom", () => {
  it("opens the zoom popup when the image is clicked with a coarse pointer", () => {
    stubPointer(true);

    const { container } = render(
      <PopupStackProvider>
        <ImageChanger images={images} title="Project" />
      </PopupStackProvider>,
    );

    expect(document.querySelector(".animate-popin")).toBeNull();

    fireEvent.click(realImage(container));

    expect(document.querySelector(".animate-popin")).not.toBeNull();
  });
});
