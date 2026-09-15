import { useState, useEffect, useRef } from "react";
import { usePopupStack } from "@/utils/usePopupStack";

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
  const open = isOpen;

  const [shouldRender, setShouldRender] = useState<boolean>(open);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [renderedChildren, setRenderedChildren] =
    useState<React.ReactNode>(children);
  const [renderedTitle, setRenderedTitle] = useState<string | undefined>(title);

  const closeRef = useRef(close);
  closeRef.current = close;

  const { register, unregister } = usePopupStack();

  useEffect(() => {
    if (open) {
      setRenderedChildren(children);
      setRenderedTitle(title);
    }
  }, [open, children, title]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }
    setIsClosing(true);
    const timerId = setTimeout(() => setShouldRender(false), 150);
    return () => clearTimeout(timerId);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    register(closeRef);
    return () => unregister(closeRef);
  }, [open, register, unregister]);

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
