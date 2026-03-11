"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const recordId = searchParams.get("record_id");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) {
      setError("Missing record. Please start from the home page.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Checkout failed");
          return;
        }
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError("No checkout URL received");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-center text-foreground">{error}</p>
        <Link href="/" className="mt-4 text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <p className="text-foreground/80">Redirecting to payment…</p>
      <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-foreground/80">Loading…</p>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
