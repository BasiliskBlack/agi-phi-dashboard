import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { WindowProvider } from "./contexts/WindowContext";
import { SystemProvider } from "./contexts/SystemContext";

createRoot(document.getElementById("root")!).render(
  <SystemProvider>
    <WindowProvider>
      <App />
    </WindowProvider>
  </SystemProvider>
);
