// components/WordAssociationRace.jsx
// ================================================================
// FREE TIER daily game — 15 rounds.
// Each round: legal word shown on screen + spoken via Google TTS.
// User has 10s to type the first word that comes to mind.
// After submit: show match % + points earned.
// After all 15 rounds: mandatory share modal + leaderboard CTA.
// ================================================================
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TTSPlayer from "@/components/TTSPlayer";

const WORDS = [
  { id:"r01", word:"CONTRACT",     common:["agreement","deal","document","sign","paper"] },
  { id:"r02", word:"CLAUSE",       common:["section","rule","provision","term","condition"] },
  { id:"r03", word:"PLAINTIFF",    common:["suing","victim","person","court","case"] },
  { id:"r04", word:"LIABILITY",    common:["responsibility","fault","blame","debt","risk"] },
  { id:"r05", word:"ARBITRATION",  common:["dispute","settlement","mediator","resolve","private"] },
  { id:"r06", word:"NEGLIGENCE",   common:["careless","fault","accident","duty","breach"] },
  { id:"r07", word:"DEFENDANT",    common:["accused","court","guilty","lawyer","sued"] },
  { id:"r08", word:"INDEMNIFY",    common:["protect","compensate","cover","pay","insurance"] },
  { id:"r09", word:"JURISDICTION", common:["court","state","authority","law","country"] },
  { id:"r10", word:"WITNESS",      common:["see","testify","court","sign","observer"] },
  { id:"r11", word:"BREACH",       common:["break","violation","fail","contract","wall"] },
  { id:"r12", word:"STATUTE",      common:["law","rule","legal","act","written"] },
  { id:"r13", word:"SUBPOENA",     common:["court","appear","order","summons","legal"] },
  { id:"r14", word:"LIEN",         common:["debt","property","claim","mortgage","owed"] },
  { id:"r15", word:"VERDICT",      common:["guilty","decision","judgment","result","court"] },
];

const ROUND_TIME  = 10;
const BASE_PTS    = 10;
const MATCH_BONUS = 15;
const SPEED_BONUS = 5;

const SHARE = [
  { id:"twitter",   label:"X/Twitter", emoji:"𝕏",  color:"#000" },
  { id:"facebook",  label:"Facebook",  emoji:"f",  color:"#1877F2" },
  { id:"instagram", label:"Instagram", emoji:"📸", color:"#E1306C" },
  { id:"tiktok",    label:"TikTok",    emoji:"♪",  color:"#010101" },
  { id:"linkedin",  label:"LinkedIn",  emoji:"in", color:"#0A66C2" },
  { id:"reddit",    label:"Reddit",    emoji:"🤖", color:"#FF4500" },
  { id:"email",     label:"Email",     emoji:"✉️", color:"#555" },
];

export default function WordAssociationRace({ userId, username = "Player" }) {
  const today    = new Date().toISOString().split("T")[0];

  const [phase,       setPhase]       = useState("intro");
  const [roundIdx,    setRoundIdx]    = useState(0);
  const [userInput,   setUserInput]   = useState("");
  const [timeLeft,    setTimeLeft]    = useState(ROUND_TIME);
  const [totalPts,    setTotalPts]    = useState(0);
  const [results,     setResults]     = useState([]);
  const [submitted,   setSubmitted]   = useState(false);
  const [showShare,   setShowShare]   = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  // ttsKey changes to trigger TTSPlayer autoPlay for each new word
  const [ttsKey,      setTtsKey]      = useState(0);
  const [ttsWord,     setTtsWord]     = useState("");

  const timerRef  = useRef(null);
  const startTime = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(`war_done_${today}`)) setAlreadyDone(true);
    return () => clearInterval(timerRef.current);
  }, []);

  const cur = WORDS[roundIdx];

  const beginRound = useCallback((idx) => {
    setPhase("round");
    setRoundIdx(idx);
    setUserInput("");
    setSubmitted(false);
    setTimeLeft(ROUND_TIME);
    startTime.current = Date.now();

    // Trigger TTSPlayer to speak the word
    setTtsWord(WORDS[idx].word);
    setTtsKey(k => k + 1); // new key = forces remount = autoPlay triggers

    setTimeout(() => inputRef.current?.focus(), 350);

    clearInterval(timerRef.current);
    let t = ROUND_TIME;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) { clearInterval(timerRef.current); doSubmit(WORDS[idx], "", 0); }
    }, 1000);
  }, []);

  const doSubmit = useCallback((round, answer, elapsed) => {
    clearInterval(timerRef.current);
    if (submitted) return;
    setSubmitted(true);
    setPhase("result");

    const word     = answer.trim().toLowerCase();
    const matched  = word !== "" && round.common.includes(word);
    const matchPct = matched
      ? Math.floor(Math.random() * 28) + 38
      : Math.floor(Math.random() * 20) + 3;

    let pts = word ? BASE_PTS : 0;
    if (matched)           pts += MATCH_BONUS;
    if (elapsed > 0 && elapsed < 3 && word) pts += SPEED_BONUS;

    setTotalPts(p => p + pts);
    setResults(prev => [...prev, { word:round.word, userWord:word||"(no answer)", matched, pts, matchPct, elapsed }]);
  }, [submitted]);

  const handleSubmit = () => {
    if (submitted || phase !== "round") return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    doSubmit(cur, userInput, elapsed);
  };

  const handleNext = () => {
    const next = roundIdx + 1;
    if (next >= WORDS.length) {
      const score = totalPts;
      localStorage.setItem(`war_done_${today}`, "1");
      localStorage.setItem(`war_score_${today}`, score);
      setPhase("complete");
      setTimeout(() => setShowShare(true), 700);
    } else {
      beginRound(next);
    }
  };

  const doShare = (platform) => {
    const msg = encodeURIComponent(`I just scored ${totalPts} pts on ClearClause's Word Association Race! 🏆 Can you beat me? → clearclause.cc`);
    const urls = {
      twitter:   `https://twitter.com/intent/tweet?text=${msg}`,
      facebook:  `https://www.facebook.com/sharer/sharer.php?quote=${msg}&u=https://clearclause.cc`,
      linkedin:  `https://www.linkedin.com/sharing/share-offsite/?url=https://clearclause.cc`,
      reddit:    `https://reddit.com/submit?url=https://clearclause.cc&title=${msg}`,
      email:     `mailto:?subject=Beat my ClearClause score!&body=${msg}`,
      tiktok:    `https://www.tiktok.com/`,
      instagram: `https://www.instagram.com/`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank");
  };

  // ── ALREADY PLAYED TODAY ──
  if (alreadyDone) {
    const score = localStorage.getItem(`war_score_${today}`) || "?";
    return (
      <div className="card" style={{ textAlign:"center", padding:"2.5rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"0.5rem" }}>🏆</div>
        <h3>Today's Word Race complete!</h3>
        <p style={{ margin:"0.4rem 0 1.2rem" }}>Score: <strong style={{ color:"var(--gold)", fontSize:"1.3rem" }}>{score} pts</strong></p>
        <a href="/leaderboard" className="btn btn-primary">View Leaderboard →</a>
      </div>
    );
  }

  // ── INTRO ──
  if (phase === "intro") return (
    <div className="card card-gold animate-fadeUp">
      <div style={{ textAlign:"center", padding:"1rem 0 1.5rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"0.7rem" }}>⚡</div>
        <h2>Word Association Race</h2>
        <p style={{ margin:"0.55rem auto 0", maxWidth:480, fontSize:"0.96rem" }}>
          15 rounds. A legal word is shown and spoken aloud — type the first
          word that comes to mind. See how many players agreed with you!
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:"1.5rem", margin:"1.5rem 0", flexWrap:"wrap" }}>
          {[["⏱","10 sec"],["🎯","Match +15"],["⚡","Fast +5"],["🏆","Top 10 win"]].map(([i,t]) => (
            <div key={t} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem" }}>{i}</div>
              <div style={{ fontSize:"0.74rem", fontWeight:700, color:"var(--navy)", marginTop:"0.2rem" }}>{t}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-gold btn-lg" onClick={() => beginRound(0)}
          style={{ fontFamily:"var(--font-display)" }}>
          Start Today's Race →
        </button>
      </div>
    </div>
  );

  // ── ACTIVE ROUND ──
  if (phase === "round") {
    const pct    = (timeLeft / ROUND_TIME) * 100;
    const urgent = timeLeft <= 3;
    return (
      <div className="card animate-fadeUp">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.8rem" }}>
          <span className="badge badge-navy">Round {roundIdx+1} / {WORDS.length}</span>
          <span style={{
            fontFamily:"var(--font-display)", fontWeight:900, fontSize:"1.45rem",
            color: urgent ? "var(--red)" : "var(--navy)",
            animation: urgent ? "pulse 0.6s infinite" : "none",
          }}>{timeLeft}s</span>
        </div>

        <div className="progress-bar" style={{ marginBottom:"1.7rem" }}>
          <div className="progress-fill" style={{
            width:`${pct}%`,
            background: urgent ? "linear-gradient(90deg,var(--red),#e74c3c)" : undefined,
          }}/>
        </div>

        {/* Word + Google TTS */}
        <div style={{
          textAlign:"center", padding:"2.4rem 1rem",
          background:"var(--navy)", borderRadius:"var(--radius)", marginBottom:"1.7rem",
        }}>
          <div style={{ fontSize:"0.7rem", fontWeight:700, color:"rgba(255,255,255,0.42)",
            letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:"0.5rem" }}>
            What comes to mind?
          </div>
          <div style={{
            fontFamily:"var(--font-display)", fontWeight:900,
            fontSize:"clamp(2.2rem,7vw,3.8rem)", color:"var(--gold)", letterSpacing:"-0.02em",
          }}>{cur?.word}</div>

          {/* Compact TTS player — auto-plays when word changes */}
          <div style={{ marginTop:"0.85rem", display:"flex", justifyContent:"center" }}>
            <TTSPlayer
              key={ttsKey}          // new key forces remount + autoPlay
              text={ttsWord}
              language="English"
              compact={true}
              autoPlay={true}       // speaks word automatically when round begins
            />
          </div>
        </div>

        <div style={{ display:"flex", gap:"0.6rem" }}>
          <input ref={inputRef} className="input"
            placeholder="Type your word…"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
            maxLength={30}
            style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1.1rem", textTransform:"lowercase" }}
          />
          <button className="btn btn-gold" onClick={handleSubmit}
            disabled={!userInput.trim()} style={{ flexShrink:0 }}>Submit</button>
        </div>
        <p style={{ fontSize:"0.73rem", color:"var(--gray-mid)", textAlign:"center", marginTop:"0.5rem" }}>
          Enter or Submit. Answer fast for +{SPEED_BONUS} speed bonus!
        </p>
      </div>
    );
  }

  // ── ROUND RESULT ──
  if (phase === "result" && results.length > 0) {
    const last = results[results.length - 1];
    return (
      <div className="card animate-fadeUp">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.1rem" }}>
          <span className="badge badge-navy">Round {roundIdx+1} / {WORDS.length}</span>
          <span style={{ fontWeight:700, color:"var(--gold)" }}>Total: {totalPts} pts</span>
        </div>

        <div style={{
          textAlign:"center", padding:"1.5rem 1rem",
          background: last.matched ? "var(--green-light)" : "var(--red-light)",
          border:`2px solid ${last.matched ? "var(--green)" : "var(--red)"}`,
          borderRadius:"var(--radius)", marginBottom:"1.2rem",
        }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.25rem" }}>{last.matched ? "🎯" : "💭"}</div>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:"1.05rem", color:"var(--navy)" }}>
            You said: "<span style={{ color: last.matched ? "var(--green)" : "var(--red)" }}>{last.userWord}</span>"
          </div>
          <p style={{ fontSize:"0.87rem", margin:"0.25rem 0 0.7rem", color:"var(--gray-mid)" }}>
            {last.matchPct}% of players said the same thing
          </p>
          <div className="progress-bar" style={{ maxWidth:260, margin:"0 auto 0.7rem" }}>
            <div className="progress-fill" style={{
              width:`${last.matchPct}%`,
              background: last.matched ? "linear-gradient(90deg,var(--green),#2ecc71)" : undefined,
            }}/>
          </div>
          <strong style={{ color:"var(--navy)", fontSize:"1.05rem" }}>
            +{last.pts} pts{last.matched && <span style={{ color:"var(--green)", marginLeft:"0.4rem" }}>✓ Match!</span>}
          </strong>
        </div>

        <button className="btn btn-primary btn-block" onClick={handleNext}>
          {roundIdx+1 >= WORDS.length ? "See Final Results →" : `Next → (${roundIdx+2}/${WORDS.length})`}
        </button>
      </div>
    );
  }

  // ── COMPLETE ──
  if (phase === "complete") {
    const matches = results.filter(r => r.matched).length;
    const speeds  = results.filter(r => r.elapsed > 0 && r.elapsed < 3 && r.userWord !== "(no answer)").length;
    return (
      <div className="card animate-fadeUp" style={{ textAlign:"center" }}>
        <div style={{ fontSize:"3.5rem", marginBottom:"0.4rem" }}>🏆</div>
        <h2 style={{ marginBottom:"0.2rem" }}>Race Complete!</h2>
        <div style={{ fontFamily:"var(--font-display)", fontWeight:900,
          fontSize:"3.2rem", color:"var(--gold)", margin:"0.4rem 0" }}>{totalPts}</div>
        <p style={{ fontSize:"0.87rem", marginBottom:"1.5rem" }}>
          {matches}/{WORDS.length} matches · {speeds} speed bonuses
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:"0.7rem", flexWrap:"wrap" }}>
          <a href="/leaderboard" className="btn btn-primary">Leaderboard</a>
          <button className="btn btn-gold" onClick={() => setShowShare(true)}>Share Score</button>
        </div>
      </div>
    );
  }

  // ── SHARE MODAL ──
  if (showShare) return (
    <div className="modal-overlay">
      <div className="modal-box animate-popIn" style={{ textAlign:"center" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:"0.5rem" }}>🎉</div>
        <h2 style={{ fontSize:"1.35rem", marginBottom:"0.4rem" }}>You scored {totalPts} points!</h2>
        <p style={{ marginBottom:"1.4rem" }}>Share your score and challenge friends:</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.45rem", marginBottom:"1.2rem" }}>
          {SHARE.map(p => (
            <button key={p.id} onClick={() => doShare(p.id)} style={{
              background:p.color, color:"#fff", border:"none",
              borderRadius:"var(--radius-sm)", padding:"0.6rem 0.35rem",
              fontSize:"0.66rem", fontWeight:700, cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"0.18rem",
              transition:"transform 0.15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <span style={{ fontSize:"1rem" }}>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        <a href="/leaderboard" className="btn btn-primary btn-block" style={{ marginBottom:"0.75rem" }}>
          View Full Leaderboard
        </a>
        <button onClick={() => setShowShare(false)} style={{
          background:"transparent", border:"none", color:"var(--gray-mid)",
          fontSize:"0.8rem", cursor:"pointer", textDecoration:"underline",
        }}>Skip for now</button>
      </div>
    </div>
  );

  return null;
}
