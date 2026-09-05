import React, { useState } from "react";
import { LogIn } from "lucide-react";

export default function IdentityGate({ onEnter }) {
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!companyId.trim()) return setError("Enter your company ID.");
    if (!email.includes("@") || !email.includes(".")) return setError("Enter a valid work email.");
    setError("");
    onEnter({ companyId: companyId.trim(), email: email.trim() });
  };

  return (
    <div className="login-screen">
      <div className="hero-glow" style={{ top: -160 }} />
      <form className="login-card" onSubmit={submit}>
        <h1>Who's voting today?</h1>
        <p>No password needed — this just keeps voting fair and stops duplicate votes.</p>

        <label className="field-label">Company ID</label>
        <input
          className="field-input"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="e.g. SE10234"
        />

        <label className="field-label">Work email</label>
        <input
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          <LogIn size={16} /> Continue
        </button>
      </form>
    </div>
  );
}
