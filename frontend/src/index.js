import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import "./index.css";

function Root() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) return (
    <App
      onGoBack={() => {
        setShowApp(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }}
    />
  );
  return (
    <LandingPage
      onEnterApp={() => {
        setShowApp(true);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
