import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import { LibraryPage } from "./pages/LibraryPage";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/svg-manager">
        <Routes>
          <Route element={<App />}>
            <Route index element={<LibraryPage />} />
            <Route path="/folders/:folderId" element={<LibraryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
