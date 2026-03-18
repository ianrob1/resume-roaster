import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getResumeRecord } from "@/lib/airtable";
import { getFirstNameFromResumeText } from "@/lib/email";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");
  const record_id = searchParams.get("record_id");

  let recordId: string | null = null;

  if (record_id) {
    recordId = record_id;
  } else if (session_id) {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment not configured" },
        { status: 503 }
      );
    }
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { error: "Payment not completed" },
          { status: 403 }
        );
      }
      recordId = session.metadata?.recordId ?? null;
    } catch (err) {
      console.error("Stripe session error:", err);
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 400 }
      );
    }
  }

  if (!recordId) {
    return NextResponse.json(
      { error: "Missing session_id or record_id" },
      { status: 400 }
    );
  }

  try {
    const record = await getResumeRecord(recordId);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      recordId: record.id,
      status: record.status,
      email: record.email,
      candidate_first_name: getFirstNameFromResumeText(record.raw_text),
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
