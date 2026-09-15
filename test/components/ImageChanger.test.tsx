import { describe, it, afterEach, vi, expect } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
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

// Three real assets, so the arrows have somewhere to step to and the wrap at
// both ends is reachable. The single-image `images` fixture above is what the
// arrow-hiding case needs.
const gallery: Image[] = [
  {
    original: "obsidian-graph.png",
    blurred: "data:image/png;base64,placeholder-one",
    width: 1600,
    height: 900,
  },
  {
    original: "graph-portfolio.png",
    blurred: "data:image/png;base64,placeholder-two",
    width: 900,
    height: 1600,
  },
  {
    original: "jellyboysplus.png",
    blurred: "data:image/png;base64,placeholder-three",
    width: 1200,
    height: 1200,
  },
];

// Two of `gallery`'s three files: the array a project with one fewer image
// would hand a still-mounted ImageChanger.
const shortened: Image[] = gallery.slice(0, 2);

// Same length, different files: the array a mounted ImageChanger can be handed
// in place of `gallery`.
const swapped: Image[] = [
  {
    original: "just-todo-something.png",
    blurred: "data:image/png;base64,placeholder-four",
    width: 1600,
    height: 900,
  },
  {
    original: "musical-zettelkasten.png",
    blurred: "data:image/png;base64,placeholder-five",
    width: 900,
    height: 1600,
  },
  {
    original: "sha256_cli.png",
    blurred: "data:image/png;base64,placeholder-six",
    width: 1200,
    height: 1200,
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

// With no popup open the two arrows are the only buttons in the tree, and the
// zoom popup contributes no button until it is open - which none of these
// cases do.
function renderChanger(imagesToShow: Image[]) {
  const utils = render(
    <PopupStackProvider>
      <ImageChanger images={imagesToShow} title="Project" />
    </PopupStackProvider>,
  );

  return {
    ...utils,
    next: () => fireEvent.click(screen.getByRole("button", { name: ">" })),
    prev: () => fireEvent.click(screen.getByRole("button", { name: "<" })),
    shown: () => realImage(utils.container).src,
  };
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

describe("ImageChanger navigation", () => {
  it("steps forward through the images and wraps from the last back to the first", () => {
    const changer = renderChanger(gallery);
    expect(changer.shown()).toContain(gallery[0].original);

    changer.next();
    expect(changer.shown()).toContain(gallery[1].original);

    changer.next();
    expect(changer.shown()).toContain(gallery[2].original);

    // Past the last image: (2 + 1) % 3 is the first one again.
    changer.next();
    expect(changer.shown()).toContain(gallery[0].original);
  });

  it("wraps backward from the first image to the last", () => {
    const changer = renderChanger(gallery);
    expect(changer.shown()).toContain(gallery[0].original);

    // Before the first image: (0 + 3 - 1) % 3 is the last one.
    changer.prev();
    expect(changer.shown()).toContain(gallery[2].original);

    changer.prev();
    expect(changer.shown()).toContain(gallery[1].original);
  });

  it("hides both arrows when there is only one image to show", () => {
    renderChanger(images);

    expect(screen.queryByRole("button", { name: ">" })).toBeNull();
    expect(screen.queryByRole("button", { name: "<" })).toBeNull();
  });

  // imageIndex is component state: replacing the images array under a mounted
  // ImageChanger leaves the position where the arrows put it. That is only safe
  // because the selection is guarded at read time, which the case below covers.
  it("keeps the selected position when the images array is replaced while mounted", () => {
    const { next, shown, rerender } = renderChanger(gallery);

    next();
    next();
    expect(shown()).toContain(gallery[2].original);

    rerender(
      <PopupStackProvider>
        <ImageChanger images={swapped} title="Project" />
      </PopupStackProvider>,
    );

    expect(shown()).toContain(swapped[2].original);
  });

  // The failure this guards: with the index read as images[imageIndex] and the
  // array replaced by a shorter one, ImageLoader receives undefined and
  // resolveImage(image.original) throws "Cannot read properties of undefined
  // (reading 'original')" from src/components/ImageLoader.tsx:14.
  //
  // Reachability, so the guard is not read as a live user-facing bug: the only
  // place ImageChanger is mounted is inside the project popup, and Popup
  // replaces its content during its 150ms popout while its own fixed inset-0
  // overlay still covers the list and the graph, so no real pointer can swap a
  // shorter array in under a mounted changer today. The swap itself is proven,
  // not hypothesised: reopening the popup within the popout window reuses the
  // instance and keeps its index.
  it("shows an image from the new array when it shrinks below the selected position", () => {
    const { next, shown, rerender } = renderChanger(gallery);

    next();
    next();
    expect(shown()).toContain(gallery[2].original);

    expect(() =>
      rerender(
        <PopupStackProvider>
          <ImageChanger images={shortened} title="Project" />
        </PopupStackProvider>,
      ),
    ).not.toThrow();

    expect(shortened.some((image) => shown().includes(image.original))).toBe(
      true,
    );
    expect(shown()).toContain(shortened[shortened.length - 1].original);
  });
});
