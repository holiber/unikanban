import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StatsPage } from "./StatsPage.js";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StatsPage />
  </StrictMode>,
);
