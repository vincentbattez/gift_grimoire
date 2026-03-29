import "./migrate"; // side-effect: migration v3 → feature stores
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./env";
import "./index.css";
import App from "./App.tsx";
import { ChasseTresor } from "./chasse_tresor/ChasseTresor.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const Root = location.pathname === "/tresor" ? ChasseTresor : App;

const rootEl = document.querySelector("#root");

if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
