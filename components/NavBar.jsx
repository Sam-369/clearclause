// components/NavBar.jsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function NavBar({ userPlan = "free", userEmail = null }) {
  const [open, setOpen] = useState(false);
  const isPaid = userPlan !== "free";

  const links = [
    { href:"/",            label:"Simplifier"            },
    { href:"/word-race",   label:"Word Race 🏆"          },
    { href:"/leaderboard", label:"Leaderboard"           },
    { href:"/quiz",        label:"Quiz",     paidOnly:true },
    { href:"/pricing",     label:"Pricing"               },
    { href:"/faq",         label:"FAQ"                   },
  ];

  return (
    <nav style={{
      background:"var(--navy)", borderBottom:"3px solid var(--gold)",
      position:"sticky", top:0, zIndex:100, boxShadow:"var(--shadow-md)",
    }}>
      <div style={{
        maxWidth:1120, margin:"0 auto", padding:"0 1.5rem",
        display:"flex", alignItems:"center", justifyContent:"space-between", height:62,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:"0.6rem", textDecoration:"none" }}>
          <div style={{
            width:36, height:36, borderRadius:"50%", background:"var(--gold)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--font-display)", fontWeight:900, fontSize:"1.05rem", color:"var(--navy)",
          }}>C</div>
          <span style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:"1.2rem", color:"var(--white)" }}>
            Clear<span style={{ color:"var(--gold)" }}>Clause</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.15rem" }} className="hide-mobile">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              color: l.paidOnly && !isPaid ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.82)",
              fontSize:"0.86rem", fontWeight:600, padding:"0.38rem 0.7rem",
              borderRadius:"var(--radius-xs)", textDecoration:"none", transition:"all var(--t)",
              display:"flex", alignItems:"center", gap:"0.3rem",
            }}>
              {l.label}
              {l.paidOnly && !isPaid && (
                <span style={{ fontSize:"0.6rem", background:"var(--gold)", color:"var(--navy)",
                  borderRadius:"999px", padding:"0.08rem 0.36rem", fontWeight:800 }}>PRO</span>
              )}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
          {userEmail ? (
            <Link href="/account" style={{
              color:"rgba(255,255,255,0.8)", fontSize:"0.85rem",
              fontWeight:600, textDecoration:"none", padding:"0.38rem 0.7rem",
            }}>Account</Link>
          ) : (
            <>
              <Link href="/login" style={{
                color:"rgba(255,255,255,0.72)", fontSize:"0.85rem",
                fontWeight:600, textDecoration:"none", padding:"0.38rem 0.7rem",
              }}>Login</Link>
              <Link href="/signup" className="btn btn-gold btn-sm">Free Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
