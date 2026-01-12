import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Optionally include Bootstrap here globally
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// Render the main App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

