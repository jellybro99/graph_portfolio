import { useEffect } from "react";

export default function Popup({
  close,
  children,
}: {
  close: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", closeOnEscape);
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xs" onClick={close} />

      {/* popup content */}
      <div className="relative z-10 p-4 border-(--color-text) border-2 rounded-sm bg-[color-mix(in_srgb,var(--color-background)_60%,transparent)]">
        <button
          className="absolute top-0 right-0 hover:text-gray-500 -translate-y-2"
          onClick={close}
        >
          x
        </button>
        {children}
      </div>
    </div>
  );
}
