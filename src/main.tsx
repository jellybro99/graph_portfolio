import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { PopupStackProvider } from "@/components/PopupStackProvider";

// Regular weight only: nothing on the page sets another. Fontsource ships
// per-script unicode-range faces, so browsers fetch just the Latin file.
import "@fontsource/jetbrains-mono/400.css";
import "./assets/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PopupStackProvider>
      <App />
    </PopupStackProvider>
  </StrictMode>,
);
