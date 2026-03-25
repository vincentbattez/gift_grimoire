import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./env";
import "./index.css";
import App from "./App.tsx";
import { ChasseTresor } from "./chasse_tresor/ChasseTresor.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const Root = location.pathname === "/tresor" ? ChasseTresor : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
