import React, { useEffect, useState, useCallback } from "react";
import { Trophy, Crown, Heart, Users, RefreshCw } from "lucide-react";
import { api } from "../api.js";

function rankClass(i) {
  return i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
}

export default function Leaderboard() {
  const [data, setData] = useState({ topMemes: [], topSubmitters: [] });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.getLeaderboard());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Leaderboard</h2>
        <button className="icon-btn" onClick={load}>
          <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="leaderboard-grid">
        <div className="board-panel">
          <h3><Trophy size={16} color="#FFCE00" /> Top memes · most loved</h3>
          {data.topMemes.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-on-light-muted)" }}>No votes yet — go like some memes.</p>
          ) : (
            data.topMemes.map((m, i) => (
              <div className="board-row" key={m.id}>
                <span className={`rank-badge ${rankClass(i)}`}>{i + 1}</span>
                <img className="board-thumb" src={m.imageUrl} alt={m.title} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="board-name">{m.title}</div>
                  <div className="board-sub">{m.submitterName}</div>
                </div>
                <span className="board-count"><Heart size={13} fill="#FF5C7A" color="#FF5C7A" /> {m.voteCount}</span>
              </div>
            ))
          )}
        </div>

        <div className="board-panel">
          <h3><Crown size={16} color="#FFCE00" /> Meme legends · most submissions</h3>
          {data.topSubmitters.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-on-light-muted)" }}>Nobody's submitted yet — that could be you.</p>
          ) : (
            data.topSubmitters.map((s, i) => (
              <div className="board-row" key={s.submitterName}>
                <span className={`rank-badge ${rankClass(i)}`}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="board-name">{s.submitterName}</div>
                </div>
                <span className="board-count"><Users size={13} /> {s.submissionCount}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
