import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "react-query";
import App from "./App.tsx";
import "./styles/globals.css";
import { ThemeProvider, PRSProvider } from "@/components/";
import { Toaster } from "@/components/ui";
import { qc } from "@/lib/api";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <PRSProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </PRSProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
