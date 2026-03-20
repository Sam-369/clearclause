# ClearClause v3 — Complete Setup Guide
## Key Changes from v2
- ✅ Google Cloud TTS replaces ElevenLabs (free tier: 4M chars/month)
- ✅ Daily Survey is mandatory gate for free users (hard lock)
- ✅ Paid users get optional "Skip for today" bypass on survey
- ✅ surveyUnlocked state flows from DailySurvey → SimplifierTool
- ✅ TTSPlayer is a single reusable component used everywhere
- ✅ Word Association Race uses Google TTS to announce each word

---

## Project Structure
```
clearcaluse-v3/
├── app/
│   ├── globals.css                  ← Design system
│   ├── layout.jsx                   ← Root layout (see reference file)
│   ├── page.jsx                     ← Homepage (survey gate + simplifier)
│   ├── leaderboard/page.jsx         ← Monthly leaderboard
│   ├── word-race/page.jsx           ← (see reference file)
│   ├── quiz/page.jsx                ← (see reference file)
│   └── api/
│       ├── tts/route.js             ← Google Cloud TTS ← NEW
│       ├── simplify/route.js        ← (see reference file)
│       ├── checkout/route.js        ← (see reference file)
│       └── webhook/route.js         ← (see reference file)
├── components/
│   ├── NavBar.jsx
│   ├── TTSPlayer.jsx                ← Reusable Google TTS player ← NEW
│   ├── DailySurvey.jsx              ← Survey with mandatory gate ← UPDATED
│   ├── SimplifierTool.jsx           ← Survey gate overlay ← UPDATED
│   ├── WordAssociationRace.jsx      ← Uses TTSPlayer for word speech
│   └── DailyQuiz.jsx                ← Uses TTSPlayer for Q+A reading
├── lib/
│   └── ttsConfig.js                 ← Voices, speeds, language map ← NEW
├── .env.example                     ← Copy to .env.local + fill in keys
└── package.json
```

---

## Step 1 — Install Dependencies
```bash
npx create-next-app@latest clearcaluse --js --tailwind --app --no-typescript
cd clearcaluse
npm install @supabase/supabase-js stripe
```

## Step 2 — Copy Files
Replace/add files from this package into your project.

## Step 3 — Set Up Google Cloud TTS (replaces ElevenLabs)
1. Go to https://console.cloud.google.com
2. Create/select a project
3. Search "Cloud Text-to-Speech API" → Click Enable
4. Go to APIs & Services → Credentials
5. Click "+ Create Credentials" → API Key
6. Copy the key (starts with AIza...)
7. Paste in .env.local: GOOGLE_TTS_API_KEY=AIza...

FREE TIER breakdown:
- Standard voices:  4,000,000 characters/month FREE
- WaveNet voices:   1,000,000 characters/month FREE
- Neural2 voices:   1,000,000 characters/month FREE
This covers thousands of daily users before any charges apply.

## Step 4 — Set Up .env.local
```
cp .env.example .env.local
```
Then fill in all values in .env.local (see the file for instructions).

## Step 5 — Set Up Supabase
1. Create account at https://supabase.com
2. Create new project
3. Go to SQL Editor → New Query
4. Copy + run the full SQL from app/PAGES_AND_SCHEMA_REFERENCE.js
5. Copy your project URL + keys into .env.local

## Step 6 — Run Locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Survey Gate Logic (how it works in code)

### Free user flow:
1. Page loads → surveyUnlocked = false
2. DailySurvey renders with "🔒 Vote to unlock simplifier" badge
3. SimplifierTool renders with blurred overlay + lock message
4. User clicks Option A or B in survey
5. DailySurvey calls onUnlock() after 500ms delay
6. surveyUnlocked becomes true in parent (page.jsx)
7. Overlay disappears, simplifier is fully usable
8. localStorage saves completion so it persists on refresh

### Paid user flow:
1. Page loads → surveyUnlocked = true (set immediately for paid)
2. DailySurvey shows normally with "Skip for today →" link
3. SimplifierTool has NO overlay — always accessible
4. User can vote (encouraged) or skip — either way, no gate

---

## Google TTS Speed Reference

| Button | Actual Rate | Sound          |
|--------|-------------|----------------|
| -3x    | 0.25        | Very slow       |
| -2x    | 0.50        | Half speed      |
| -1x    | 0.75        | Slightly slow   |
| 1x     | 1.00        | Normal (default)|
| 2x     | 2.00        | Fast            |
| 3x     | 3.00        | Very fast       |

---

## Monthly Leaderboard Reset Schedule
- Resets at midnight on the 1st of each month
- Top 10 free users win next month FREE on Basic plan
- Winners must sign up for Basic to redeem (credit applied)
- Setup a Supabase scheduled function (pg_cron) to reset monthly:

```sql
-- Enable pg_cron extension in Supabase
select cron.schedule(
  'reset-monthly-leaderboard',
  '0 0 1 * *',   -- midnight on 1st of every month
  $$
    update user_profiles set word_assoc_monthly_pts = 0;
  $$
);
```

---

## Deploy to Vercel
```bash
git init
git add .
git commit -m "ClearClause v3 launch"
git push origin main
```
Then import at vercel.com → add all .env.local values as Environment Variables → Deploy.
Change NEXT_PUBLIC_SITE_URL to https://clearclause.cc in Vercel environment variables.
