import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import MemeCard from "../components/MemeCard.jsx";
import { api } from "../api.js";

// Set this to your live Microsoft Forms link before deploying.
const MS_FORMS_URL = "https://forms.office.com/REPLACE-WITH-YOUR-FORM-LINK";

export default function Gallery({ identity }) {
  const [memes, setMemes] = useState([]);
  const [myVotes, setMyVotes] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("newest");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMemes();
      setMemes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    api.getMyVotes(identity.companyId)
      .then((data) => setMyVotes(new Set(data.submissionIds)))
      .catch(() => {});
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load, identity.companyId]);

  const toggleVote = async (id) => {
    // optimistic update
    const wasLiked = myVotes.has(id);
    setMyVotes((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(id) : next.add(id);
      return next;
    });
    setMemes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, voteCount: m.voteCount + (wasLiked ? -1 : 1) } : m))
    );
    try {
      await api.vote(id, identity.companyId, identity.email);
    } catch (e) {
      load(); // reconcile with server if something went wrong
    }
  };

  const sorted = [...memes].sort((a, b) =>
    sort === "newest" ? b.submittedAt - a.submittedAt : b.voteCount - a.voteCount
  );

  return (
    <>
      <div className="hero">
        <div className="hero-glow" />
        <div className="hero-ring" />
        <div className="hero-content">
          <h1>See what the office finds funny right now</h1>
          <p>Browse every submitted meme and vote for your favorites. One vote per meme, unlimited memes to love.</p>
          <a className="btn btn-primary" href={MS_FORMS_URL} target="_blank" rel="noreferrer">
            Submit a meme <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <div className="page">
        <div className="page-header">
          <h2>Gallery</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="icon-btn"
              onClick={() => setSort(sort === "newest" ? "top" : "newest")}
            >
              Sort: {sort === "newest" ? "Newest" : "Most loved"}
            </button>
            <button className="icon-btn" onClick={load}>
              <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <h3>No memes yet</h3>
            <p>Submit one through the form above — it'll show up here once an organizer approves it.</p>
          </div>
        ) : (
          <div className="grid">
            {sorted.map((m) => (
              <MemeCard key={m.id} meme={m} liked={myVotes.has(m.id)} onToggleVote={toggleVote} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
