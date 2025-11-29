import { useEffect } from "react";

export default function Popup({
  close,
  title,
  children,
}: {
  close: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };
    const noSpacebarScroll = (event: KeyboardEvent): void => {
      if (event.key === "Space") event.preventDefault();
    };

    document.body.style.overflow = "hidden";
    addEventListener("keydown", closeOnEscape);
    addEventListener("keydown", noSpacebarScroll);

    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", closeOnEscape);
      removeEventListener("keydown", noSpacebarScroll);
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xs" onClick={close} />

      {/* popup content */}
      <div className="relative z-10 p-2 border-(--color-text) border-2 rounded-sm bg-[color-mix(in_srgb,var(--color-background)_60%,transparent)]">
        <div className="flex justify-between gap-4 pb-4">
          <h2>{title}</h2>
          <button
            onClick={close}
            className="text-3xl cursor-pointer hover:text-(--color-accent)"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
