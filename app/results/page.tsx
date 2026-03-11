"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ScoreCard } from "@/components/ScoreCard";
import { RoastSection } from "@/components/RoastSection";

interface ResultsData {
  recordId?: string;
  status: string;
  job_role?: string;
  ats_score?: number;
  roast_text?: string;
  bullet_improvements?: Array<{ before: string; after: string }>;
  missing_keywords?: string[];
  rewritten_resume?: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const autoRunDoneRef = useRef(false);

  const runAnalysisNow = async () => {
    if (!data?.recordId || !sessionId) return;
    setTriggerError(null);
    setTriggering(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: data.recordId, session_id: sessionId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTriggerError(json.error ?? "Analysis failed");
        setTriggering(false);
        return;
      }
      const maxWait = 90000;
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        await new Promise((r) => setTimeout(r, 3000));
        const r2 = await fetch(`/api/results?session_id=${encodeURIComponent(sessionId)}`);
        const d = await r2.json();
        if (d.status === "completed") {
          setData(d);
          break;
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "AbortError"
          ? "Request timed out. Try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setTriggerError(msg);
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/results?session_id=${encodeURIComponent(sessionId)}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load results");
          setLoading(false);
          return;
        }
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  // Auto-start analysis when results page loads and report isn't ready yet
  useEffect(() => {
    if (
      loading ||
      !data ||
      data.status === "completed" ||
      !data.recordId ||
      !sessionId ||
      triggering ||
      autoRunDoneRef.current
    )
      return;
    autoRunDoneRef.current = true;
    runAnalysisNow();
  }, [loading, data?.status, data?.recordId, sessionId, triggering]);

  function handleDownload() {
    if (!data?.rewritten_resume) return;
    const blob = new Blob([data.rewritten_resume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "improved-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="mt-4 text-foreground/80">Loading your results…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-foreground">{error ?? "No data"}</p>
        <Link href="/" className="mt-4 text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  if (data.status !== "completed") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          {triggering ? (
            <>
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent mx-auto" />
              <p className="text-foreground/80">Preparing your roast…</p>
              <p className="text-sm text-foreground/60">This usually takes 30–60 seconds.</p>
            </>
          ) : (
            <>
              <p className="text-foreground/80">
                {triggerError
                  ? "Something went wrong. You can try again."
                  : "Your roast didn’t finish automatically. You can run it now."}
              </p>
              {triggerError && <p className="text-sm text-red-600">{triggerError}</p>}
              <button
                type="button"
                onClick={runAnalysisNow}
                disabled={!data.recordId}
                className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                Run analysis now
              </button>
            </>
          )}
          <br />
          <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground">Your Resume Roast</h1>

        {typeof data.ats_score === "number" && (
          <ScoreCard score={data.ats_score} />
        )}

        {data.roast_text && (
          <RoastSection text={data.roast_text} />
        )}

        {data.bullet_improvements && data.bullet_improvements.length > 0 && (
          <div className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Bullet Point Improvements</h2>
            <ul className="mt-4 space-y-4">
              {data.bullet_improvements.map((item, i) => (
                <li key={i} className="border-l-2 border-foreground/20 pl-4">
                  <p className="text-sm font-medium text-foreground/70">Before</p>
                  <p className="text-foreground/90">{item.before}</p>
                  <p className="mt-2 text-sm font-medium text-foreground/70">After</p>
                  <p className="text-foreground/90">{item.after}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.missing_keywords && data.missing_keywords.length > 0 && (
          <div className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              Missing keywords for {data.job_role ?? "your role"}
            </h2>
            <ul className="mt-3 list-inside list-disc text-foreground/90">
              {data.missing_keywords.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
            </ul>
          </div>
        )}

        {data.rewritten_resume && (
          <div className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Improved Resume</h2>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-foreground/90">
              {data.rewritten_resume}
            </pre>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              Download Improved Resume
            </button>
          </div>
        )}

        <div className="pt-4">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Roast another resume
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="mt-4 text-foreground/80">Loading…</p>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}
