import React from "react";

export default function AboutUs() {
  return (
    <div className="page">
      <div className="about-hero">
        <div className="oval-frame">Committee photo goes here</div>
        <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Sports & Cultural Committee</h2>
        <p style={{ color: "var(--text-on-light-muted)", fontSize: 14 }}>
          The people behind the Meme Arena — and everything else that makes work a little more fun.
        </p>
      </div>

      <div className="about-section">
        <h3>Who we are</h3>
        <p>
          Replace this paragraph with your committee's mission — what you organize, why it exists,
          and what people can expect from you across the year.
        </p>
        <span className="placeholder-note">TODO: add committee mission</span>
      </div>

      <div className="about-section">
        <h3>What we run</h3>
        <p>
          List your regular events here — sports tournaments, cultural celebrations, contests like
          this one, and anything else the committee organizes.
        </p>
        <span className="placeholder-note">TODO: add list of events/activities</span>
      </div>

      <div className="about-section">
        <h3>Meet the committee</h3>
        <div className="members-grid" style={{ marginTop: 14 }}>
          {[1, 2, 3, 4].map((i) => (
            <div className="member-card" key={i}>
              <div className="member-avatar" />
              <div className="member-name">Name {i}</div>
              <div className="member-role">Role</div>
            </div>
          ))}
        </div>
        <span className="placeholder-note" style={{ marginTop: 14 }}>TODO: replace with real committee members</span>
      </div>

      <div className="about-section">
        <h3>Get in touch</h3>
        <p>Questions, ideas, or want to volunteer for the next event? Reach out here.</p>
        <span className="placeholder-note">TODO: add contact email / Teams channel</span>
      </div>
    </div>
  );
}
