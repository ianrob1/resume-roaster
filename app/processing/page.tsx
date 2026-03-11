"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const STEPS = [
  "Analyzing your resume…",
  "Calculating ATS score…",
  "Roasting weak bullet points…",
  "Generating improved resume…",
];

const POLL_INTERVAL_MS = 2500;
const TAKING_LONGER_AFTER_MS = 60_000; // After 60s, show "Taking a little longer" on same screen
const TRIGGER_ANALYSIS_AFTER_MS = 12_000; // If still not completed after 12s, trigger analysis (e.g. webhook didn't run)

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [takingLonger, setTakingLonger] = useState(false);
  const triggerAttemptedRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/results?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json().catch(() => ({}));
        if (data.status === "completed") {
          router.replace(`/results?session_id=${encodeURIComponent(sessionId)}`);
          return;
        }
        if (!res.ok && data.error) {
          setErrorMsg(data.error);
          return;
        }
        // If still not completed after a while, trigger analysis (e.g. Stripe webhook didn't run locally)
        const elapsed = Date.now() - startedAtRef.current;
        if (
          data.recordId &&
          data.status !== "completed" &&
          !triggerAttemptedRef.current &&
          elapsed >= TRIGGER_ANALYSIS_AFTER_MS
        ) {
          triggerAttemptedRef.current = true;
          fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recordId: data.recordId, session_id: sessionId }),
          }).catch(() => {});
        }
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sessionId, router]);

  useEffect(() => {
    if (!sessionId) return;
    const t = setTimeout(() => setTakingLonger(true), TAKING_LONGER_AFTER_MS);
    return () => clearTimeout(t);
  }, [sessionId]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 2000);
    return () => clearInterval(stepInterval);
  }, []);

  if (!sessionId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-foreground/80">Missing session. Please complete checkout first.</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg font-medium text-foreground">Something went wrong.</p>
          <p className="text-sm text-foreground/80">{errorMsg}</p>
          <a href="/" className="text-sm text-[var(--accent)] hover:underline">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 h-12 w-12 mx-auto rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-lg font-medium text-foreground">
          {STEPS[stepIndex]}
        </p>
        <p className="mt-2 text-sm text-foreground/60">
          {takingLonger
            ? "Taking a little longer for this roast — we'll have it ready soon."
            : "This usually takes under 60 seconds."}
        </p>
      </div>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-foreground/80">Loading…</p>
      </main>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
