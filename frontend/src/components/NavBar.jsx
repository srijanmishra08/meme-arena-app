import React from "react";
import { LogOut } from "lucide-react";

const TABS = [
  { id: "gallery", label: "Gallery" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "about", label: "About us" },
];

export default function NavBar({ identity, onLogout, tab, setTab }) {
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-mark" />
          Meme Arena
        </div>

        <div className="nav-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="identity-chip">
          {identity.companyId}
          <button onClick={onLogout} title="Switch user">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
