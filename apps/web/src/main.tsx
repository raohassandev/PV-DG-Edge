import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="app-title">
        <p className="eyebrow">PV-DG Edge</p>
        <h1 id="app-title">Local platform bootstrap</h1>
        <p>Phase 1 shell is ready for the operator, engineer, manager, and executive workflows.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
