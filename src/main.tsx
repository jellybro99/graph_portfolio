import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { PopupStackProvider } from "@/components/PopupStackProvider";

// Regular weight only; nothing on the page uses another.
import "@fontsource/jetbrains-mono/400.css";
import "./assets/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PopupStackProvider>
      <App />
    </PopupStackProvider>
  </StrictMode>,
);
