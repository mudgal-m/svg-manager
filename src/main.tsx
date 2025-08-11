import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SvgSizeProvider } from "./lib/useSvgSize.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SvgSizeProvider>
        <App />
      </SvgSizeProvider>
    </ThemeProvider>
  </StrictMode>
);
