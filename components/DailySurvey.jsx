// components/DailySurvey.jsx
// ================================================================
// Daily Legal Scenario Survey — with hard gate for free users.
//
// GATE LOGIC:
//  FREE users  → MUST vote before the simplifier unlocks.
//               No skip button. Blocking badge shown on simplifier.
//  PAID users  → Survey is shown, but a "Skip for today" link
//               lets them bypass and unlock immediately.
//
// Either way, once done (voted OR skipped), the parent's
// onUnlock() fires and the simplifier becomes usable.
//
// PERSISTENCE: localStorage tracks daily completion.
//   Key: survey_unlocked_YYYY-MM-DD
//   Value: "voted" | "skipped"
// In production: also write to Supabase survey_votes table.
// ================================================================
"use client";

import { useState, useEffect } from "react";

// ── SAMPLE SURVEYS ──────────────────────────────────────────
// In production: fetch from Supabase survey_questions table
// where date = today. These cycle by day-of-month.
const SURVEYS = [
  {
    id:"sv001",
    question:"You're about to sign a lease. The landlord verbally says pets are fine, but the written contract says 'no pets'. What do you do?",
    optionA: "Trust the verbal promise — the landlord seems trustworthy",
    optionB: "Insist the written contract is updated before you sign",
    category:"Rental Law",
    insight: "Verbal agreements are nearly impossible to enforce. Courts rely on the written contract. Always get any verbal changes added in writing before signing.",
  },
  {
    id:"sv002",
    question:"A new client asks you to start work immediately before the contract is signed. What do you do?",
    optionA: "Start to show goodwill — the contract is just a formality",
    optionB: "Wait until the contract is fully signed before doing any work",
    category:"Freelance Law",
    insight: "Working without a signed contract removes your legal protection. If payment is disputed, you have nothing in writing to enforce. Always sign first.",
  },
  {
    id:"sv003",
    question:"Your employer asks you to sign a non-compete banning you from the industry for 3 years after leaving. What do you do?",
    optionA: "Sign it — you need the job and it probably won't matter",
    optionB: "Negotiate the scope or consult a lawyer before signing",
    category:"Employment Law",
    insight: "Overly broad non-competes can be negotiated or even found unenforceable. A lawyer can help narrow the scope, duration, and geography to something fair.",
  },
  {
    id:"sv004",
    question:"A contractor used your company's confidential client list without permission. They never signed an NDA. Do you have any legal recourse?",
    optionA: "No — without an NDA there's nothing you can do",
    optionB: "Yes — trade secret laws may still protect your confidential information",
    category:"Business Law",
    insight: "Even without an NDA, trade secret laws in most jurisdictions protect confidential business information from misuse. Always consult a lawyer to explore your options.",
  },
  {
    id:"sv005",
    question:"A contract has a 'limitation of liability' clause capping damages at $100. The other party causes you $5,000 in losses. Can you challenge this?",
    optionA: "No — the clause is legally binding, full stop",
    optionB: "Possibly — these clauses can sometimes be challenged as unconscionable",
    category:"Contract Law",
    insight: "Limitation of liability clauses can be unenforceable if they are unconscionable, involve fraud, or violate public policy. Always get legal advice before accepting any cap.",
  },
];

export default function DailySurvey({ userId, userPlan = "free", onUnlock }) {
  const isPaid    = userPlan !== "free";
  const today     = new Date().toISOString().split("T")[0];
  const lockKey   = `survey_unlocked_${today}`;
  const voteKey   = (id) => `sv_vote_${id}`;

  const [survey,    setSurvey]    = useState(null);
  const [userVote,  setUserVote]  = useState(null);    // "A" | "B"
  const [votesA,    setVotesA]    = useState(0);
  const [votesB,    setVotesB]    = useState(0);
  const [voted,     setVoted]     = useState(false);
  const [skipped,   setSkipped]   = useState(false);
  const [isVoting,  setIsVoting]  = useState(false);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => {
    // Pick today's survey by day-of-month
    const dayIdx = new Date().getDate() % SURVEYS.length;
    const s      = SURVEYS[dayIdx];
    setSurvey(s);

    // Simulate vote counts (seed by date for consistency)
    const seed = new Date().getDate() * 11;
    setVotesA(seed * 4 + 85);
    setVotesB(seed * 3 + 72);

    // Check if user already completed today
    const status     = localStorage.getItem(lockKey);
    const storedVote = localStorage.getItem(voteKey(s.id));

    if (status === "voted" && storedVote) {
      setVoted(true);
      setUserVote(storedVote);
      onUnlock?.();  // Simplifier already unlocked from previous session
    } else if (status === "skipped") {
      setSkipped(true);
      onUnlock?.();
    }

    setLoaded(true);
  }, []);

  if (!loaded || !survey) return null;

  // ── VOTE HANDLER ─────────────────────────────────────────
  const handleVote = async (choice) => {
    if (voted || isVoting) return;
    setIsVoting(true);

    // Optimistic update
    if (choice === "A") setVotesA(v => v + 1);
    else                setVotesB(v => v + 1);

    // Persist locally (replace with Supabase in production)
    localStorage.setItem(voteKey(survey.id), choice);
    localStorage.setItem(lockKey, "voted");

    // In production — write to Supabase:
    // await supabase.from("survey_votes").upsert({
    //   user_id: userId, survey_id: survey.id,
    //   vote: choice, voted_at: new Date().toISOString(),
    // });

    setUserVote(choice);
    setVoted(true);
    setIsVoting(false);

    // Small delay so user sees their selection before unlock fires
    setTimeout(() => onUnlock?.(), 500);
  };

  // ── SKIP HANDLER (paid only) ─────────────────────────────
  const handleSkip = () => {
    localStorage.setItem(lockKey, "skipped");
    setSkipped(true);
    onUnlock?.();
  };

  // ── VOTE PERCENTAGES ─────────────────────────────────────
  const total = votesA + votesB;
  const pctA  = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB  = 100 - pctA;

  // ── RESULTS VIEW (after voting or skipping) ───────────────
  if (voted || skipped) {
    return (
      <div className="card card-gold animate-fadeUp" style={{ marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", marginBottom:"1rem", flexWrap:"wrap" }}>
          <span className="badge badge-navy">⚖️ Daily Scenario</span>
          <span className="badge badge-gold">{survey.category}</span>
          {voted   && <span className="badge badge-green">✓ Voted</span>}
          {skipped && <span className="badge badge-green">Skipped</span>}
          <span className="badge badge-green" style={{ marginLeft:"auto" }}>🔓 Simplifier unlocked</span>
        </div>

        <h3 style={{ fontSize:"1rem", lineHeight:1.65, marginBottom:"1.25rem" }}>{survey.question}</h3>

        {/* Results bars — only shown if user voted */}
        {voted && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem", marginBottom:"1rem" }}>
            {[{c:"A",pct:pctA,text:survey.optionA},{c:"B",pct:pctB,text:survey.optionB}].map(opt => (
              <div key={opt.c} style={{
                paddingLeft:"0.8rem",
                borderLeft: userVote === opt.c ? "4px solid var(--gold)" : "4px solid var(--gray-light)"
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                  <span style={{ fontWeight:700, fontSize:"0.84rem", color:"var(--navy)" }}>
                    {userVote === opt.c ? `✓ Option ${opt.c} — Your vote` : `Option ${opt.c}`}
                  </span>
                  <span style={{ fontWeight:900, color:"var(--gold)", fontFamily:"var(--font-display)", fontSize:"1rem" }}>
                    {opt.pct}%
                  </span>
                </div>
                <div className="progress-bar" style={{ marginBottom:"0.35rem" }}>
                  <div className="progress-fill" style={{ width:`${opt.pct}%` }}/>
                </div>
                <p style={{ fontSize:"0.82rem" }}>{opt.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Legal insight callout */}
        <div style={{
          background:"var(--navy)", borderRadius:"var(--radius-sm)",
          padding:"0.85rem 1.05rem",
        }}>
          <div style={{ fontSize:"0.68rem", fontWeight:700, color:"var(--gold)",
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.3rem" }}>
            💡 Legal Insight
          </div>
          <p style={{ fontSize:"0.87rem", color:"rgba(255,255,255,0.82)", lineHeight:1.65 }}>
            {survey.insight}
          </p>
        </div>

        {voted && (
          <p style={{ fontSize:"0.7rem", color:"var(--gray-mid)", textAlign:"center", marginTop:"0.85rem" }}>
            Based on {total.toLocaleString()} votes · New scenario tomorrow 🗓️
          </p>
        )}
      </div>
    );
  }

  // ── VOTING VIEW (not yet voted) ───────────────────────────
  return (
    <div className="card card-gold animate-fadeUp" style={{ marginBottom:"1.5rem" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", marginBottom:"1rem", flexWrap:"wrap" }}>
        <span className="badge badge-navy">⚖️ Daily Scenario</span>
        <span className="badge badge-gold">{survey.category}</span>
        {!isPaid && (
          <span className="badge badge-red" style={{ marginLeft:"auto" }}>
            🔒 Vote to unlock simplifier
          </span>
        )}
      </div>

      {/* Mandatory notice for free users */}
      {!isPaid && (
        <div style={{
          background:"var(--red-light)", border:"1.5px solid var(--red)",
          borderRadius:"var(--radius-sm)", padding:"0.62rem 0.9rem",
          marginBottom:"1rem", fontSize:"0.84rem", color:"var(--red)",
          display:"flex", alignItems:"center", gap:"0.5rem",
        }}>
          <span style={{ fontSize:"1rem" }}>🔒</span>
          <span><strong>Vote on today's scenario to unlock the simplifier.</strong> Just 10 seconds!</span>
        </div>
      )}

      <h3 style={{ fontSize:"1.04rem", lineHeight:1.65, marginBottom:"1.35rem" }}>{survey.question}</h3>

      {/* Vote buttons */}
      <div style={{ display:"flex", flexDirection:"column", gap:"0.65rem" }}>
        {[{c:"A",text:survey.optionA},{c:"B",text:survey.optionB}].map(opt => (
          <button key={opt.c} onClick={() => handleVote(opt.c)} disabled={isVoting}
            style={{
              display:"flex", alignItems:"flex-start", gap:"0.75rem",
              padding:"0.88rem 1.05rem", textAlign:"left", cursor:"pointer",
              border:"2px solid var(--gray-light)", borderRadius:"var(--radius-sm)",
              background:"var(--white)", width:"100%", fontFamily:"var(--font-body)", fontSize:"0.91rem",
              transition:"all var(--t)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="var(--navy)"; e.currentTarget.style.background="var(--gold-pale)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--gray-light)"; e.currentTarget.style.background="var(--white)"; }}
          >
            <span style={{
              width:30, height:30, borderRadius:"50%",
              background:"var(--navy)", color:"var(--white)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, fontSize:"0.8rem", flexShrink:0, marginTop:1,
            }}>{opt.c}</span>
            <span style={{ color:"var(--ink)", lineHeight:1.62 }}>{opt.text}</span>
          </button>
        ))}
      </div>

      {/* Skip link — paid users only */}
      {isPaid && (
        <div style={{ textAlign:"right", marginTop:"0.85rem" }}>
          <button onClick={handleSkip}
            style={{
              background:"transparent", border:"none", color:"var(--gray-mid)",
              fontSize:"0.82rem", cursor:"pointer", textDecoration:"underline",
              fontFamily:"var(--font-body)",
            }}>
            Skip for today →
          </button>
        </div>
      )}
    </div>
  );
}
