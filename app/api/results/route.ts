import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getResumeRecord } from "@/lib/airtable";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");
  if (!session_id) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 403 }
      );
    }

    const recordId = session.metadata?.recordId;
    if (!recordId) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 400 }
      );
    }

    const record = await getResumeRecord(recordId);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      recordId: record.id,
      status: record.status,
      email: record.email,
      job_role: record.job_role,
      ats_score: record.ats_score,
      roast_text: record.roast_text,
      bullet_improvements: record.bullet_improvements,
      missing_keywords: record.missing_keywords,
      rewritten_resume: record.rewritten_resume,
    });
  } catch (err) {
    console.error("Results error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load results" },
      { status: 500 }
    );
  }
}
