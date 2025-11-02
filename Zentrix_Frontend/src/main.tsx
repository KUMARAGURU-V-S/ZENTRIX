import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/main.css";

console.log("main.tsx loaded");

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Root element found, rendering app");
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  throw new Error('Root element not found');
}
