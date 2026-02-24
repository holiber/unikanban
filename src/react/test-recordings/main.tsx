import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TestRecordingsPage } from "./TestRecordingsPage.js";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TestRecordingsPage />
  </StrictMode>,
);

