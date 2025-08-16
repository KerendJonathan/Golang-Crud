import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import MahasiswaList from "./pages/MahasiswaList.tsx";
import MahasiswaForm from "./pages/MahasiswaForm.tsx";
import { Toaster } from "sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <MahasiswaList /> },
      { path: "create", element: <MahasiswaForm /> },
      { path: "edit/:id", element: <MahasiswaForm /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster position="top-right" richColors />
    <RouterProvider router={router} />
  </React.StrictMode>
);
