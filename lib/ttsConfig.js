// lib/ttsConfig.js
// ================================================================
// Google Cloud TTS — Voice & Speed Configuration
//
// WHY GOOGLE CLOUD TTS (not ElevenLabs):
// - ElevenLabs charges per character with a small free tier (~10k chars/mo)
// - Google Cloud TTS: 4M chars/month FREE (Standard voices)
//                     1M chars/month FREE (Neural2 / WaveNet voices)
// - For a SaaS at early stage, Google TTS is essentially free to run
// - Neural2 voices are excellent quality — very close to ElevenLabs
//
// SETUP (one-time, ~5 minutes):
// 1. https://console.cloud.google.com → Create/select project
// 2. Search "Cloud Text-to-Speech API" → Enable
// 3. APIs & Services → Credentials → + Create Credentials → API Key
// 4. Copy key → paste in .env.local as GOOGLE_TTS_API_KEY
// ================================================================

// ── LANGUAGE NAME → BCP-47 CODE MAP ──────────────────────────
// Used to match UI language picker to Google's language codes
export const LANGUAGE_CODES = {
  English:    "en-US",
  Spanish:    "es-ES",
  French:     "fr-FR",
  German:     "de-DE",
  Portuguese: "pt-BR",
  Italian:    "it-IT",
  Mandarin:   "cmn-CN",  // Google uses cmn-CN for Mandarin Chinese
  Arabic:     "ar-XA",   // Google uses ar-XA for Arabic TTS
  Hindi:      "hi-IN",
  Japanese:   "ja-JP",
};

// ── VOICES BY LANGUAGE ────────────────────────────────────────
// Format: { id, label, languageCode, tier }
// tier: "Neural2" (best) | "WaveNet" (great) | "Standard" (fast/light)
// Neural2 = most natural-sounding, recommended default
export const VOICES_BY_LANGUAGE = {
  "en-US": [
    { id:"en-US-Neural2-F", label:"Aria — Female",   languageCode:"en-US", tier:"Neural2"  },
    { id:"en-US-Neural2-D", label:"Marcus — Male",   languageCode:"en-US", tier:"Neural2"  },
    { id:"en-US-Neural2-A", label:"Clara — Female",  languageCode:"en-US", tier:"Neural2"  },
    { id:"en-US-Neural2-J", label:"Daniel — Male",   languageCode:"en-US", tier:"Neural2"  },
    { id:"en-US-Wavenet-F", label:"Sophie — Female", languageCode:"en-US", tier:"WaveNet"  },
    { id:"en-US-Wavenet-D", label:"James — Male",    languageCode:"en-US", tier:"WaveNet"  },
    { id:"en-US-Standard-F",label:"Emma — Female",   languageCode:"en-US", tier:"Standard" },
    { id:"en-US-Standard-D",label:"Oliver — Male",   languageCode:"en-US", tier:"Standard" },
  ],
  "es-ES": [
    { id:"es-ES-Neural2-A",  label:"Sofía — Female",  languageCode:"es-ES", tier:"Neural2"  },
    { id:"es-ES-Neural2-B",  label:"Carlos — Male",   languageCode:"es-ES", tier:"Neural2"  },
    { id:"es-ES-Standard-A", label:"Lucía — Female",  languageCode:"es-ES", tier:"Standard" },
  ],
  "fr-FR": [
    { id:"fr-FR-Neural2-A",  label:"Camille — Female",languageCode:"fr-FR", tier:"Neural2"  },
    { id:"fr-FR-Neural2-B",  label:"Louis — Male",    languageCode:"fr-FR", tier:"Neural2"  },
    { id:"fr-FR-Standard-A", label:"Marie — Female",  languageCode:"fr-FR", tier:"Standard" },
  ],
  "de-DE": [
    { id:"de-DE-Neural2-A",  label:"Lena — Female",   languageCode:"de-DE", tier:"Neural2"  },
    { id:"de-DE-Neural2-B",  label:"Klaus — Male",    languageCode:"de-DE", tier:"Neural2"  },
    { id:"de-DE-Standard-A", label:"Anna — Female",   languageCode:"de-DE", tier:"Standard" },
  ],
  "pt-BR": [
    { id:"pt-BR-Neural2-A",  label:"Valentina — Female",languageCode:"pt-BR",tier:"Neural2" },
    { id:"pt-BR-Neural2-B",  label:"Eduardo — Male",  languageCode:"pt-BR", tier:"Neural2"  },
    { id:"pt-BR-Standard-A", label:"Ana — Female",    languageCode:"pt-BR", tier:"Standard" },
  ],
  "it-IT": [
    { id:"it-IT-Neural2-A",  label:"Giulia — Female", languageCode:"it-IT", tier:"Neural2"  },
    { id:"it-IT-Neural2-C",  label:"Marco — Male",    languageCode:"it-IT", tier:"Neural2"  },
    { id:"it-IT-Standard-A", label:"Sofia — Female",  languageCode:"it-IT", tier:"Standard" },
  ],
  "cmn-CN": [
    { id:"cmn-CN-Wavenet-A", label:"Mei — Female",    languageCode:"cmn-CN",tier:"WaveNet"  },
    { id:"cmn-CN-Wavenet-B", label:"Wei — Male",      languageCode:"cmn-CN",tier:"WaveNet"  },
    { id:"cmn-CN-Standard-A",label:"Lin — Female",    languageCode:"cmn-CN",tier:"Standard" },
  ],
  "ar-XA": [
    { id:"ar-XA-Wavenet-A",  label:"Fatima — Female", languageCode:"ar-XA", tier:"WaveNet"  },
    { id:"ar-XA-Wavenet-B",  label:"Omar — Male",     languageCode:"ar-XA", tier:"WaveNet"  },
    { id:"ar-XA-Standard-A", label:"Nour — Female",   languageCode:"ar-XA", tier:"Standard" },
  ],
  "hi-IN": [
    { id:"hi-IN-Neural2-A",  label:"Priya — Female",  languageCode:"hi-IN", tier:"Neural2"  },
    { id:"hi-IN-Neural2-B",  label:"Rahul — Male",    languageCode:"hi-IN", tier:"Neural2"  },
    { id:"hi-IN-Standard-A", label:"Anita — Female",  languageCode:"hi-IN", tier:"Standard" },
  ],
  "ja-JP": [
    { id:"ja-JP-Neural2-B",  label:"Yuki — Female",   languageCode:"ja-JP", tier:"Neural2"  },
    { id:"ja-JP-Neural2-C",  label:"Hiroshi — Male",  languageCode:"ja-JP", tier:"Neural2"  },
    { id:"ja-JP-Standard-A", label:"Sakura — Female", languageCode:"ja-JP", tier:"Standard" },
  ],
};

// ── SPEED OPTIONS ─────────────────────────────────────────────
// Google TTS speakingRate range: 0.25 (very slow) → 4.0 (very fast)
// We map user-friendly labels to actual rate values
export const SPEED_OPTIONS = [
  { label:"-3x", rate:0.25, title:"Very slow (0.25x)"  },
  { label:"-2x", rate:0.50, title:"Slow (0.5x)"        },
  { label:"-1x", rate:0.75, title:"Slightly slow"      },
  { label:"1x",  rate:1.00, title:"Normal speed"       },
  { label:"2x",  rate:2.00, title:"Fast"               },
  { label:"3x",  rate:3.00, title:"Very fast"          },
];

// Default to 1x (index 3)
export const DEFAULT_SPEED_INDEX = 3;

// ── HELPERS ───────────────────────────────────────────────────
// Given a language display name like "French", return its voices array
export function getVoicesForLanguage(languageName) {
  const code = LANGUAGE_CODES[languageName] || "en-US";
  return VOICES_BY_LANGUAGE[code] || VOICES_BY_LANGUAGE["en-US"];
}

// Return the first (highest-quality) voice for a language
export function getDefaultVoice(languageName) {
  return getVoicesForLanguage(languageName)[0];
}
