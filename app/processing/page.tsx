"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const STEPS = [
  "Analyzing your resume…",
  "Calculating ATS score…",
  "Roasting weak bullet points…",
  "Generating improved resume…",
];

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS = 2 * 60 * 1000;

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [stepIndex, setStepIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const deadline = Date.now() + TIMEOUT_MS;
    const interval = setInterval(async () => {
      if (Date.now() > deadline) {
        setTimedOut(true);
        return;
      }
      try {
        const res = await fetch(`/api/results?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json().catch(() => ({}));
        if (data.status === "completed") {
          router.replace(`/results?session_id=${encodeURIComponent(sessionId)}`);
          return;
        }
        if (!res.ok && data.error) {
          setErrorMsg(data.error);
        }
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sessionId, router]);

  useEffect(() => {
    if (!sessionId) return;
    const t = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
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

  if (timedOut || errorMsg) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <p className="text-lg font-medium text-foreground">
            {timedOut ? "This is taking longer than usual." : "Something went wrong."}
          </p>
          {errorMsg && <p className="text-sm text-foreground/80">{errorMsg}</p>}
          <p className="text-sm text-foreground/60">
            Check your email for the report, or try opening your results below.
          </p>
          <a
            href={`/results?session_id=${encodeURIComponent(sessionId ?? "")}`}
            className="inline-block rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            View results
          </a>
          <br />
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
          This usually takes under 60 seconds.
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
