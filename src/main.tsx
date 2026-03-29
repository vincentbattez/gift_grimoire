import "./migrate"; // side-effect: migration v3 → feature stores
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./env";
import "./i18n/i18n"; // side-effect: i18n init
import "./index.css";
import App from "./App.tsx";
import { ChasseTresor } from "./chasse_tresor/ChasseTresor.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const Root = location.pathname === "/tresor" ? ChasseTresor : App;

const rootEl = document.querySelector("#root");

if (!rootEl) {
  // eslint-disable-next-line @typescript-eslint/only-throw-error -- Error object is thrown
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
