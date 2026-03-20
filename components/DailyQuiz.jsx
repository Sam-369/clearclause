// components/DailyQuiz.jsx
// ================================================================
// PAID TIER ONLY. 10 questions/day, 3-choice answers.
// TTS reads questions + all answer options aloud (Google Cloud TTS).
// Speed controls: -3x / -2x / -1x / 1x / 2x / 3x
// Level progression: score 60%+ → advance level
// ================================================================
"use client";

import { useState, useEffect } from "react";
import TTSPlayer from "@/components/TTSPlayer";

const QUESTIONS = {
  beginner: [
    { id:1,  q:"What does 'indemnify' mean in a contract?",                        opts:["To terminate the agreement early","To protect against financial loss or claims","To transfer property ownership"], correct:1, exp:"To indemnify = to compensate someone for losses, damages, or costs they incur." },
    { id:2,  q:"A 'breach of contract' occurs when:",                              opts:["Both parties change the terms","One party fails to fulfil their obligations","The contract naturally expires"], correct:1, exp:"Breach = failure by one party to perform their promised contractual obligations." },
    { id:3,  q:"NDA stands for:",                                                  opts:["National Document Authority","No Dispute Agreement","Non-Disclosure Agreement"], correct:2, exp:"NDA = Non-Disclosure Agreement — a contract preventing disclosure of confidential information." },
    { id:4,  q:"A 'void' contract is:",                                            opts:["One requiring more signatures","One that has expired","One that has no legal effect"], correct:2, exp:"A void contract is treated as if it never existed — it is unenforceable from the start." },
    { id:5,  q:"'Force majeure' clauses excuse performance due to:",               opts:["Late payment","Extraordinary unforeseeable events","Disputes between lawyers"], correct:1, exp:"Force majeure covers natural disasters, war, pandemics — events outside a party's control." },
    { id:6,  q:"An 'arbitration clause' requires parties to:",                     opts:["Follow a payment schedule","Settle disputes privately, not in court","Define the contract start date"], correct:1, exp:"Arbitration sends disputes to a private arbitrator instead of a public court." },
    { id:7,  q:"'Liability' in a contract refers to:",                             opts:["The total contract value","Legal responsibility to compensate for harm","A list of services provided"], correct:1, exp:"Liability = legal obligation to compensate another party for loss, damage, or injury." },
    { id:8,  q:"A 'termination clause' specifies:",                                opts:["Late payment penalties","How and when the contract can be legally ended","Who is authorised to sign"], correct:1, exp:"Termination clauses define the conditions, notice periods, and procedures for ending the contract." },
    { id:9,  q:"What is a 'lien'?",                                                opts:["A type of witness signature","A legal claim on property as security for a debt","A court summons to appear"], correct:1, exp:"A lien grants a creditor the right to retain or claim property until a debt is repaid." },
    { id:10, q:"'Consideration' in contract law refers to:",                       opts:["Being thoughtful before signing","Something of value exchanged by each party","The signature and date section"], correct:1, exp:"Consideration is what each party gives in exchange — money, services, goods, or a promise." },
  ],
  intermediate: [
    { id:11, q:"What does 'estoppel' prevent a party from doing?",                 opts:["Contradicting a previous statement or position","Filing a lawsuit without legal counsel","Terminating the contract without notice"], correct:0, exp:"Estoppel stops someone from arguing a position that contradicts what they previously said or implied." },
    { id:12, q:"'Liquidated damages' are:",                                        opts:["Damages paid exclusively in cash","Pre-agreed damages written into the contract for breach","Penalties imposed by the court after judgment"], correct:1, exp:"Liquidated damages = an amount parties agree in advance as compensation for a specified breach." },
    { id:13, q:"A 'novation' agreement means:",                                    opts:["The contract renews automatically each year","A new party replaces an existing party with all parties' consent","Payment amounts are increased by agreement"], correct:1, exp:"Novation substitutes a new party or obligation, releasing the original party from liability." },
    { id:14, q:"'Subrogation' allows:",                                            opts:["A party to exit the contract early","An insurer to step into the insured's shoes to recover from a third party","A tenant to assign the lease to a subtenant"], correct:1, exp:"Subrogation lets insurers pursue third parties who caused losses they have already compensated." },
    { id:15, q:"What is a 'warranty' in a contract?",                              opts:["A guarantee that a statement is true","Written permission to modify contract terms","A payment schedule guarantee clause"], correct:0, exp:"A warranty is an assurance or promise — breach of which entitles the other party to damages." },
    { id:16, q:"An 'entire agreement clause' means:",                              opts:["Everyone on the team must sign the contract","The written contract is the complete agreement and supersedes prior discussions","All attached exhibits are incorporated automatically"], correct:1, exp:"Entire agreement clauses prevent parties relying on oral or prior written representations made before signing." },
    { id:17, q:"A 'limitation of liability clause':",                              opts:["Requires mediation before court action","Caps the maximum compensation one party can owe the other","Defines which country's law governs the contract"], correct:1, exp:"Limitation of liability clauses set a ceiling on damages — often the contract value or a fixed sum." },
    { id:18, q:"'Privity of contract' means:",                                     opts:["Contract terms are kept private between parties","Only the parties who signed can enforce or be bound by the contract","The right to confidentiality during contract negotiations"], correct:1, exp:"Privity = third parties who did not sign cannot generally sue under or be bound by the contract." },
    { id:19, q:"A 'representations and warranties' clause:",                       opts:["Sets out what each party promises is true at the time of signing","Defines the payment terms and invoice schedule","Specifies the governing law and jurisdiction"], correct:0, exp:"Reps and warranties = statements of fact both parties rely on when entering the contract." },
    { id:20, q:"'Mutual termination' of a contract requires:",                     opts:["Either party to give 30 days' written notice","Both parties to agree to end the contract together","The contract to have expired without renewal"], correct:1, exp:"Mutual termination = a formal agreement by all parties to bring the contract to an end." },
  ],
  advanced: [
    { id:21, q:"The 'parol evidence rule' prevents parties from:",                  opts:["Appealing an arbitration decision","Introducing oral agreements that contradict the written contract","Assigning their contractual rights without consent"], correct:1, exp:"The parol evidence rule bars prior or contemporaneous oral evidence contradicting an integrated written contract." },
    { id:22, q:"A 'condition precedent' in a contract is:",                        opts:["A penalty payable before execution","An event that must occur before obligations become binding","A clause requiring annual renewal approval"], correct:1, exp:"Condition precedent = a specified event must happen before a party's duty to perform is triggered." },
    { id:23, q:"'Unjust enrichment' as a legal remedy applies when:",              opts:["A party breaches the contract wilfully","One party benefits at the other's expense with no legal basis","The contract is declared void for uncertainty"], correct:1, exp:"Unjust enrichment = a party must return a benefit received where it would be inequitable to retain it." },
    { id:24, q:"A 'put option' in a shareholders' agreement gives the holder:",    opts:["The right to buy shares at a fixed price","The right to sell shares to another party at an agreed price","The right to block a third-party acquisition"], correct:1, exp:"A put option gives the holder the right (not obligation) to sell their shares at a pre-agreed price." },
    { id:25, q:"'Consequential damages' differ from direct damages because they:", opts:["Are capped by statute","Result indirectly from the breach and were foreseeable","Are only recoverable in tort, not contract"], correct:1, exp:"Consequential (indirect) damages flow from the breach but are not the immediate result — e.g. lost profits." },
  ],
};

const LEVELS = ["beginner","intermediate","advanced"];
const PASS_PCT = 60;

export default function DailyQuiz({
  userPlan  = "basic",
  userId    = null,
  userLevel = "beginner",
  language  = "English",
}) {
  const isPaid = userPlan !== "free";

  const [questions, setQuestions] = useState([]);
  const [idx,       setIdx]       = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [answered,  setAnswered]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [done,      setDone]      = useState(false);
  const [alrDone,   setAlrDone]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [leveledUp, setLeveledUp] = useState(false);
  const [nextLvl,   setNextLvl]   = useState(null);
  const [ttsText,   setTtsText]   = useState("");
  const [ttsKey,    setTtsKey]    = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isPaid) { setLoading(false); return; }
    if (localStorage.getItem(`quiz_done_${today}`)) { setAlrDone(true); setLoading(false); return; }
    const pool = [...(QUESTIONS[userLevel] || QUESTIONS.beginner)].sort(() => Math.random() - 0.5);
    setQuestions(pool.slice(0, 10));
    setLoading(false);
  }, []);

  // Speak question + options when question changes
  useEffect(() => {
    if (!questions[idx] || !isPaid) return;
    const q = questions[idx];
    const fullText = `${q.q}. Option A: ${q.opts[0]}. Option B: ${q.opts[1]}. Option C: ${q.opts[2]}.`;
    setTtsText(fullText);
    setTtsKey(k => k + 1);
  }, [idx, questions]);

  const handleAnswer = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === questions[idx].correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx + 1 >= questions.length) { finish(); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  const finish = () => {
    localStorage.setItem(`quiz_done_${today}`, "1");
    const finalScore = score + (selected === questions[idx]?.correct ? 1 : 0);
    const pct        = Math.round((finalScore / questions.length) * 100);
    const lvlIdx     = LEVELS.indexOf(userLevel);
    const canUp      = pct >= PASS_PCT && lvlIdx < LEVELS.length - 1;
    setLeveledUp(canUp);
    setNextLvl(canUp ? LEVELS[lvlIdx + 1] : null);
    setDone(true);
  };

  const finalPct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // ── Redirect free users ──
  if (!isPaid) return (
    <div className="card" style={{ textAlign:"center", padding:"2.5rem" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:"0.7rem" }}>🔒</div>
      <h3>Daily Quiz is a paid feature</h3>
      <p style={{ margin:"0.5rem 0 1.2rem" }}>
        Upgrade to unlock 10 daily questions, level progression, and TTS voice reading.
      </p>
      <a href="/pricing" className="btn btn-primary">See Plans →</a>
    </div>
  );

  if (loading) return <div className="card" style={{ textAlign:"center", padding:"2rem" }}>⏳ Loading quiz…</div>;
  if (alrDone) return (
    <div className="card" style={{ textAlign:"center", padding:"2.5rem" }}>
      <div style={{ fontSize:"2.5rem", marginBottom:"0.5rem" }}>✅</div>
      <h3>Quiz complete for today!</h3>
      <p style={{ marginTop:"0.4rem" }}>Come back tomorrow for a fresh set of questions.</p>
    </div>
  );

  if (done) {
    return (
      <div className="card animate-fadeUp" style={{ textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:"0.4rem" }}>{finalPct >= PASS_PCT ? "🎉" : "📚"}</div>
        <h2 style={{ marginBottom:"0.2rem" }}>Quiz Complete!</h2>
        <div style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:"3rem",
          color:"var(--gold)", margin:"0.4rem 0" }}>{finalPct}%</div>
        <p style={{ marginBottom:"1rem" }}>
          You got <strong>{score} / {questions.length}</strong> correct
        </p>
        {leveledUp && (
          <div style={{ background:"var(--green-light)", border:"2px solid var(--green)",
            borderRadius:"var(--radius-sm)", padding:"0.8rem 1.2rem", marginBottom:"1rem",
            color:"var(--green)", fontWeight:700 }}>
            🆙 Level Up! You've unlocked <strong style={{ color:"var(--green)" }}>{nextLvl}</strong>!
          </div>
        )}
        {!leveledUp && finalPct < PASS_PCT && (
          <p style={{ fontSize:"0.86rem", marginBottom:"1rem", color:"var(--gray-mid)" }}>
            Score {PASS_PCT}%+ to advance to the next level. Keep practising!
          </p>
        )}
        <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center" }}>
          <a href="/" className="btn btn-outline">Home</a>
          <a href="/account" className="btn btn-primary">My Progress</a>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const q   = questions[idx];
  const prg = ((idx + 1) / questions.length) * 100;
  const OPT = ["A","B","C"];

  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.9rem" }}>
        <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
          <span className="badge badge-navy">{userLevel}</span>
          <span style={{ fontSize:"0.83rem", color:"var(--gray-mid)", fontWeight:600 }}>
            {idx+1} / {questions.length}
          </span>
        </div>
        <span style={{ fontWeight:700, color:"var(--gold)" }}>Score: {score}</span>
      </div>

      <div className="progress-bar" style={{ marginBottom:"1.4rem" }}>
        <div className="progress-fill" style={{ width:`${prg}%` }}/>
      </div>

      <div className="card card-gold animate-fadeUp">
        {/* TTS Player — reads question + all answer options */}
        <div style={{ marginBottom:"1.2rem" }}>
          <TTSPlayer
            key={ttsKey}
            text={ttsText}
            language={language}
            autoPlay={false}   // User chooses when to play
          />
        </div>

        <p style={{ fontFamily:"var(--font-display)", fontWeight:600,
          fontSize:"1.08rem", color:"var(--navy)", lineHeight:1.55, marginBottom:"1.2rem" }}>
          {q.q}
        </p>

        {/* Answer options */}
        <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem" }}>
          {q.opts.map((opt, i) => {
            let bg = "var(--white)", border = "var(--gray-light)", color = "var(--ink)";
            if (answered) {
              if (i === q.correct)  { bg="var(--green-light)"; border="var(--green)"; color="var(--green)"; }
              else if (i===selected){ bg="var(--red-light)";   border="var(--red)";   color="var(--red)";   }
              else                  { bg="var(--off-white)";   color="var(--gray-mid)"; }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                style={{
                  display:"flex", alignItems:"center", gap:"0.72rem",
                  padding:"0.82rem 1rem", border:`2px solid ${border}`,
                  borderRadius:"var(--radius-sm)", background:bg, color,
                  cursor: answered ? "default" : "pointer", textAlign:"left", width:"100%",
                  transition:"all var(--t)", fontFamily:"var(--font-body)", fontSize:"0.9rem",
                }}>
                <span style={{
                  width:28, height:28, borderRadius:"50%", flexShrink:0, fontWeight:700,
                  fontSize:"0.76rem", display:"flex", alignItems:"center", justifyContent:"center",
                  background: answered && i===q.correct ? "var(--green)" : answered && i===selected ? "var(--red)" : "var(--gray-light)",
                  color: answered ? "#fff" : "var(--navy)",
                }}>{OPT[i]}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div style={{
            marginTop:"1rem", padding:"0.82rem 1rem",
            background: selected===q.correct ? "var(--green-light)" : "var(--red-light)",
            borderRadius:"var(--radius-sm)",
            border:`1px solid ${selected===q.correct ? "var(--green)" : "var(--red)"}`,
          }}>
            <strong style={{ color: selected===q.correct ? "var(--green)" : "var(--red)" }}>
              {selected===q.correct ? "✅ Correct!" : "❌ Incorrect"}
            </strong>
            <p style={{ marginTop:"0.3rem", fontSize:"0.86rem", color:"var(--ink)" }}>{q.exp}</p>
          </div>
        )}
      </div>

      {answered && (
        <button className="btn btn-primary btn-block animate-fadeUp"
          onClick={handleNext} style={{ marginTop:"1rem", padding:"0.9rem" }}>
          {idx+1 >= questions.length ? "See Results →" : "Next Question →"}
        </button>
      )}
    </div>
  );
}
