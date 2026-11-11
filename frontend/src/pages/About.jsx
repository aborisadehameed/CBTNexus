import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ─── tiny hook: fade-in elements as they scroll into view ─── */
function useScrollReveal(selector) {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector]);
}

const FEATURES = [
  {
    icon: "⏱️",
    title: "Timed CBT Practice",
    desc: "Simulate the real exam environment with countdown timers, automatic submission, and JAMB-style question navigation.",
  },
  {
    icon: "📊",
    title: "JAMB Score Engine",
    desc: "Get your score calculated exactly as JAMB does — with per-subject breakdowns and overall aggregate calculation.",
  },
  {
    icon: "🏆",
    title: "Live Leaderboard",
    desc: "See how you rank against thousands of other students in real-time. Compete, improve, and rise to the top.",
  },
  {
    icon: "✅",
    title: "Instant Corrections",
    desc: "Review every question after each test — see the right answer, explanations, and track your weak areas over time.",
  },
  {
    icon: "🎮",
    title: "Learning Games",
    desc: "Reinforce knowledge through interactive quiz games designed to make studying less of a chore and more of a thrill.",
  },
  {
    icon: "📰",
    title: "News & Updates",
    desc: "Stay current with JAMB/WAEC/NECO announcements, syllabus changes, and exam-day tips from our curated news feed.",
  },
];

const STATS = [
  { value: "1,000+", label: "Practice Questions" },
  { value: "3", label: "Exams Supported (JAMB · WAEC · NECO)" },
  { value: "₦3,000", label: "One-Time Lifetime Access" },
  { value: "24/7", label: "Available Anytime, Anywhere" },
];

const STEPS = [
  {
    num: "01",
    title: "Create Your Account",
    desc: "Sign up in seconds with just your name and email. No complicated forms, no hidden fees.",
  },
  {
    num: "02",
    title: "Pay Once, Access Forever",
    desc: "A one-time payment of ₦3,000 unlocks unlimited CBT practice for all subjects and exam types — for life.",
  },
  {
    num: "03",
    title: "Practice & Excel",
    desc: "Take timed tests, review corrections, climb the leaderboard, and walk into exam halls with total confidence.",
  },
];

const About = () => {
  useScrollReveal(".reveal");

  return (
    <>
      <style>{`
        /* ── Reset & base ── */
        .about-page {
          font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
          color: #1a1a2e;
          background: #f8fdfd;
          overflow-x: hidden;
        }

        /* ── Hero ── */
        .about-hero {
          position: relative;
          min-height: 88vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 7rem 1.5rem 5rem;
          background: linear-gradient(135deg, #0d3b3b 0%, #1a6060 40%, #2F9E9D 100%);
          overflow: hidden;
        }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.25;
          pointer-events: none;
        }
        .hero-blob-1 {
          width: 500px; height: 500px;
          background: #76C7C0;
          top: -120px; left: -150px;
          animation: subtleFloat 8s ease-in-out infinite;
        }
        .hero-blob-2 {
          width: 400px; height: 400px;
          background: #2F9E9D;
          bottom: -100px; right: -100px;
          animation: subtleFloat 10s ease-in-out infinite reverse;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          color: #a8f0ed;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 1.4rem;
          backdrop-filter: blur(8px);
          animation: fadeInUp 0.6s ease both;
        }
        .hero-title {
          font-size: clamp(2.4rem, 7vw, 5rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 1.2rem;
          animation: fadeInUp 0.7s 0.1s ease both;
        }
        .hero-title span {
          background: linear-gradient(90deg, #76C7C0, #a8f0ed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: rgba(255,255,255,0.78);
          max-width: 620px;
          margin: 0 auto 2.4rem;
          line-height: 1.7;
          animation: fadeInUp 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.7s 0.3s ease both;
        }
        .btn-hero-primary {
          background: #fff;
          color: #1a6060;
          font-weight: 700;
          font-size: 1rem;
          padding: 14px 32px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .btn-hero-primary:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 30px rgba(0,0,0,0.22);
        }
        .btn-hero-outline {
          background: transparent;
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          padding: 13px 32px;
          border-radius: 100px;
          border: 2px solid rgba(255,255,255,0.45);
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-hero-outline:hover {
          background: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }
        .hero-scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.45);
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          animation: fadeInUp 1s 0.8s ease both;
        }
        .scroll-arrow {
          width: 20px; height: 20px;
          border-right: 2px solid rgba(255,255,255,0.4);
          border-bottom: 2px solid rgba(255,255,255,0.4);
          transform: rotate(45deg);
          animation: bounceDown 1.6s ease-in-out infinite;
        }
        @keyframes bounceDown {
          0%,100% { transform: rotate(45deg) translateY(0); }
          50% { transform: rotate(45deg) translateY(6px); }
        }

        /* ── Section shell ── */
        .about-section {
          padding: 5rem 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #2F9E9D;
          margin-bottom: 0.6rem;
        }
        .section-title {
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 1rem;
          line-height: 1.2;
        }
        .section-desc {
          font-size: 1.05rem;
          color: #4a5568;
          line-height: 1.75;
          max-width: 650px;
          margin-bottom: 3rem;
        }

        /* ── Scroll reveal ── */
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .reveal.revealed {
          opacity: 1;
          transform: none;
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
        .reveal-delay-5 { transition-delay: 0.5s; }
        .reveal-delay-6 { transition-delay: 0.6s; }

        /* ── Mission ── */
        .mission-wrap {
          background: linear-gradient(135deg, #e8faf9 0%, #f0fffe 100%);
          border-radius: 24px;
          padding: 4rem 2.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          border: 1px solid #c5ebe9;
        }
        @media (max-width: 700px) {
          .mission-wrap { grid-template-columns: 1fr; padding: 2.5rem 1.5rem; }
        }
        .mission-icon-wrap {
          font-size: 5rem;
          line-height: 1;
          text-align: center;
          animation: subtleFloat 5s ease-in-out infinite;
        }
        .mission-text h2 {
          font-size: 1.9rem;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 1rem;
        }
        .mission-text p {
          color: #4a5568;
          line-height: 1.8;
          margin: 0 0 1rem;
        }
        .mission-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #2F9E9D;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 100px;
          margin: 2px 4px 2px 0;
        }

        /* ── Stats ── */
        .stats-band {
          background: linear-gradient(135deg, #1a6060, #2F9E9D);
          border-radius: 24px;
          padding: 3rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 2rem;
          text-align: center;
        }
        .stat-item {}
        .stat-value {
          font-size: 2.4rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          margin-bottom: 0.4rem;
        }
        .stat-label {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.75);
          font-weight: 500;
          line-height: 1.4;
        }
        .stat-divider {
          width: 2px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          margin: 0 auto;
          display: none;
        }
        @media (min-width: 700px) { .stat-divider { display: block; } }

        /* ── Features ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          background: #fff;
          border: 1px solid #e2f7f6;
          border-radius: 20px;
          padding: 2rem 1.6rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(47,158,157,0.14);
          border-color: #2F9E9D;
        }
        .feature-icon {
          font-size: 2.4rem;
          margin-bottom: 1rem;
          display: block;
          line-height: 1;
        }
        .feature-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 0.5rem;
        }
        .feature-desc {
          font-size: 0.93rem;
          color: #64748b;
          line-height: 1.65;
          margin: 0;
        }

        /* ── How it works ── */
        .steps-wrap {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
          position: relative;
        }
        .step-card {
          background: #fff;
          border-radius: 20px;
          padding: 2.4rem 1.8rem;
          border: 1px solid #e2f7f6;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 36px rgba(47,158,157,0.12);
        }
        .step-num {
          font-size: 4rem;
          font-weight: 900;
          color: #2F9E9D;
          opacity: 0.12;
          position: absolute;
          top: 0.6rem;
          right: 1.2rem;
          line-height: 1;
          pointer-events: none;
          font-variant-numeric: tabular-nums;
        }
        .step-badge {
          display: inline-block;
          background: linear-gradient(135deg, #2F9E9D, #1a6060);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 1rem;
        }
        .step-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 0.6rem;
        }
        .step-desc {
          font-size: 0.93rem;
          color: #64748b;
          line-height: 1.65;
          margin: 0;
        }

        /* ── Location / Contact ── */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 640px) { .contact-grid { grid-template-columns: 1fr; } }
        .contact-card {
          background: #fff;
          border: 1px solid #e2f7f6;
          border-radius: 20px;
          padding: 2rem 1.8rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(47,158,157,0.1);
          border-color: #2F9E9D;
        }
        .contact-card-icon {
          font-size: 2rem;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .contact-card-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #2F9E9D;
          margin-bottom: 4px;
        }
        .contact-card-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a2e;
          line-height: 1.5;
        }
        .contact-card-sub {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 2px;
        }

        /* ── CTA ── */
        .cta-section {
          background: linear-gradient(135deg, #0d3b3b 0%, #1a6060 60%, #2F9E9D 100%);
          border-radius: 28px;
          padding: 5rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          margin: 0 1.5rem 5rem;
        }
        .cta-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2376C7C0' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .cta-title {
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 1rem;
          position: relative;
        }
        .cta-sub {
          font-size: 1.08rem;
          color: rgba(255,255,255,0.75);
          max-width: 540px;
          margin: 0 auto 2.4rem;
          line-height: 1.7;
          position: relative;
        }
        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
        }
        .btn-cta-white {
          background: #fff;
          color: #1a6060;
          font-weight: 700;
          font-size: 1.02rem;
          padding: 14px 36px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .btn-cta-white:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 30px rgba(0,0,0,0.22);
        }
        .btn-cta-outline {
          background: transparent;
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          padding: 13px 34px;
          border-radius: 100px;
          border: 2px solid rgba(255,255,255,0.4);
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-cta-outline:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        /* ── Footer note ── */
        .about-footer-note {
          text-align: center;
          padding: 1.5rem;
          font-size: 0.85rem;
          color: #94a3b8;
          border-top: 1px solid #e8f7f7;
          margin-top: 1rem;
        }

        /* ── Keyframes ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>

      <div className="about-page">

        {/* ══ HERO ══ */}
        <section className="about-hero">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="hero-badge">🇳🇬 Built for Nigerian Students</div>
            <h1 className="hero-title">
              Your Shortcut to <span>Exam Success</span>
            </h1>
            <p className="hero-sub">
              CBT Nexus is Nigeria's dedicated Computer Based Testing platform —
              helping students ace JAMB, WAEC, and NECO with realistic timed
              practice, instant corrections, and live leaderboards.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">
                Get Started Free 🚀
              </Link>
              <Link to="/contact" className="btn-hero-outline">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="hero-scroll-hint">
            <span>Scroll</span>
            <div className="scroll-arrow" />
          </div>
        </section>

        {/* ══ MISSION ══ */}
        <section className="about-section">
          <div className="mission-wrap reveal">
            <div className="mission-icon-wrap">🎯</div>
            <div className="mission-text">
              <p className="section-label">Our Mission</p>
              <h2>Democratising Exam Preparation in Nigeria</h2>
              <p>
                Every year, millions of Nigerian students sit for JAMB, WAEC, and
                NECO. Many fail — not for lack of intelligence, but for lack of
                access to quality, affordable practice tools. CBT Nexus changes that.
              </p>
              <p>
                We built a platform that is fast, mobile-friendly, and costs less than
                a plate of rice — a single one-time payment that unlocks unlimited
                practice forever. No subscription traps. No expiry dates.
              </p>
              <div style={{ marginTop: "1.2rem" }}>
                <span className="mission-pill">📚 JAMB</span>
                <span className="mission-pill">📝 WAEC</span>
                <span className="mission-pill">🎓 NECO</span>
                <span className="mission-pill">💡 Practicals</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section style={{ padding: "0 1.5rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
          <div className="stats-band reveal">
            {STATS.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section className="about-section" style={{ paddingTop: "1rem" }}>
          <div className="reveal">
            <p className="section-label">What You Get</p>
            <h2 className="section-title">Everything You Need to Pass</h2>
            <p className="section-desc">
              CBT Nexus isn't just a question bank. It's a complete exam-prep
              ecosystem engineered around how Nigerian exams actually work.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`feature-card reveal reveal-delay-${(i % 6) + 1}`}
              >
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section
          className="about-section"
          style={{ background: "linear-gradient(180deg, #f8fdfd 0%, #eaf9f8 100%)" , maxWidth: "100%", padding: "5rem 1.5rem" }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div className="reveal" style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p className="section-label">How It Works</p>
              <h2 className="section-title">Three Steps to Exam Confidence</h2>
            </div>
            <div className="steps-wrap">
              {STEPS.map((s, i) => (
                <div key={i} className={`step-card reveal reveal-delay-${i + 1}`}>
                  <span className="step-num">{s.num}</span>
                  <span className="step-badge">Step {s.num}</span>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONTACT / LOCATION ══ */}
        <section className="about-section">
          <div className="reveal">
            <p className="section-label">Find Us</p>
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-desc">
              Have a question, suggestion, or running into an issue? Reach out —
              we respond fast and genuinely care about every student on this platform.
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-card reveal reveal-delay-1">
              <span className="contact-card-icon">📍</span>
              <div>
                <div className="contact-card-label">Office Address</div>
                <div className="contact-card-value">
                  Suite 8, 2nd Floor, N.U.T Building
                </div>
                <div className="contact-card-sub">
                  Off Olaogun Junction, Old Ife Road, Ibadan, Oyo State
                </div>
              </div>
            </div>
            <div className="contact-card reveal reveal-delay-2">
              <span className="contact-card-icon">📞</span>
              <div>
                <div className="contact-card-label">Phone</div>
                <div className="contact-card-value">08032249468</div>
                <div className="contact-card-sub">Mon – Sat, 8 AM – 6 PM WAT</div>
              </div>
            </div>
            <div className="contact-card reveal reveal-delay-3">
              <span className="contact-card-icon">💬</span>
              <div>
                <div className="contact-card-label">In-App Support</div>
                <div className="contact-card-value">Feedback Page</div>
                <div className="contact-card-sub">
                  Send a message and an admin replies directly — usually within hours.
                </div>
              </div>
            </div>
            <div className="contact-card reveal reveal-delay-4">
              <span className="contact-card-icon">💳</span>
              <div>
                <div className="contact-card-label">Lifetime Access</div>
                <div className="contact-card-value">₦3,000 — Pay Once</div>
                <div className="contact-card-sub">
                  Secure payment via Paystack. Access never expires.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <div className="cta-section reveal">
          <h2 className="cta-title">Ready to Start Winning?</h2>
          <p className="cta-sub">
            Join thousands of Nigerian students already practising smarter on CBT Nexus.
            One payment. Lifetime access. Unlimited potential.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta-white">
              Create Free Account
            </Link>
            <Link to="/payment" className="btn-cta-outline">
              View Pricing — ₦3,000
            </Link>
          </div>
        </div>

        <div className="about-footer-note">
          © {new Date().getFullYear()} CBT Nexus · Suite 8, N.U.T Building, Ibadan ·{" "}
          <Link to="/privacy" style={{ color: "#2F9E9D" }}>Privacy Policy</Link>{" "}
          ·{" "}
          <Link to="/terms" style={{ color: "#2F9E9D" }}>Terms of Use</Link>
        </div>
      </div>
    </>
  );
};

export default About;