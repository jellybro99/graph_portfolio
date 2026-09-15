import { useCallback, useEffect, useRef } from "react";
import { PopupStackContext, type CloseRef } from "@/utils/usePopupStack";

export function PopupStackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const stackRef = useRef<CloseRef[]>([]);
  const savedOverflowRef = useRef<string | null>(null);

  // The provider can unmount while popups are still registered, so release the
  // scroll lock from here too instead of relying on every popup's cleanup.
  useEffect(() => {
    return () => {
      if (savedOverflowRef.current === null) return;
      document.body.style.overflow = savedOverflowRef.current;
      savedOverflowRef.current = null;
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") stackRef.current.at(-1)?.current();
    };

    const preventSpacebarScroll = (event: KeyboardEvent) => {
      if (event.key === " " && stackRef.current.length > 0) {
        event.preventDefault();
      }
    };

    addEventListener("keydown", closeOnEscape);
    addEventListener("keydown", preventSpacebarScroll);
    return () => {
      removeEventListener("keydown", closeOnEscape);
      removeEventListener("keydown", preventSpacebarScroll);
    };
  }, []);

  const register = useCallback((closeRef: CloseRef) => {
    if (stackRef.current.length === 0) {
      savedOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    stackRef.current.push(closeRef);
  }, []);

  const unregister = useCallback((closeRef: CloseRef) => {
    const index = stackRef.current.indexOf(closeRef);
    if (index !== -1) stackRef.current.splice(index, 1);

    const savedOverflow = savedOverflowRef.current;
    if (stackRef.current.length > 0 || savedOverflow === null) return;

    document.body.style.overflow = savedOverflow;
    savedOverflowRef.current = null;
  }, []);

  return (
    <PopupStackContext.Provider value={{ register, unregister }}>
      {children}
    </PopupStackContext.Provider>
  );
}
