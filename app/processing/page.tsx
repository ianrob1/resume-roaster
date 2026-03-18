"use client";

import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const PROCESSING_STEPS = [
  { icon: "/icons/bullet.png", label: "Rewriting your bullet points…" },
  { icon: "/icons/ats.png", label: "Calculating ATS score…" },
  { icon: "/icons/roast.png", label: "Roasting weak spots…" },
  { icon: "/icons/keyword.png", label: "Finding missing keywords…" },
  { icon: "/icons/rewrite.png", label: "Generating your improved resume…" },
];

const POLL_INTERVAL_MS = 2500;
const SHOW_SUBTEXT_AFTER_MS = 30_000; // Don't show "This usually takes..." until 30s
const TAKING_LONGER_AFTER_MS = 60_000; // After 60s, show "Taking a little longer" on same screen
const TRIGGER_ANALYSIS_AFTER_MS = 12_000; // If still not completed after 12s, trigger analysis (e.g. webhook didn't run)

// Preview mode: use ?session_id=preview to see the screen without checkout. Add &fast=1 to speed up subtext (3s) and "taking longer" (6s).
const PREVIEW_FAST_SUBTEXT_MS = 3000;
const PREVIEW_FAST_TAKING_LONGER_MS = 6000;

// Staggered step animation so exit finishes before next enters
const STEP_SHOW_MS = 2200; // Time each step is fully visible
const STEP_TRANSITION_MS = 600; // Duration of exit (out) animation
const STEP_ENTER_MS = 320; // Duration of enter (in) animation — faster

// Dots after "This usually takes under 60 seconds." — cycle 1, 2, 3, 2, 1
const DOTS_SEQUENCE = [1, 2, 3, 2, 1];
const DOTS_INTERVAL_MS = 400;

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const recordIdParam = searchParams.get("record_id");
  const isPreview = sessionId === "preview";
  const isFastPreview = isPreview && searchParams.get("fast") === "1";
  const isFreeFlow = !!recordIdParam;
  type StepPhase = "showing" | "exiting" | "entering";
  const [stepIndex, setStepIndex] = useState(0);
  const [stepPhase, setStepPhase] = useState<StepPhase>("showing");
  const [showSubtext, setShowSubtext] = useState(false);
  const [subtextAnimated, setSubtextAnimated] = useState(false);
  const [dotsIndex, setDotsIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [takingLonger, setTakingLonger] = useState(false);
  const triggerAttemptedRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());

  // Free flow: trigger analysis once on mount
  useEffect(() => {
    if (!isFreeFlow || !recordIdParam || triggerAttemptedRef.current) return;
    triggerAttemptedRef.current = true;
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId: recordIdParam }),
    }).catch(() => {});
  }, [isFreeFlow, recordIdParam]);

  useEffect(() => {
    if (isPreview) return;
    const id = sessionId ? `session_id=${encodeURIComponent(sessionId)}` : recordIdParam ? `record_id=${encodeURIComponent(recordIdParam)}` : null;
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/results?${id}`);
        const data = await res.json().catch(() => ({}));
        if (data.status === "completed") {
          router.replace(`/results?${id}`);
          return;
        }
        if (!res.ok && data.error) {
          setErrorMsg(data.error);
          return;
        }
        // Stripe flow only: if still not completed after a while, trigger analysis (e.g. webhook didn't run locally)
        if (
          sessionId &&
          data.recordId &&
          data.status !== "completed" &&
          !triggerAttemptedRef.current &&
          Date.now() - startedAtRef.current >= TRIGGER_ANALYSIS_AFTER_MS
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
  }, [sessionId, recordIdParam, router, isPreview]);

  useEffect(() => {
    if (!sessionId && !recordIdParam) return;
    const delay = isFastPreview ? PREVIEW_FAST_TAKING_LONGER_MS : TAKING_LONGER_AFTER_MS;
    const t = setTimeout(() => setTakingLonger(true), delay);
    return () => clearTimeout(t);
  }, [sessionId, recordIdParam, isFastPreview]);

  useEffect(() => {
    if (!sessionId && !recordIdParam) return;
    const delay = isFastPreview ? PREVIEW_FAST_SUBTEXT_MS : SHOW_SUBTEXT_AFTER_MS;
    const t = setTimeout(() => setShowSubtext(true), delay);
    return () => clearTimeout(t);
  }, [sessionId, recordIdParam, isFastPreview]);

  useEffect(() => {
    if (!showSubtext) {
      setSubtextAnimated(false);
      return;
    }
    const id = requestAnimationFrame(() => setSubtextAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [showSubtext]);

  useEffect(() => {
    if (!showSubtext || takingLonger) return;
    const t = setInterval(
      () => setDotsIndex((i) => (i + 1) % DOTS_SEQUENCE.length),
      DOTS_INTERVAL_MS
    );
    return () => clearInterval(t);
  }, [showSubtext, takingLonger]);

  // Staggered step cycle: show -> exit -> advance & enter -> show
  useEffect(() => {
    if (stepPhase !== "showing") return;
    const t = setTimeout(() => setStepPhase("exiting"), STEP_SHOW_MS);
    return () => clearTimeout(t);
  }, [stepIndex, stepPhase]);

  useEffect(() => {
    if (stepPhase !== "exiting") return;
    const t = setTimeout(() => {
      setStepIndex((i) => (i + 1) % PROCESSING_STEPS.length);
      setStepPhase("entering");
    }, STEP_TRANSITION_MS);
    return () => clearTimeout(t);
  }, [stepPhase]);

  useEffect(() => {
    if (stepPhase !== "entering") return;
    const t = setTimeout(() => setStepPhase("showing"), STEP_ENTER_MS);
    return () => clearTimeout(t);
  }, [stepPhase]);

  if (!sessionId && !recordIdParam) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-foreground/80">Missing session or record. Please start from the home page.</p>
        <a href="/processing?session_id=preview" className="mt-3 text-sm text-[var(--accent)] hover:underline">
          Preview processing screen
        </a>
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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {isPreview && (
        <a href="/" className="absolute top-4 right-4 text-sm text-foreground/60 hover:text-foreground">
          Back to home
        </a>
      )}
      <div className="max-w-lg w-full px-2 text-center">
        <div className="relative mb-6 h-16 w-16 mx-auto overflow-visible">
          {PROCESSING_STEPS.map((step, i) => {
            const isActive = i === stepIndex;
            const isExiting = stepPhase === "exiting" && isActive;
            const isEntering = stepPhase === "entering" && isActive;
            const visible = isActive && (stepPhase === "showing" || isEntering);
            const transform = visible
              ? "translateX(0)"
              : isExiting
                ? "translateX(24px)"
                : "translateX(-24px)";
            return (
              <div
                key={step.icon}
                className="absolute inset-0 flex items-center justify-center transition-all ease-out"
                style={{
                  transitionDuration: `${isExiting ? STEP_TRANSITION_MS : STEP_ENTER_MS}ms`,
                  opacity: visible ? 1 : 0,
                  transform,
                  pointerEvents: visible ? "auto" : "none",
                }}
                aria-hidden={!visible}
              >
                <Image
                  src={step.icon}
                  alt=""
                  width={i === 0 ? 48 : 64}
                  height={i === 0 ? 48 : 64}
                  className={`object-contain icon-tint-orange ${i === 0 ? "h-12 w-12" : "h-16 w-16"}`}
                />
              </div>
            );
          })}
        </div>
        <div className="relative min-h-[2.5rem] flex items-center justify-center overflow-visible">
          {PROCESSING_STEPS.map((step, i) => {
            const isActive = i === stepIndex;
            const isExiting = stepPhase === "exiting" && isActive;
            const visible = isActive && (stepPhase === "showing" || stepPhase === "entering");
            const transform = visible
              ? "translate(-50%, 0)"
              : isExiting
                ? "translate(calc(-50% + 24px), 0)"
                : "translate(calc(-50% - 24px), 0)";
            return (
              <p
                key={step.label}
                className="absolute left-1/2 text-lg font-medium text-foreground transition-[opacity,transform] ease-out whitespace-nowrap"
                style={{
                  transitionDuration: `${isExiting ? STEP_TRANSITION_MS : STEP_ENTER_MS}ms`,
                  opacity: visible ? 1 : 0,
                  transform,
                  pointerEvents: visible ? "auto" : "none",
                }}
                aria-hidden={!visible}
              >
                {step.label}
              </p>
            );
          })}
        </div>
        <div className="mt-2 min-h-[2rem] flex items-end justify-center">
          {showSubtext && (
            <p
              className="text-sm text-foreground/60 ease-out text-center"
              style={{
                opacity: subtextAnimated ? 1 : 0,
                transform: subtextAnimated ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 400ms ease-out, transform 400ms ease-out",
              }}
            >
              {takingLonger
                ? "Taking a little longer for this roast — we'll have it ready soon."
                : (
                  <>
                    This usually takes under 60 seconds
                    <span className="inline-block min-w-[1.25em] text-left tabular-nums" aria-hidden>
                      {".".repeat(DOTS_SEQUENCE[dotsIndex])}
                    </span>
                  </>
                )}
            </p>
          )}
        </div>
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
