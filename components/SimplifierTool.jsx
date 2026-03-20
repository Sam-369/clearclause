// components/SimplifierTool.jsx
// ================================================================
// Legal Document Simplifier — core feature.
//
// SURVEY GATE:
//  surveyUnlocked=false → shows a blurred locked overlay.
//  surveyUnlocked=true  → full tool available.
//  Parent (HomePage) controls surveyUnlocked state via
//  DailySurvey's onUnlock callback.
//
// FREE TIER:  Textarea only (no mic). 2 uses/month. Ads shown.
// PAID TIER:  + Mic input (Web Speech API)
//             + Google Cloud TTS player on results
// ================================================================
"use client";

import { useState, useRef, useEffect } from "react";
import TTSPlayer from "@/components/TTSPlayer";

const LANGUAGES = [
  { value:"English",    label:"🇺🇸 English"    },
  { value:"Spanish",    label:"🇪🇸 Spanish"    },
  { value:"French",     label:"🇫🇷 French"     },
  { value:"German",     label:"🇩🇪 German"     },
  { value:"Portuguese", label:"🇧🇷 Portuguese" },
  { value:"Italian",    label:"🇮🇹 Italian"    },
  { value:"Mandarin",   label:"🇨🇳 Mandarin"   },
  { value:"Arabic",     label:"🇸🇦 Arabic"     },
  { value:"Hindi",      label:"🇮🇳 Hindi"      },
  { value:"Japanese",   label:"🇯🇵 Japanese"   },
];

export default function SimplifierTool({
  userPlan        = "free",
  usageCount      = 0,
  userId          = null,
  surveyUnlocked  = false,  // ← controlled by parent via DailySurvey onUnlock
}) {
  const isPaid   = userPlan !== "free";
  const freeLeft = Math.max(0, 2 - usageCount);
  const isLocked = !isPaid && !surveyUnlocked; // free user hasn't done survey

  const [inputText,   setInputText]   = useState("");
  const [language,    setLanguage]    = useState("English");
  const [result,      setResult]      = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied,      setCopied]      = useState(false);

  // Mic (paid only)
  const [isListening, setIsListening] = useState(false);
  const [micAvail,    setMicAvail]    = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isPaid) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setMicAvail(true);
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      }
      if (final) setInputText(p => (p + final).trimEnd());
    };
    rec.onend   = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    return () => rec.stop();
  }, [isPaid]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); }
    else             { setError(""); recognitionRef.current.start(); setIsListening(true); }
  };

  const handleSimplify = async () => {
    if (isLocked) return;
    if (!inputText.trim()) { setError("Please paste or type some legal text first."); return; }
    if (userPlan === "free" && usageCount >= 2) { setShowPaywall(true); return; }

    setError(""); setResult(""); setSuggestions([]); setIsLoading(true);
    try {
      const res = await fetch("/api/simplify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: inputText, language }),
      });
      if (!res.ok) throw new Error("Simplification failed. Please try again.");
      const data = await res.json();
      setResult(data.simplifiedText || "");
      setSuggestions(data.suggestions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{ maxWidth:800, margin:"0 auto", position:"relative" }}>

      {/* ── SURVEY GATE OVERLAY ────────────────────────────── */}
      {/* Shown to free users who haven't completed today's survey */}
      {isLocked && (
        <div style={{
          position:"absolute", inset:-2, zIndex:10,
          background:"rgba(248,246,240,0.88)",
          backdropFilter:"blur(4px)",
          borderRadius:"var(--radius)",
          border:"2px dashed var(--gold)",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"2rem", textAlign:"center",
          pointerEvents:"all",
        }}>
          <div style={{ fontSize:"2.8rem", marginBottom:"0.6rem" }}>🔒</div>
          <h3 style={{ marginBottom:"0.45rem" }}>Complete Today's Scenario First</h3>
          <p style={{ maxWidth:380, fontSize:"0.93rem", marginBottom:"1.1rem" }}>
            Vote on the daily legal scenario above to unlock the simplifier.
            It only takes 10 seconds!
          </p>
          <span className="badge badge-gold" style={{ fontSize:"0.78rem" }}>
            👆 Scroll up and vote
          </span>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:"1.4rem", flexWrap:"wrap", gap:"0.5rem" }}>
        <div>
          <h2 style={{ marginBottom:"0.2rem" }}>
            Legal <span style={{ color:"var(--gold)" }}>Simplifier</span>
          </h2>
          <p style={{ fontSize:"0.88rem" }}>
            Paste any confusing legal clause — plain English in seconds.
          </p>
        </div>
        {userPlan === "free" && (
          <span className={`badge ${freeLeft > 0 ? "badge-gold" : "badge-red"}`}>
            {freeLeft > 0 ? `${freeLeft} free use${freeLeft !== 1 ? "s" : ""} left` : "No free uses left"}
          </span>
        )}
      </div>

      {/* ── CONTROLS ROW ─────────────────────────────────────── */}
      <div style={{ display:"flex", gap:"0.7rem", alignItems:"center", marginBottom:"0.8rem", flexWrap:"wrap" }}>
        <label style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.87rem", whiteSpace:"nowrap" }}>
          🌐 Language:
        </label>
        <select className="select" value={language} onChange={e => setLanguage(e.target.value)}
          style={{ flex:1, maxWidth:215, padding:"0.58rem 0.82rem" }} disabled={isLocked}>
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        {/* Mic button — paid tier only */}
        {isPaid && micAvail && (
          <button onClick={toggleMic} title={isListening ? "Stop recording" : "Voice input"}
            style={{
              width:44, height:44, borderRadius:"50%", border:"none",
              background: isListening ? "var(--red)" : "var(--navy)",
              color:"var(--white)", fontSize:"1.12rem", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, transition:"all var(--t)",
              boxShadow: isListening ? "0 0 0 6px rgba(192,57,43,0.18)" : "none",
              animation: isListening ? "pulse 1s infinite" : "none",
            }}>
            {isListening ? "🔴" : "🎤"}
          </button>
        )}
      </div>

      {/* ── TEXTAREA ──────────────────────────────────────────── */}
      <div style={{ position:"relative", marginBottom:"0.3rem" }}>
        <textarea className="input"
          placeholder='Paste legal text here… e.g. "The indemnifying party shall defend, indemnify, and hold harmless the indemnitee against any and all claims, losses, damages…"'
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={8}
          disabled={isLocked}
          style={{ fontFamily:"var(--font-body)", fontSize:"0.93rem", opacity: isLocked ? 0.45 : 1 }}
        />
        {isListening && (
          <div style={{
            position:"absolute", top:10, right:12,
            background:"var(--red)", color:"#fff",
            borderRadius:"999px", padding:"0.15rem 0.52rem",
            fontSize:"0.67rem", fontWeight:700, letterSpacing:"0.07em",
            animation:"pulse 1s infinite",
          }}>● REC</div>
        )}
      </div>
      <div style={{ textAlign:"right", fontSize:"0.7rem", color:"var(--gray-mid)", marginBottom:"0.95rem" }}>
        {inputText.length} / 5000 characters
      </div>

      {/* ── ERROR ─────────────────────────────────────────────── */}
      {error && (
        <div style={{
          background:"var(--red-light)", border:"1px solid var(--red)",
          color:"var(--red)", borderRadius:"var(--radius-sm)",
          padding:"0.68rem 1rem", marginBottom:"1rem", fontSize:"0.87rem",
        }}>⚠️ {error}</div>
      )}

      {/* ── SIMPLIFY BUTTON ───────────────────────────────────── */}
      <button className="btn btn-primary btn-block btn-lg"
        onClick={handleSimplify}
        disabled={isLoading || isLocked}
        style={{ marginBottom:"1.75rem" }}>
        {isLoading ? (
          <><span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Simplifying…</>
        ) : isLocked ? (
          "🔒 Vote on the scenario above to unlock"
        ) : (
          "⚡ Simplify This Clause"
        )}
      </button>

      {/* ── RESULTS CARD ──────────────────────────────────────── */}
      {result && (
        <div className="card card-gold animate-fadeUp" style={{ marginBottom:"1.5rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.55rem",
            marginBottom:"1rem", flexWrap:"wrap" }}>
            <span style={{ fontSize:"1.2rem" }}>📋</span>
            <h3 style={{ flex:1, margin:0 }}>Plain Language Explanation</h3>
            <span className="badge badge-gold">{language}</span>
            <button onClick={handleCopy} className="btn btn-sm btn-ghost" style={{ fontSize:"0.76rem" }}>
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>

          <div style={{ color:"var(--ink)", lineHeight:1.85 }}>
            {result.split("\n").filter(Boolean).map((line, i) => (
              <p key={i} style={{ marginBottom:"0.62rem", color:"var(--ink)" }}>{line}</p>
            ))}
          </div>

          {/* TTS Player — paid tier only, Google Cloud TTS */}
          {isPaid && (
            <div style={{ marginTop:"1.2rem" }}>
              <TTSPlayer text={result} language={language} />
            </div>
          )}
        </div>
      )}

      {/* ── AI SUGGESTIONS ────────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div className="card animate-fadeUp" style={{
          background:"var(--gold-pale)", border:"1px solid var(--gold-light)", marginBottom:"2rem",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.8rem" }}>
            <span style={{ fontSize:"1.15rem" }}>💡</span>
            <h3 style={{ margin:0, fontSize:"1rem" }}>AI Suggestions & Warnings</h3>
          </div>
          <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.55rem" }}>
            {suggestions.map((tip, i) => (
              <li key={i} style={{ display:"flex", gap:"0.55rem", fontSize:"0.9rem", color:"var(--ink)" }}>
                <span style={{ color:"var(--gold)", fontWeight:900, flexShrink:0, marginTop:2 }}>→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── PAYWALL MODAL ─────────────────────────────────────── */}
      {showPaywall && (
        <div className="modal-overlay" onClick={() => setShowPaywall(false)}>
          <div className="modal-box animate-popIn" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"0.4rem" }}>⚖️</div>
              <h2 style={{ fontSize:"1.35rem", marginBottom:"0.4rem" }}>2 free uses reached</h2>
              <p>Upgrade to keep simplifying legal documents.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.85rem", marginBottom:"1.2rem" }}>
              {[
                { title:"Monthly Plan", price:"From $4.99/mo", desc:"30 simplifications + all features", href:"/pricing", primary:true },
                { title:"Pay As You Go", price:"From $0.49",   desc:"No commitment — buy uses",          href:"/pricing#payperuse", primary:false },
              ].map(opt => (
                <div key={opt.title} style={{
                  border:`2px solid ${opt.primary ? "var(--navy)" : "var(--gray-light)"}`,
                  borderRadius:"var(--radius-sm)", padding:"1rem", textAlign:"center",
                }}>
                  <div style={{ fontFamily:"var(--font-display)", fontWeight:700, marginBottom:"0.25rem" }}>{opt.title}</div>
                  <div style={{ fontWeight:700, color:"var(--gold)", fontSize:"1.05rem", marginBottom:"0.25rem" }}>{opt.price}</div>
                  <p style={{ fontSize:"0.78rem", marginBottom:"0.7rem" }}>{opt.desc}</p>
                  <a href={opt.href} className={`btn btn-sm btn-block ${opt.primary ? "btn-primary" : "btn-outline"}`}>
                    {opt.primary ? "Subscribe Now" : "Buy Uses"}
                  </a>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPaywall(false)} style={{
              display:"block", width:"100%", background:"transparent",
              border:"none", color:"var(--gray-mid)", fontSize:"0.8rem",
              cursor:"pointer", padding:"0.5rem",
            }}>✕ Maybe Later</button>
          </div>
        </div>
      )}
    </div>
  );
}
