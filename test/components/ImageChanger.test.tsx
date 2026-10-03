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

function renderChanger(imagesToShow: Image[]) {
  const utils = render(
    <PopupStackProvider>
      <ImageChanger images={imagesToShow} title="Project" />
    </PopupStackProvider>,
  );

  return {
    ...utils,
    next: () =>
      fireEvent.click(screen.getByRole("button", { name: "Next image" })),
    prev: () =>
      fireEvent.click(screen.getByRole("button", { name: "Previous image" })),
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

describe("ImageChanger zoom trigger", () => {
  it("is a button named by the screenshot's alt text", () => {
    renderChanger(images);

    fireEvent.click(
      screen.getByRole("button", { name: "Screenshot of Project" }),
    );

    expect(document.querySelector(".animate-popin")).not.toBeNull();
  });

  it("numbers the alt text when there is more than one image", () => {
    renderChanger(gallery);

    expect(
      screen.getByRole("button", { name: "Screenshot of Project (1 of 3)" }),
    ).toBeTruthy();
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

    expect(screen.queryByRole("button", { name: "Next image" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous image" })).toBeNull();
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

  // Guards the read-time clamp: without it a shorter array hands ImageLoader
  // undefined. A real pointer can't reach this today (Popup's overlay covers
  // the page during the swap), but reopening within the exit animation does
  // reuse the instance and its index.
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
