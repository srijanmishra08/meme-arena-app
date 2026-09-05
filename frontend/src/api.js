const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getMemes: () => fetch(`${BASE}/memes`).then(handle),
  getLeaderboard: () => fetch(`${BASE}/leaderboard`).then(handle),
  getMyVotes: (voterCompanyId) =>
    fetch(`${BASE}/votes/mine?voterCompanyId=${encodeURIComponent(voterCompanyId)}`).then(handle),
  vote: (submissionId, voterCompanyId, voterEmail) =>
    fetch(`${BASE}/votes/${submissionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterCompanyId, voterEmail }),
    }).then(handle),

  // Organizer endpoints
  orgListSubmissions: (passcode, status = "pending") =>
    fetch(`${BASE}/organizer/submissions?status=${status}`, {
      headers: { "x-organizer-passcode": passcode },
    }).then(handle),
  orgApprove: (passcode, id) =>
    fetch(`${BASE}/organizer/submissions/${id}/approve`, {
      method: "POST",
      headers: { "x-organizer-passcode": passcode },
    }).then(handle),
  orgReject: (passcode, id) =>
    fetch(`${BASE}/organizer/submissions/${id}/reject`, {
      method: "POST",
      headers: { "x-organizer-passcode": passcode },
    }).then(handle),
  orgUnseenCount: (passcode) =>
    fetch(`${BASE}/organizer/notifications/unseen-count`, {
      headers: { "x-organizer-passcode": passcode },
    }).then(handle),
  orgMarkSeen: (passcode) =>
    fetch(`${BASE}/organizer/notifications/mark-seen`, {
      method: "POST",
      headers: { "x-organizer-passcode": passcode },
    }).then(handle),
};
