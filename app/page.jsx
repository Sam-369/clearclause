// app/page.jsx
// ================================================================
// ClearClause Homepage — orchestrates survey gate + simplifier.
//
// KEY LOGIC:
//  1. surveyUnlocked state starts false for free users
//  2. DailySurvey fires onUnlock() when user votes (or skips if paid)
//  3. surveyUnlocked is passed to SimplifierTool as prop
//  4. SimplifierTool shows gate overlay until surveyUnlocked = true
//
// For paid users: surveyUnlocked starts TRUE (no gate needed)
// ================================================================
"use client";

import { useState } from "react";
import DailySurvey         from "@/components/DailySurvey";
import SimplifierTool      from "@/components/SimplifierTool";
import WordAssociationRace from "@/components/WordAssociationRace";

// ── MOCK USER — replace with real Supabase auth session ──────
// To test paid features: change plan to "basic" / "pro" / "business"
const USER = {
  id:       "user_abc123",
  plan:     "free",       // "free" | "basic" | "pro" | "business"
  uses:     0,            // simplifications used this month
  username: "LegalEagle",
  email:    null,
};

export default function HomePage() {
  const isPaid = USER.plan !== "free";

  // Paid users start unlocked; free users must vote first
  const [surveyUnlocked, setSurveyUnlocked] = useState(isPaid);

  return (
    <main>

      {/* ── TOP AD (free users only) ─────────────────────── */}
      {!isPaid && (
        <div style={{ background:"var(--gray-xlight)", padding:"0.5rem 0",
          borderBottom:"1px solid var(--gray-light)" }}>
          <div className="page-wrapper">
            <div className="ad-zone ad-leaderboard">Advertisement (728×90)</div>
          </div>
        </div>
      )}

      <div className="page-wrapper">

        {/* ── HERO ──────────────────────────────────────── */}
        <div className="animate-fadeUp" style={{
          textAlign:"center", padding:"3rem 0 2.5rem",
          borderBottom:"1px solid var(--gray-light)", marginBottom:"3rem",
        }}>
          <span className="badge badge-navy s1 animate-fadeUp" style={{ marginBottom:"1rem", display:"inline-flex" }}>
            ⚖️ AI Legal Document Simplifier
          </span>
          <h1 className="s2 animate-fadeUp" style={{ marginBottom:"0.65rem" }}>
            Understand Any Legal Document —<br/>
            <span style={{ color:"var(--gold)" }}>In Plain English</span>
          </h1>
          <p className="s3 animate-fadeUp" style={{ maxWidth:580, margin:"0 auto 1.5rem", fontSize:"1.03rem" }}>
            Paste any confusing contract clause, lease, NDA, or legal jargon.
            ClearClause breaks it down instantly — in 10 languages.
          </p>
          <div className="s4 animate-fadeUp" style={{ display:"flex", gap:"0.75rem", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/pricing"     className="btn btn-gold">View Pricing</a>
            <a href="/leaderboard" className="btn btn-outline">🏆 Leaderboard</a>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ─────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"2.5rem", alignItems:"start" }}
             className="main-grid">

          {/* ── LEFT: MAIN CONTENT ──────────────────────── */}
          <div>

            {/* 1. DAILY SURVEY — always shown first ───────
                Free users: must vote to unlock simplifier.
                Paid users: shown but "Skip for today" available.
                onUnlock fires → surveyUnlocked becomes true      */}
            <section>
              <h2 style={{ marginBottom:"1rem" }}>
                ⚖️ Daily <span style={{ color:"var(--gold)" }}>Legal Scenario</span>
              </h2>
              <DailySurvey
                userId={USER.id}
                userPlan={USER.plan}
                onUnlock={() => setSurveyUnlocked(true)}
              />
            </section>

            {/* 2. SIMPLIFIER — locked until survey done ───
                surveyUnlocked prop controls the gate overlay  */}
            <section style={{ paddingTop:"0.5rem" }}>
              <SimplifierTool
                userPlan={USER.plan}
                usageCount={USER.uses}
                userId={USER.id}
                surveyUnlocked={surveyUnlocked}
              />
            </section>

            {/* 3. AD BANNER between survey/simplifier and game (free only) */}
            {!isPaid && (
              <div style={{ margin:"2rem 0" }}>
                <div className="ad-zone ad-banner">Advertisement (468×60)</div>
              </div>
            )}

            {/* 4. DAILY GAME ───────────────────────────── */}
            <section style={{ paddingTop:"0.5rem" }}>
              <h2 style={{ marginBottom:"1rem" }}>
                {isPaid
                  ? <>📚 Daily <span style={{ color:"var(--gold)" }}>Quiz</span></>
                  : <>⚡ Word Association <span style={{ color:"var(--gold)" }}>Race</span></>
                }
              </h2>
              {isPaid ? (
                <div className="card" style={{ textAlign:"center", padding:"2.5rem" }}>
                  <h3>Ready for today's quiz?</h3>
                  <p style={{ marginBottom:"1.25rem" }}>10 questions, TTS voice reading, level progression.</p>
                  <a href="/quiz" className="btn btn-primary">Start Quiz →</a>
                </div>
              ) : (
                <WordAssociationRace userId={USER.id} username={USER.username} />
              )}
            </section>
          </div>

          {/* ── RIGHT: SIDEBAR ──────────────────────────── */}
          <aside style={{ position:"sticky", top:80, display:"flex", flexDirection:"column", gap:"1.2rem" }}>

            {/* Ad rectangle — free only */}
            {!isPaid && (
              <div className="ad-zone ad-rectangle">Advertisement (300×250)</div>
            )}

            {/* Leaderboard mini (free only) */}
            {!isPaid && (
              <div className="card card-gold">
                <h3 style={{ fontSize:"0.95rem", marginBottom:"0.75rem" }}>🏆 Top This Month</h3>
                {["CaseWatcher99","LexMaster","ClauseHunter","LegalEagle","Verdict2024"].map((name, i) => (
                  <div key={name} style={{
                    display:"flex", justifyContent:"space-between",
                    padding:"0.32rem 0", borderBottom: i < 4 ? "1px solid var(--gray-light)" : "none",
                    fontSize:"0.83rem",
                  }}>
                    <span style={{ fontWeight: i < 3 ? 700 : 400 }}>
                      {["🥇","🥈","🥉","#4","#5"][i]} {name}
                    </span>
                    <span style={{ color:"var(--gold)", fontWeight:700 }}>
                      {[3180,2940,2710,2580,2420][i]}
                    </span>
                  </div>
                ))}
                <a href="/leaderboard" className="btn btn-outline btn-sm btn-block"
                  style={{ marginTop:"0.75rem" }}>Full Leaderboard →</a>
              </div>
            )}

            {/* Affiliate recommendations */}
            <div className="card">
              <h3 style={{ fontSize:"0.88rem", marginBottom:"0.75rem" }}>🔗 Recommended Tools</h3>
              {[
                { name:"LegalZoom",    desc:"Legal documents made easy",   emoji:"📝", url:"https://legalzoom.com"    },
                { name:"Rocket Lawyer",desc:"Templates & attorney access", emoji:"🚀", url:"https://rocketlawyer.com" },
                { name:"DocuSign",     desc:"Electronic signatures",       emoji:"✍️", url:"https://docusign.com"     },
                { name:"Grammarly",    desc:"Polish your legal writing",   emoji:"✨", url:"https://grammarly.com"    },
              ].map(a => (
                <a key={a.name} href={a.url} target="_blank" rel="noopener noreferrer" style={{
                  display:"flex", alignItems:"center", gap:"0.55rem",
                  padding:"0.45rem 0", borderBottom:"1px solid var(--gray-light)",
                  textDecoration:"none",
                }}>
                  <span style={{ fontSize:"1rem" }}>{a.emoji}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--navy)" }}>{a.name}</div>
                    <div style={{ fontSize:"0.72rem", color:"var(--gray-mid)" }}>{a.desc}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Upgrade CTA (free) */}
            {!isPaid && (
              <div className="card card-navy" style={{ textAlign:"center" }}>
                <div style={{ color:"var(--gold)", fontFamily:"var(--font-display)",
                  fontWeight:700, fontSize:"0.95rem", marginBottom:"0.4rem" }}>
                  Unlock Everything
                </div>
                <p style={{ fontSize:"0.8rem", marginBottom:"1rem" }}>
                  Mic input, TTS, unlimited simplifications, daily quiz & more from $4.99/mo
                </p>
                <a href="/pricing" className="btn btn-gold btn-sm btn-block">See Plans →</a>
              </div>
            )}

          </aside>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer style={{ background:"var(--navy)", marginTop:"5rem", padding:"2rem 0" }}>
        <div style={{
          maxWidth:1120, margin:"0 auto", padding:"0 1.5rem",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexWrap:"wrap", gap:"1rem",
        }}>
          <span style={{ fontFamily:"var(--font-display)", fontWeight:900,
            color:"var(--white)", fontSize:"1.1rem" }}>
            Clear<span style={{ color:"var(--gold)" }}>Clause</span>
            <span style={{ fontSize:"0.78rem", fontWeight:400,
              color:"rgba(255,255,255,0.5)", marginLeft:"0.6rem" }}>
              Your Legal Document Simplifier
            </span>
          </span>
          <div style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap" }}>
            {[["/pricing","Pricing"],["/leaderboard","Leaderboard"],["/faq","FAQ"],["/privacy","Privacy"],["/terms","Terms"]].map(([h,l]) => (
              <a key={h} href={h} style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.82rem", textDecoration:"none" }}>{l}</a>
            ))}
          </div>
          <span style={{ fontSize:"0.74rem", color:"rgba(255,255,255,0.42)" }}>
            Not legal advice · © {new Date().getFullYear()} ClearClause
          </span>
        </div>
      </footer>

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
