import React from "react";
import { Heart } from "lucide-react";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MemeCard({ meme, liked, onToggleVote }) {
  return (
    <div className="meme-card">
      <img src={meme.imageUrl} alt={meme.title} loading="lazy" />
      <div className="meme-card-body">
        <p className="meme-card-title">{meme.title}</p>
        <div className="meme-card-footer">
          <span className="meme-card-meta">
            {meme.submitterName} · {timeAgo(meme.submittedAt)}
          </span>
          <button
            className={`vote-btn ${liked ? "liked" : ""}`}
            onClick={() => onToggleVote(meme.id)}
          >
            <Heart size={13} fill={liked ? "#0A2F24" : "none"} />
            {meme.voteCount}
          </button>
        </div>
      </div>
    </div>
  );
}
