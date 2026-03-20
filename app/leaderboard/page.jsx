// app/leaderboard/page.jsx
"use client";
import { useState, useEffect } from "react";

const MOCK = Array.from({ length:50 }, (_, i) => ({
  rank:    i + 1,
  userId:  `u${i}`,
  name:    `Player${(i*37+13)%999}`,
  points:  Math.max(10, 3200 - i*58 - Math.floor(Math.random()*25)),
  matches: Math.max(1, Math.floor(48 - i*0.9)),
  streak:  Math.floor(Math.random()*22),
  isMe:    i === 14,
}));

function countdown() {
  const now = new Date(), end = new Date(now.getFullYear(), now.getMonth()+1, 1);
  const d   = end - now;
  return {
    days:  Math.floor(d/(1000*60*60*24)),
    hours: Math.floor((d%(1000*60*60*24))/(1000*60*60)),
    mins:  Math.floor((d%(1000*60*60))/(1000*60)),
  };
}

export default function LeaderboardPage() {
  const [cd, setCd] = useState(countdown());
  useEffect(() => { const t = setInterval(() => setCd(countdown()), 60000); return () => clearInterval(t); }, []);

  const me    = MOCK.find(e => e.isMe);
  const month = new Date().toLocaleString("default", { month:"long", year:"numeric" });

  const medal = (r) => r===1?"🥇":r===2?"🥈":r===3?"🥉":r<=10?"🏆":null;

  return (
    <div className="page-wrapper section">
      <div style={{ textAlign:"center", marginBottom:"2.5rem" }} className="animate-fadeUp">
        <h1>Word Race <span style={{ color:"var(--gold)" }}>Leaderboard</span></h1>
        <p style={{ marginTop:"0.4rem" }}>Monthly rankings — top 10 free users win next month FREE on Basic plan.</p>
      </div>

      {/* Prize banner */}
      <div style={{
        background:"var(--navy)", borderRadius:"var(--radius)",
        padding:"1.2rem 1.7rem", marginBottom:"1.75rem",
        display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap",
        borderLeft:"6px solid var(--gold)",
      }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:900, color:"var(--gold)", fontSize:"1.05rem", marginBottom:"0.2rem" }}>
            🏆 Top 10 this month win a FREE Basic plan!
          </div>
          <p style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.7)" }}>
            Accumulate the most Word Race points in {month}. Winners receive the following month free by signing up.
          </p>
        </div>
        <a href="/pricing" className="btn btn-gold btn-sm" style={{ flexShrink:0 }}>Learn More</a>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.75rem" }}>
        <div className="card" style={{ textAlign:"center" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--gray-mid)",
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.7rem" }}>⏰ Resets In</div>
          <div style={{ display:"flex", justifyContent:"center", gap:"1rem" }}>
            {[[cd.days,"Days"],[cd.hours,"Hrs"],[cd.mins,"Min"]].map(([v,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:"1.9rem", color:"var(--navy)", lineHeight:1 }}>
                  {String(v).padStart(2,"0")}
                </div>
                <div style={{ fontSize:"0.68rem", color:"var(--gray-mid)", fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-gold" style={{ textAlign:"center" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--gray-mid)",
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.5rem" }}>Your Standing</div>
          {me ? (
            <>
              <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:"2rem", color:"var(--navy)" }}>
                #{me.rank}
              </div>
              <div style={{ fontWeight:700, color:"var(--gold)" }}>{me.points.toLocaleString()} pts</div>
              {me.rank <= 10
                ? <span className="badge badge-green" style={{ marginTop:"0.4rem" }}>🏆 In Top 10!</span>
                : <p style={{ fontSize:"0.76rem", color:"var(--gray-mid)", marginTop:"0.3rem" }}>{me.rank-10} spots from winning</p>
              }
            </>
          ) : (
            <>
              <p style={{ fontSize:"0.86rem", marginBottom:"0.8rem" }}>Play Word Race to appear here!</p>
              <a href="/word-race" className="btn btn-sm btn-primary">Play Now</a>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"56px 1fr 100px 90px 80px",
          background:"var(--navy)", padding:"0.7rem 1.2rem", gap:"0.5rem" }}>
          {["Rank","Player","Points","Matches","Streak"].map(h => (
            <div key={h} style={{ color:"rgba(255,255,255,0.55)", fontSize:"0.68rem",
              fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{h}</div>
          ))}
        </div>
        {MOCK.map(e => (
          <div key={e.userId} style={{
            display:"grid", gridTemplateColumns:"56px 1fr 100px 90px 80px",
            padding:"0.8rem 1.2rem", gap:"0.5rem", alignItems:"center",
            background: e.isMe ? "var(--gold-pale)" : e.rank%2===0 ? "var(--off-white)" : "var(--white)",
            borderLeft: e.isMe ? "4px solid var(--gold)" : "4px solid transparent",
            borderBottom:"1px solid var(--gray-light)",
          }}>
            <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:"0.95rem",
              color: e.rank<=3 ? "var(--gold)" : "var(--navy)" }}>
              {medal(e.rank) ?? `#${e.rank}`}
            </div>
            <div style={{ fontWeight: e.isMe ? 700 : 400, color:"var(--ink)", fontSize:"0.9rem" }}>
              {e.name}{e.isMe && <span className="badge badge-gold" style={{ marginLeft:"0.45rem", fontSize:"0.62rem" }}>You</span>}
            </div>
            <div style={{ fontWeight:700, color:"var(--gold)", fontFamily:"var(--font-display)" }}>
              {e.points.toLocaleString()}
            </div>
            <div style={{ color:"var(--gray-mid)", fontSize:"0.86rem" }}>{e.matches}</div>
            <div style={{ color:"var(--gray-mid)", fontSize:"0.86rem" }}>{e.streak>0?`🔥 ${e.streak}`:"–"}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign:"center", marginTop:"2.5rem" }}>
        <h3 style={{ marginBottom:"0.5rem" }}>Want to climb the ranks?</h3>
        <p style={{ marginBottom:"1.25rem" }}>Play Word Race daily to rack up points before the monthly reset.</p>
        <a href="/word-race" className="btn btn-gold btn-lg" style={{ fontFamily:"var(--font-display)" }}>
          Play Today's Word Race →
        </a>
      </div>
    </div>
  );
}
