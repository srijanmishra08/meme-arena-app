import React, { useState, useEffect, useCallback } from "react";
import { Check, X, RefreshCw, ShieldCheck } from "lucide-react";
import { api } from "../api.js";

export default function Organizer() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  const load = useCallback(async (pc, st) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.orgListSubmissions(pc, st);
      setItems(data);
    } catch (e) {
      setError(e.message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const enter = async (e) => {
    e.preventDefault();
    try {
      await api.orgUnseenCount(passcode); // also validates the passcode
      setAuthed(true);
      load(passcode, status);
    } catch (e) {
      setError("Incorrect passcode.");
    }
  };

  useEffect(() => {
    if (!authed) return;
    load(passcode, status);
    const interval = setInterval(() => {
      load(passcode, status);
      api.orgUnseenCount(passcode).then((r) => setUnseenCount(r.unseenCount)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, status]);

  const act = async (id, action) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      if (action === "approve") await api.orgApprove(passcode, id);
      else await api.orgReject(passcode, id);
    } catch (e) {
      load(passcode, status);
    }
  };

  if (!authed) {
    return (
      <div className="page" style={{ maxWidth: 400 }}>
        <div className="login-card" style={{ boxShadow: "0 2px 10px rgba(10,47,36,0.08)" }}>
          <h1><ShieldCheck size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />Organizer access</h1>
          <p>Enter the shared organizer passcode to review submissions.</p>
          <form onSubmit={enter}>
            <input
              className="field-input"
              type="password"
              placeholder="Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Organizer dashboard {unseenCount > 0 && <span style={{ color: "#c0392b" }}>({unseenCount} new)</span>}</h2>
        <button className="icon-btn" onClick={() => { load(passcode, status); api.orgMarkSeen(passcode).then(() => setUnseenCount(0)); }}>
          <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh & mark seen
        </button>
      </div>

      <div className="org-tabs">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button key={s} className={`org-tab ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here</h3>
          <p>No submissions with this status right now.</p>
        </div>
      ) : (
        items.map((item) => (
          <div className="org-row" key={item.id}>
            <img className="org-thumb" src={item.imageUrl} alt={item.title} />
            <div className="org-info">
              <div className="org-title">{item.title}</div>
              <div className="org-meta">
                {item.submitterName} ({item.submitterEmail}) · {item.source} · {item.voteCount} votes
              </div>
            </div>
            {status === "pending" && (
              <div className="org-actions">
                <button className="btn-approve" onClick={() => act(item.id, "approve")}><Check size={14} /></button>
                <button className="btn-reject" onClick={() => act(item.id, "reject")}><X size={14} /></button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
