import { useState, useEffect } from "react";

const closePopupStack: Array<() => void> = [];

export default function Popup({
  isOpen,
  close,
  title,
  children,
}: {
  isOpen: boolean;
  close: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [renderedChildren, setRenderedChildren] =
    useState<React.ReactNode>(children);
  const [renderedTitle, setRenderedTitle] = useState<string | undefined>(title);

  useEffect(() => {
    let timerId: number | NodeJS.Timeout | undefined = undefined;

    if (isOpen) {
      setRenderedChildren(children);
      setRenderedTitle(title);
      setShouldRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      timerId = setTimeout(() => setShouldRender(false), 150);
    }
    return () => clearTimeout(timerId);
  }, [isOpen, children, title]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [close, isOpen]);

  return !shouldRender ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xs" onClick={close} />

      <div>
        <div
          className={`flex flex-col relative z-10 pb-2 px-2 border-(--color-text) border-2 rounded-sm 
         bg-[color-mix(in_srgb,var(--color-background)_60%,transparent)]
         max-w-[95vw] max-h-[90vh] overflow-auto ${isClosing ? "animate-popout" : "animate-popin"}`}
        >
          <div className="flex justify-between items-center gap-4 h-8">
            <h2>{renderedTitle}</h2>
            <button
              onClick={close}
              className="text-3xl cursor-pointer hover:text-(--color-accent)"
            >
              x
            </button>
          </div>
          {renderedChildren}
        </div>
      </div>
    </div>
  );
}
