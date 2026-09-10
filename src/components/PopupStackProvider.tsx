import { useCallback, useEffect, useRef } from "react";
import { PopupStackContext, type CloseRef } from "@/utils/usePopupStack";

export function PopupStackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const stackRef = useRef<CloseRef[]>([]);

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
    stackRef.current.push(closeRef);
    if (stackRef.current.length === 1) document.body.style.overflow = "hidden";
  }, []);

  const unregister = useCallback((closeRef: CloseRef) => {
    const index = stackRef.current.indexOf(closeRef);
    if (index !== -1) stackRef.current.splice(index, 1);
    if (stackRef.current.length === 0) document.body.style.overflow = "";
  }, []);

  return (
    <PopupStackContext.Provider value={{ register, unregister }}>
      {children}
    </PopupStackContext.Provider>
  );
}
