// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Or App.css if you moved global styles
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"; // Import this
// import reportWebVitals from './reportWebVitals'; // Optional

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register(); // <--- KEY CHANGE: Call register()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
