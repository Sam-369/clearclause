// app/api/tts/route.js
// ================================================================
// Google Cloud Text-to-Speech — Server-side API Route
//
// Receives: { text, languageCode, voiceName, speakingRate }
// Returns:  MP3 audio bytes (audio/mpeg)
//
// The GOOGLE_TTS_API_KEY stays on the server — the browser
// never sees it. All TTS requests go through this route.
//
// Google Cloud TTS free tier:
//   Standard voices  → 4,000,000 characters/month free
//   WaveNet voices   → 1,000,000 characters/month free
//   Neural2 voices   → 1,000,000 characters/month free
// At early stage ClearClause usage, this is effectively free.
// ================================================================

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      text,
      languageCode  = "en-US",
      voiceName     = "en-US-Neural2-F",
      speakingRate  = 1.0,
    } = body;

    // ── Validation ────────────────────────────────────────────
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return Response.json({ error: "No text provided." }, { status: 400 });
    }

    if (!process.env.GOOGLE_TTS_API_KEY) {
      console.error("GOOGLE_TTS_API_KEY is not set in .env.local");
      return Response.json({ error: "TTS not configured." }, { status: 500 });
    }

    // Google TTS max input: 5000 bytes per request
    // Trim text if too long to avoid errors
    const safeText = text.trim().slice(0, 4800);

    // ── Call Google Cloud TTS REST API ────────────────────────
    // Docs: https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
    const googleRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // The text to speak
          input: {
            text: safeText,
          },
          // Voice selection
          voice: {
            languageCode,        // e.g. "en-US", "fr-FR"
            name: voiceName,     // e.g. "en-US-Neural2-F"
          },
          // Audio output format
          audioConfig: {
            audioEncoding: "MP3",             // Return as MP3
            speakingRate:  Math.min(Math.max(speakingRate, 0.25), 4.0), // clamp to valid range
            pitch:         0.0,               // default pitch
            volumeGainDb:  1.0,               // slight volume boost
            sampleRateHertz: 24000,           // 24kHz — good quality/size balance
          },
        }),
      }
    );

    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error("Google TTS API error:", errText);
      // Try to parse Google's error message
      try {
        const errJson = JSON.parse(errText);
        throw new Error(errJson.error?.message || "Google TTS API error");
      } catch {
        throw new Error("Google TTS API error — check your GOOGLE_TTS_API_KEY");
      }
    }

    const data = await googleRes.json();

    // Google returns base64-encoded MP3 audio
    const audioBuffer = Buffer.from(data.audioContent, "base64");

    // Return audio bytes directly — browser creates a Blob URL from this
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type":   "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control":  "private, max-age=300", // cache for 5 mins
      },
    });

  } catch (err) {
    console.error("TTS route error:", err.message);
    return Response.json(
      { error: err.message || "Failed to generate audio." },
      { status: 500 }
    );
  }
}
