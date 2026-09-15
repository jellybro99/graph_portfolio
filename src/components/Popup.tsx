import { useState, useEffect, useLayoutEffect, useId, useRef } from "react";
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
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [renderedChildren, setRenderedChildren] =
    useState<React.ReactNode>(children);
  const [renderedTitle, setRenderedTitle] = useState<string | undefined>(title);

  const closeRef = useRef(close);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Ties role="dialog" to the heading that is actually on screen, so the
  // dialog's accessible name is the visible title rather than a duplicate
  // string.
  const titleId = useId();

  // Written in a layout effect, not during render: the popup stack calls
  // whatever closeRef.current holds, and a render that React discards
  // (StrictMode's double render, a suspended transition) would otherwise
  // leave the stack pointing at a callback that was never committed.
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

  // Initial focus on open, so a keyboard user lands inside the dialog instead
  // of tabbing through the page behind it. shouldRender is a dependency because
  // on a reopen the button is not mounted yet when the isOpen effect runs: only
  // the commit that mounts it can focus it. A full focus trap is out of scope.
  useEffect(() => {
    if (isOpen && shouldRender) closeButtonRef.current?.focus();
  }, [isOpen, shouldRender]);

  return !shouldRender ? null : (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      // renderedTitle is undefined when the optional title prop is omitted, and
      // the heading below then renders empty: labelling the dialog with it
      // would announce a name that is present but blank, which is worse than
      // no name at all. A whitespace-only title normalizes to that same blank
      // name, so the check trims before associating. Such a dialog stays
      // deliberately unnamed; the heading still renders the raw title.
      aria-labelledby={renderedTitle?.trim() ? titleId : undefined}
    >
      <div className="absolute inset-0 backdrop-blur-xs" onClick={close} />

      <div>
        <div
          className={`flex flex-col relative z-10 pb-2 px-2 border-(--color-text) border-2 rounded-sm
         bg-[color-mix(in_srgb,var(--color-background)_60%,transparent)]
         max-w-[95vw] max-h-[90vh] overflow-auto ${isClosing ? "animate-popout" : "animate-popin"}`}
        >
          <div className="flex justify-between items-center gap-4 h-8">
            <h2 id={titleId}>{renderedTitle}</h2>
            <button
              ref={closeButtonRef}
              aria-label="Close"
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
