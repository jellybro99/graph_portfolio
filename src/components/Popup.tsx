import { useEffect } from "react";

const closePopupStack: Array<() => void> = [];

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
    closePopupStack.push(close);

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") closePopupStack.pop()?.();
    };

    const preventSpacebarScroll = (event: KeyboardEvent) => {
      if (event.key === " ") event.preventDefault();
    };

    if (closePopupStack.length == 1) {
      document.body.style.overflow = "hidden";
      addEventListener("keydown", closeOnEscape);
      addEventListener("keydown", preventSpacebarScroll);
    }

    return () => {
      const index = closePopupStack.indexOf(close);
      if (index !== -1) closePopupStack.splice(index, 1);

      if (closePopupStack.length == 0) {
        document.body.style.overflow = "";
        removeEventListener("keydown", closeOnEscape);
        removeEventListener("keydown", preventSpacebarScroll);
      }
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
