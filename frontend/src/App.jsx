import React, { useState } from "react";
import NavBar from "./components/NavBar.jsx";
import IdentityGate from "./components/IdentityGate.jsx";
import Gallery from "./pages/Gallery.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Organizer from "./pages/Organizer.jsx";

export default function App() {
  const [identity, setIdentity] = useState(null);
  const [tab, setTab] = useState("gallery");

  // /organizer is a separate, passcode-gated area — no voter identity needed.
  if (window.location.pathname.startsWith("/organizer")) {
    return (
      <div className="app-shell">
        <Organizer />
      </div>
    );
  }

  if (!identity) {
    return <IdentityGate onEnter={setIdentity} />;
  }

  return (
    <div className="app-shell">
      <NavBar identity={identity} onLogout={() => setIdentity(null)} tab={tab} setTab={setTab} />
      {tab === "gallery" && <Gallery identity={identity} />}
      {tab === "leaderboard" && <Leaderboard />}
      {tab === "about" && <AboutUs />}
      <div className="footer">
        <a href="/organizer">Organizer login</a>
      </div>
    </div>
  );
}
