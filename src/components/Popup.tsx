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

    addEventListener("keydown", closeOnEscape);

    return () => removeEventListener("keydown", closeOnEscape);
  }, [close]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xs" onClick={close} />

      {/* popup content */}
      <div className="relative z-10 p-2">
        <button
          className="absolute top-0 right-0 text-gray-500 hover:text-gray-800"
          onClick={close}
        >
          x
        </button>
        {children}
      </div>
    </div>
  );
}
