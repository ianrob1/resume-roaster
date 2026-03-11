import { NextResponse } from "next/server";
import Stripe from "stripe";
import { runAnalysis } from "@/lib/analysis";
import { getResumeRecord } from "@/lib/airtable";
import { getFirstNameFromResumeText, sendResumeRoastEmail } from "@/lib/email";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const recordId = session.metadata?.recordId;
  if (!recordId) {
    console.error("Webhook: no recordId in metadata");
    return NextResponse.json({ received: true });
  }

  try {
    const result = await runAnalysis(recordId);
    const record = await getResumeRecord(recordId);
    if (record && session.id) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        (() => {
          try {
            const u = new URL(request.url);
            return `${u.protocol}//${u.host}`;
          } catch {
            return "http://localhost:3000";
          }
        })();
      const resultsLink = `${baseUrl}/results?session_id=${encodeURIComponent(session.id)}`;
      await sendResumeRoastEmail({
        to: record.email,
        atsScore: result.ats_score,
        resultsLink,
        roastText: result.roast,
        bulletImprovements: result.bullet_improvements,
        missingKeywords: result.missing_keywords,
        rewrittenResume: result.rewritten_resume,
        jobRole: record.job_role,
        candidateFirstName: getFirstNameFromResumeText(record.raw_text),
      });
    }
  } catch (err) {
    console.error("Webhook analysis error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
