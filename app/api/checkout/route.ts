import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getResumeRecord } from "@/lib/airtable";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

const checkoutSchema = z.object({ recordId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid recordId" }, { status: 400 });
    }
    const { recordId } = parsed.data;

    const record = await getResumeRecord(recordId);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    if (record.status !== "uploaded") {
      return NextResponse.json(
        { error: "Record already processed" },
        { status: 400 }
      );
    }

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
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/processing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      metadata: { recordId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
