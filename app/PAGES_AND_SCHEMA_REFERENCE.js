// ================================================================
// FILE: app/word-race/page.jsx
// ================================================================
// COPY INTO app/word-race/page.jsx
/*
"use client";
import WordAssociationRace from "@/components/WordAssociationRace";
export default function WordRacePage() {
  return (
    <div className="page-wrapper section">
      <div style={{ textAlign:"center", marginBottom:"2rem" }}>
        <h1>Word Association <span style={{ color:"var(--gold)" }}>Race</span></h1>
        <p>15 rounds daily. Match the majority. Top 10 monthly scorers win FREE Basic!</p>
      </div>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        <WordAssociationRace userId="user_abc123" username="LegalEagle" />
      </div>
    </div>
  );
}
*/

// ================================================================
// FILE: app/quiz/page.jsx
// ================================================================
// COPY INTO app/quiz/page.jsx
/*
"use client";
import DailyQuiz from "@/components/DailyQuiz";
export default function QuizPage() {
  // In production: check Supabase auth session.
  // Redirect to /pricing if plan === "free".
  const USER_PLAN  = "basic";    // replace with real plan
  const USER_LEVEL = "beginner"; // replace with real level from Supabase
  const LANG       = "English";  // replace with user preference
  return (
    <div className="page-wrapper section">
      <div style={{ textAlign:"center", marginBottom:"2rem" }}>
        <h1>Daily Legal <span style={{ color:"var(--gold)" }}>Quiz</span></h1>
        <p>10 questions · TTS voice reading · Level progression on 60%+</p>
      </div>
      <DailyQuiz userPlan={USER_PLAN} userLevel={USER_LEVEL} language={LANG} />
    </div>
  );
}
*/

// ================================================================
// FILE: app/layout.jsx
// ================================================================
// COPY INTO app/layout.jsx
/*
import NavBar from "@/components/NavBar";
import "./globals.css";
export const metadata = {
  title:       "ClearClause — Legal Document Simplifier",
  description: "Understand any legal clause in plain English instantly. AI-powered, free to start.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar userPlan="free" userEmail={null} />
        {children}
      </body>
    </html>
  );
}
*/


// ================================================================
// SUPABASE DATABASE SCHEMA
// Run this SQL in: Supabase → SQL Editor → New Query → Run
// ================================================================
/*
-- User profiles (extends Supabase auth.users)
create table if not exists user_profiles (
  id                      uuid references auth.users primary key,
  plan                    text    default 'free',
  monthly_uses            int     default 0,
  uses_remaining          int     default 2,
  quiz_level              text    default 'beginner',
  word_assoc_points       int     default 0,
  word_assoc_monthly_pts  int     default 0,
  stripe_subscription_id  text,
  plan_updated_at         timestamptz,
  created_at              timestamptz default now()
);

-- Survey questions (one per day)
create table if not exists survey_questions (
  id         uuid primary key default gen_random_uuid(),
  date       date unique not null,
  question   text not null,
  option_a   text not null,
  option_b   text not null,
  category   text,
  insight    text,
  votes_a    int default 0,
  votes_b    int default 0
);

-- Survey votes (unique per user per survey)
create table if not exists survey_votes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references user_profiles(id),
  survey_id   uuid references survey_questions(id),
  vote        text not null,
  voted_at    timestamptz default now(),
  unique(user_id, survey_id)
);

-- Quiz questions
create table if not exists quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  question      text not null,
  option_a      text not null,
  option_b      text not null,
  option_c      text not null,
  correct_index int not null,
  explanation   text,
  difficulty    text default 'beginner',
  created_at    timestamptz default now()
);

-- Daily quiz completions (prevents retaking)
create table if not exists quiz_completions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references user_profiles(id),
  date       date not null,
  score      int,
  total      int,
  percentage int,
  level      text,
  unique(user_id, date)
);

-- Word association rounds (15 per day)
create table if not exists word_assoc_rounds (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  round_number int not null,
  prompt_word  text not null,
  unique(date, round_number)
);

-- Word association responses
create table if not exists word_assoc_responses (
  id            uuid primary key default gen_random_uuid(),
  round_id      uuid references word_assoc_rounds(id),
  user_id       uuid references user_profiles(id),
  response_word text not null,
  matched       boolean default false,
  points_earned int default 0,
  responded_at  timestamptz default now(),
  unique(round_id, user_id)
);

-- Monthly leaderboard
create table if not exists monthly_leaderboard (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references user_profiles(id),
  month                 text not null,
  total_points          int default 0,
  rank                  int,
  awarded_free_basic    boolean default false,
  unique(user_id, month)
);

-- Helper function: add word race points
create or replace function add_word_assoc_points(user_id uuid, pts int)
returns void language plpgsql as $$
begin
  update user_profiles
  set word_assoc_points = word_assoc_points + pts,
      word_assoc_monthly_pts = word_assoc_monthly_pts + pts
  where id = user_id;
end;
$$;

-- Helper function: increment simplification uses
create or replace function increment_uses(user_id uuid, amount int)
returns void language plpgsql as $$
begin
  update user_profiles
  set uses_remaining = uses_remaining + amount
  where id = user_id;
end;
$$;
*/
