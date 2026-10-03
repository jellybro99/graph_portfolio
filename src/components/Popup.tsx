import { useState, useEffect, useLayoutEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { usePopupStack } from "@/utils/usePopupStack";
import { CloseIcon } from "@/components/icons";

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

  const closeRef = useRef(close);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const titleId = useId();

  // Updated in a layout effect, not during render: a render React discards
  // would leave the popup stack holding a close callback that was never
  // committed.
  useLayoutEffect(() => {
    closeRef.current = close;
  }, [close]);

  const { register, unregister } = usePopupStack();

  useEffect(() => {
    if (isOpen) {
      setRenderedChildren(children);
      setRenderedTitle(title);
    }
  }, [isOpen, children, title]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }
    setIsClosing(true);
    const timerId = setTimeout(() => setShouldRender(false), 150);
    return () => clearTimeout(timerId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    register(closeRef);
    return () => unregister(closeRef);
  }, [isOpen, register, unregister]);

  // Focus the dialog container on open, not the close button, so keyboard users
  // land inside the dialog without a ring on a control. Depends on shouldRender
  // because on a reopen the container mounts one render after isOpen flips.
  useEffect(() => {
    if (isOpen && shouldRender) dialogRef.current?.focus();
  }, [isOpen, shouldRender]);

  return !shouldRender
    ? null
    : createPortal(
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center text-(--color-text)"
          role="dialog"
          aria-modal="true"
          // A missing or whitespace-only title leaves the dialog unnamed rather
          // than announcing a blank name.
          aria-labelledby={renderedTitle?.trim() ? titleId : undefined}
        >
          <div className="absolute inset-0 backdrop-blur-xs" onClick={close} />

          <div>
            <div
              className={`flex flex-col relative z-10 pb-2 px-2 border-(--color-text) border-2
         bg-[color-mix(in_srgb,var(--color-background)_60%,transparent)]
         max-w-[95vw] max-h-[90vh] overflow-auto ${isClosing ? "animate-popout" : "animate-popin"}`}
            >
              <div className="flex justify-between items-center gap-4 h-8">
                <h2 id={titleId}>{renderedTitle}</h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="cursor-pointer hover:text-(--color-accent)"
                >
                  <CloseIcon />
                </button>
              </div>
              {renderedChildren}
            </div>
          </div>
        </div>,
        document.body,
      );
}
