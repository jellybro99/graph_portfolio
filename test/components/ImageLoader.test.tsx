import { describe, it, afterEach, expect } from "vitest";
import { useLayoutEffect, useRef } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { flushSync } from "react-dom";
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

// Stands in for a cached image: the browser fires `load` as soon as the
// committed DOM carries the new src, which is after the commit's DOM mutations
// but before any passive effect of that commit has run. The first render is
// skipped so the test controls when the first image loads.
function CachedImageLoader({ image }: { image: Image }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

  useLayoutEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    wrapper.current
      ?.querySelector<HTMLImageElement>("img:not([aria-hidden])")
      ?.dispatchEvent(new Event("load"));
  }, [image]);

  return (
    <div ref={wrapper}>
      <ImageLoader image={image} onClick={() => {}} />
    </div>
  );
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

  // flushSync commits the image change synchronously and the enclosing act
  // scope holds back the follow-up render, so the assertions below see the DOM
  // the swap commit itself produced: the frame the browser paints before a
  // state-resetting effect can correct it.
  it("restores the placeholder in the commit that swaps the image, then reveals the new image on load", () => {
    const { container, rerender } = render(
      <ImageLoader image={firstImage} onClick={() => {}} />,
    );

    fireEvent.load(realImage(container));
    expect(realImage(container).className).toContain("opacity-100");

    act(() => {
      flushSync(() => {
        rerender(<ImageLoader image={secondImage} onClick={() => {}} />);
      });

      expect(realImage(container).src).toContain(secondImage.original);
      expect(placeholderImage(container).className).toContain("opacity-100");
      expect(realImage(container).className).toContain("opacity-0");
    });

    fireEvent.load(realImage(container));

    expect(realImage(container).className).toContain("opacity-100");
    expect(placeholderImage(container).className).toContain("opacity-0");
  });

  it("keeps a cached new image visible, even though it loads during the image change", () => {
    const { container, rerender } = render(
      <CachedImageLoader image={firstImage} />,
    );

    fireEvent.load(realImage(container));
    expect(realImage(container).className).toContain("opacity-100");

    rerender(<CachedImageLoader image={secondImage} />);

    // No further `load` event arrives for an already-cached image, so a reset
    // that lands after the load can never be undone.
    expect(realImage(container).src).toContain(secondImage.original);
    expect(realImage(container).className).toContain("opacity-100");
    expect(placeholderImage(container).className).toContain("opacity-0");
  });
});
