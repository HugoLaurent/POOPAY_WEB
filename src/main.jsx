import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// index.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Provider global = le thème s’applique à TOUTES les pages */}

    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
