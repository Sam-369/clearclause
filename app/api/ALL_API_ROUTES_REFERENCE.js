// ================================================================
// FILE: app/layout.jsx
// ================================================================
// COPY THIS BLOCK INTO app/layout.jsx
/*
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata = {
  title:       "ClearClause — Legal Document Simplifier",
  description: "Understand any legal clause in plain English instantly. AI-powered, free to start.",
  keywords:    "legal document simplifier, contract explainer, plain language law, understand lease",
  openGraph: {
    title:       "ClearClause — Legal Document Simplifier",
    description: "Paste any legal clause. Get a plain-English explanation instantly.",
    url:         "https://clearclause.cc",
    siteName:    "ClearClause",
    type:        "website",
  },
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
// FILE: app/api/simplify/route.js
// ================================================================
// COPY THIS BLOCK INTO app/api/simplify/route.js
/*
export async function POST(request) {
  try {
    const { text, language } = await request.json();
    if (!text?.trim()) return Response.json({ error: "No text." }, { status: 400 });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are ClearClause, a legal document simplifier. Explain the
following legal text clearly in plain, simple ${language}. No jargon. Be concise
and step-by-step. After your explanation, write exactly:
SUGGESTIONS:
Then list 2–3 practical tips or warnings for the user, each starting with -`,
          },
          { role: "user", content: `Simplify this legal text:\n\n${text}` },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!res.ok) throw new Error("OpenAI API error");

    const data = await res.json();
    const full = data.choices[0].message.content || "";

    let simplifiedText = full;
    let suggestions    = [];

    if (full.includes("SUGGESTIONS:")) {
      const [main, rest] = full.split("SUGGESTIONS:");
      simplifiedText = main.trim();
      suggestions    = rest
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.startsWith("-"))
        .map(l => l.slice(1).trim());
    }

    return Response.json({ simplifiedText, suggestions });
  } catch (err) {
    console.error("Simplify error:", err.message);
    return Response.json({ error: "Simplification failed." }, { status: 500 });
  }
}
*/


// ================================================================
// FILE: app/api/checkout/route.js
// ================================================================
// COPY THIS BLOCK INTO app/api/checkout/route.js
/*
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  basic:     process.env.STRIPE_PRICE_BASIC,
  pro:       process.env.STRIPE_PRICE_PRO,
  business:  process.env.STRIPE_PRICE_BUSINESS,
  single:    process.env.STRIPE_PRICE_SINGLE,
  bundle10:  process.env.STRIPE_PRICE_BUNDLE10,
  bundle30:  process.env.STRIPE_PRICE_BUNDLE30,
};

const SUBS = ["basic","pro","business"];

export async function POST(request) {
  const { planKey, userId, userEmail } = await request.json();
  const priceId = PRICE_MAP[planKey];
  if (!priceId) return Response.json({ error: "Invalid plan." }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: SUBS.includes(planKey) ? "subscription" : "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    customer_email: userEmail || undefined,
    metadata: { userId: userId || "guest", planKey },
  });

  return Response.json({ url: session.url });
}
*/


// ================================================================
// FILE: app/api/webhook/route.js
// ================================================================
// COPY THIS BLOCK INTO app/api/webhook/route.js
/*
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PLAN_MAP = {
  [process.env.STRIPE_PRICE_BASIC]:    { plan:"basic",    uses:30  },
  [process.env.STRIPE_PRICE_PRO]:      { plan:"pro",      uses:999 },
  [process.env.STRIPE_PRICE_BUSINESS]: { plan:"business", uses:999 },
  [process.env.STRIPE_PRICE_SINGLE]:   { plan:"free",     uses:1   },
  [process.env.STRIPE_PRICE_BUNDLE10]: { plan:"free",     uses:10  },
  [process.env.STRIPE_PRICE_BUNDLE30]: { plan:"free",     uses:30  },
};

export async function POST(request) {
  const payload   = await request.text();
  const sig       = request.headers.get("stripe-signature");
  const event     = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    const session  = event.data.object;
    const userId   = session.metadata?.userId;
    const items    = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId  = items.data[0]?.price?.id;
    const info     = PLAN_MAP[priceId];
    if (!info || !userId) return new Response("OK");

    if (info.uses < 999) {
      // Pay-per-use: increment usage credits
      await supabase.rpc("increment_uses", { user_id: userId, amount: info.uses });
    } else {
      // Subscription: update plan
      await supabase.from("user_profiles").update({
        plan: info.plan,
        stripe_subscription_id: session.subscription,
        plan_updated_at: new Date().toISOString(),
      }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    await supabase.from("user_profiles")
      .update({ plan:"free", stripe_subscription_id:null })
      .eq("stripe_subscription_id", event.data.object.id);
  }

  return new Response("OK", { status: 200 });
}
*/
