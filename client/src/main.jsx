import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.scss";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { AgentContextProvider } from "./context/AgentContext.jsx";

if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0].includes("findDOMNode") || 
      args[0].includes("DOMNodeInserted")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthContextProvider>
      <AgentContextProvider>
        <SocketContextProvider>
          <App />
        </SocketContextProvider>
      </AgentContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);