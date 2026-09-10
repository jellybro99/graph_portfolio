import { createContext, useContext } from "react";

export type CloseRef = React.RefObject<() => void>;

export const PopupStackContext = createContext<{
  register: (closeRef: CloseRef) => void;
  unregister: (closeRef: CloseRef) => void;
} | null>(null);

export function usePopupStack() {
  const ctx = useContext(PopupStackContext);
  if (!ctx) {
    throw new Error("usePopupStack must be used within a PopupStackProvider");
  }
  return ctx;
}
