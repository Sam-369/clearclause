// components/TTSPlayer.jsx
// ================================================================
// Reusable Google Cloud TTS Player
// Used by: SimplifierTool (paid), DailyQuiz (paid),
//          WordAssociationRace word speaker (free)
//
// PROPS:
//   text        (string)  — text to read aloud
//   language    (string)  — "English", "Spanish", etc.
//   compact     (bool)    — minimal UI for word race
//   autoPlay    (bool)    — play immediately when mounted/text changes
//   onStart     (fn)      — callback when playback starts
//   onEnd       (fn)      — callback when playback ends
// ================================================================
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  SPEED_OPTIONS,
  DEFAULT_SPEED_INDEX,
  getVoicesForLanguage,
  getDefaultVoice,
} from "@/lib/ttsConfig";

export default function TTSPlayer({
  text      = "",
  language  = "English",
  compact   = false,
  autoPlay  = false,
  onStart   = () => {},
  onEnd     = () => {},
}) {
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isPaused,    setIsPaused]    = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [speedIdx,    setSpeedIdx]    = useState(DEFAULT_SPEED_INDEX);
  const [voices,      setVoices]      = useState(() => getVoicesForLanguage(language));
  const [selVoice,    setSelVoice]    = useState(() => getDefaultVoice(language));
  const [showOptions, setShowOptions] = useState(false);
  const [ttsError,    setTtsError]    = useState("");

  const audioRef = useRef(null);

  // Update voice list when language changes
  useEffect(() => {
    const v = getVoicesForLanguage(language);
    setVoices(v);
    setSelVoice(v[0]);
  }, [language]);

  // Auto-play when text changes (for word race)
  useEffect(() => {
    if (autoPlay && text) play();
  }, [text]); // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => () => stopAll(), []);

  // ── STOP all audio ──
  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      try { URL.revokeObjectURL(audioRef.current.src); } catch {}
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
  }, []);

  // ── PLAY — calls our /api/tts route ──
  const play = useCallback(async () => {
    if (!text?.trim()) return;
    stopAll();
    setTtsError("");
    setIsLoading(true);

    try {
      const speed = SPEED_OPTIONS[speedIdx];
      const res   = await fetch("/api/tts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text:         text.slice(0, 4800),
          languageCode: selVoice.languageCode,
          voiceName:    selVoice.id,
          speakingRate: speed.rate,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Audio generation failed.");
      }

      const blob  = await res.blob();
      const url   = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplaying = () => { setIsPlaying(true); setIsPaused(false); setIsLoading(false); onStart(); };
      audio.onpause   = () => { if (!audio.ended) { setIsPlaying(false); setIsPaused(true); } };
      audio.onended   = () => { setIsPlaying(false); setIsPaused(false); try { URL.revokeObjectURL(url); } catch {} onEnd(); };
      audio.onerror   = () => { setTtsError("Playback error. Try again."); stopAll(); };

      await audio.play();
    } catch (err) {
      setTtsError(err.message || "TTS failed.");
      setIsLoading(false);
    }
  }, [text, speedIdx, selVoice, stopAll, onStart, onEnd]);

  const pause  = () => audioRef.current?.pause();
  const resume = () => audioRef.current?.play();
  const stop   = () => { stopAll(); onEnd(); };

  // When speed changes mid-play, stop so user replays at new speed
  const changeSpeed = (idx) => {
    setSpeedIdx(idx);
    if (isPlaying || isPaused) {
      stopAll();
      setTtsError("Speed changed — press Play to replay at new speed.");
      setTimeout(() => setTtsError(""), 3000);
    }
  };

  // ── COMPACT (word race — just a "Hear Word" button) ──
  if (compact) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
        {isLoading ? (
          <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.6)" }}>
            <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Loading…
          </span>
        ) : isPlaying ? (
          <>
            <div className="wave-bars">{[0,1,2,3,4].map(i=><span key={i} className="wave-bar" style={{ background:"var(--gold)" }}/>)}</div>
            <button onClick={stop} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.3)", color:"rgba(255,255,255,0.7)", borderRadius:"var(--radius-xs)", padding:"0.2rem 0.55rem", fontSize:"0.72rem", cursor:"pointer" }}>⏹</button>
          </>
        ) : (
          <button onClick={play} disabled={!text}
            style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.35)", color:"rgba(255,255,255,0.75)", borderRadius:"var(--radius-xs)", padding:"0.25rem 0.7rem", fontSize:"0.75rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.3rem" }}>
            🔊 Hear again
          </button>
        )}
      </div>
    );
  }

  // ── FULL PLAYER ──
  return (
    <div style={{
      background:"var(--gold-pale)", border:"1px solid var(--gold-light)",
      borderRadius:"var(--radius-sm)", padding:"1rem 1.2rem",
    }}>
      {/* ── TOP ROW: label + speed buttons + voice toggle ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.55rem", marginBottom:"0.8rem", flexWrap:"wrap" }}>
        <span style={{ fontWeight:700, fontSize:"0.82rem", color:"var(--navy)", whiteSpace:"nowrap" }}>🔊 Listen</span>

        {/* Speed selector: -3x -2x -1x 1x 2x 3x */}
        <div style={{ display:"flex", gap:"0.18rem" }}>
          {SPEED_OPTIONS.map((opt, i) => (
            <button key={opt.label} onClick={() => changeSpeed(i)} title={opt.title}
              style={{
                padding:"0.15rem 0.38rem", fontSize:"0.68rem", fontWeight:700,
                border:     i === speedIdx ? "2px solid var(--navy)" : "1.5px solid var(--gray-light)",
                background: i === speedIdx ? "var(--navy)"           : "var(--white)",
                color:      i === speedIdx ? "var(--white)"          : "var(--gray-mid)",
                borderRadius:"var(--radius-xs)", cursor:"pointer",
                transition:"all var(--t)", minWidth:30,
              }}
            >{opt.label}</button>
          ))}
        </div>

        {/* Voice toggle */}
        <button onClick={() => setShowOptions(v => !v)}
          style={{
            marginLeft:"auto", background:"transparent",
            border:"1.5px solid var(--gray-light)", color:"var(--navy)",
            borderRadius:"var(--radius-sm)", padding:"0.22rem 0.65rem",
            fontSize:"0.72rem", cursor:"pointer", fontWeight:600,
            transition:"all var(--t)"
          }}>
          🎙 {showOptions ? "Hide" : "Voice"}
        </button>
      </div>

      {/* ── PLAY / PAUSE / STOP ROW ── */}
      <div style={{ display:"flex", gap:"0.45rem", alignItems:"center", flexWrap:"wrap" }}>
        {isLoading ? (
          <button className="btn btn-sm btn-primary" disabled>
            <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Generating…
          </button>
        ) : !isPlaying && !isPaused ? (
          <button className="btn btn-sm btn-primary" onClick={play} disabled={!text}>▶ Play</button>
        ) : isPlaying ? (
          <button className="btn btn-sm btn-outline" onClick={pause}>⏸ Pause</button>
        ) : (
          <button className="btn btn-sm btn-primary" onClick={resume}>▶ Resume</button>
        )}
        <button className="btn btn-sm btn-ghost" onClick={stop} disabled={!isPlaying && !isPaused}>⏹ Stop</button>

        {/* Animated wave while playing */}
        {isPlaying && (
          <div className="wave-bars" style={{ marginLeft:"0.2rem" }}>
            {[0,1,2,3,4].map(i => <span key={i} className="wave-bar"/>)}
          </div>
        )}
        {isPaused && <span style={{ fontSize:"0.75rem", color:"var(--gray-mid)", fontStyle:"italic" }}>Paused</span>}
      </div>

      {/* ── VOICE OPTIONS PANEL ── */}
      {showOptions && (
        <div className="animate-fadeUp" style={{ marginTop:"0.85rem", paddingTop:"0.85rem", borderTop:"1px solid var(--gold-light)" }}>
          <label style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--navy)", display:"block", marginBottom:"0.4rem" }}>
            Voice:
          </label>
          <select className="select" value={selVoice?.id || ""}
            onChange={e => setSelVoice(voices.find(v => v.id === e.target.value) || voices[0])}
            style={{ maxWidth:300, fontSize:"0.86rem", padding:"0.5rem 0.8rem" }}>
            {voices.map(v => (
              <option key={v.id} value={v.id}>{v.label} [{v.tier}]</option>
            ))}
          </select>
          <p style={{ fontSize:"0.7rem", color:"var(--gray-mid)", marginTop:"0.35rem" }}>
            Neural2 = best quality · WaveNet = natural · Standard = lightweight
          </p>
        </div>
      )}

      {/* Error message */}
      {ttsError && (
        <p style={{ marginTop:"0.6rem", fontSize:"0.78rem", color:"var(--red)" }}>⚠️ {ttsError}</p>
      )}
    </div>
  );
}
