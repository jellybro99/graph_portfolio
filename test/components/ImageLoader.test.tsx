import { describe, it, afterEach, expect } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import ImageLoader from "../../src/components/ImageLoader";
import type { Image } from "../../src/assets/types";

afterEach(() => {
  cleanup();
});

const firstImage: Image = {
  original: "graph-portfolio.png",
  blurred: "data:image/png;base64,placeholder-one",
  width: 1600,
  height: 900,
};

const secondImage: Image = {
  original: "obsidian-graph.png",
  blurred: "data:image/png;base64,placeholder-two",
  width: 900,
  height: 1600,
};

function placeholderImage(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector<HTMLImageElement>("img[aria-hidden]");
  if (!img) throw new Error("placeholder image not rendered");
  return img;
}

function realImage(container: HTMLElement): HTMLImageElement {
  const img = container.querySelector<HTMLImageElement>(
    "img:not([aria-hidden])",
  );
  if (!img) throw new Error("real image not rendered");
  return img;
}

describe("ImageLoader", () => {
  it("fades in the real image and fades out the placeholder once it loads", () => {
    const { container } = render(
      <ImageLoader image={firstImage} onClick={() => {}} />,
    );

    expect(placeholderImage(container).className).toContain("opacity-100");
    expect(realImage(container).className).toContain("opacity-0");

    fireEvent.load(realImage(container));

    expect(realImage(container).className).toContain("opacity-100");
    expect(placeholderImage(container).className).toContain("opacity-0");
  });

  it("shows the placeholder again when the image prop changes", () => {
    const { container, rerender } = render(
      <ImageLoader image={firstImage} onClick={() => {}} />,
    );

    fireEvent.load(realImage(container));
    expect(realImage(container).className).toContain("opacity-100");

    rerender(<ImageLoader image={secondImage} onClick={() => {}} />);

    expect(placeholderImage(container).className).toContain("opacity-100");
    expect(realImage(container).className).toContain("opacity-0");
  });
});
