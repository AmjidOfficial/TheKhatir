import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="architecture-theme">
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ThemeProvider>
  </StrictMode>
);

// Register the PWA worker only in production. It caches same-origin app assets;
// Supabase/API requests are cross-origin and are deliberately left untouched.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("PWA service worker registration failed:", error);
    });
  });
}
