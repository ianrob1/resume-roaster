"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { parseResumeContent } from "@/lib/resume-format";
import { Header } from "@/components/Header";
import { ScoreCard } from "@/components/ScoreCard";
import { RoastSection } from "@/components/RoastSection";

interface ResultsData {
  recordId?: string;
  status: string;
  email?: string;
  candidate_first_name?: string | null;
  job_role?: string;
  ats_score?: number;
  roast_text?: string;
  bullet_improvements?: Array<{ before: string; after: string }>;
  missing_keywords?: string[];
  rewritten_resume?: string;
}

/** Derive a friendly first name from email (e.g. jane.doe@x.com → Jane). */
function getFirstNameFromEmail(email: string | undefined): string | null {
  if (!email?.trim()) return null;
  const local = email.split("@")[0]?.trim() ?? "";
  const segment = local.split(/[._-]/)[0] ?? "";
  if (segment.length < 2) return null; // avoid "J" or single char
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

// Sample data for preview: /results?session_id=preview
const PREVIEW_RESULTS: ResultsData = {
  status: "completed",
  email: "jane@example.com",
  candidate_first_name: "Jane",
  job_role: "Product Manager",
  ats_score: 72,
  roast_text:
    "Your resume has solid experience but reads like a job description. We've tightened your bullets to focus on impact and numbers. The ATS score is decent; adding the missing keywords below will help you get past more screens.",
  bullet_improvements: [
    {
      before: "Responsible for managing the product roadmap and working with engineering.",
      after: "Drove product roadmap for 3 squads; shipped 4 major features in 2024, increasing activation by 18%.",
    },
    {
      before: "Collaborated with cross-functional teams to deliver projects on time.",
      after: "Led cross-functional pods (Eng, Design, Ops); delivered 12 projects on time with 95% stakeholder satisfaction.",
    },
  ],
  missing_keywords: ["stakeholder", "roadmap", "agile", "metrics", "KPI"],
  rewritten_resume:
    "JANE DOE\nProduct Manager\n\nEXPERIENCE\n\nSenior Product Manager, Tech Co. (2022–Present)\n• Drove product roadmap for 3 squads; shipped 4 major features in 2024, increasing activation by 18%.\n• Led cross-functional pods (Eng, Design, Ops); delivered 12 projects on time with 95% stakeholder satisfaction.\n\n...",
};

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
    if (sessionId === "preview") {
      setData(PREVIEW_RESULTS);
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

  // Auto-start analysis when results page loads and report isn't ready yet (skip for preview)
  useEffect(() => {
    if (
      sessionId === "preview" ||
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when we have incomplete data
  }, [loading, data?.status, data?.recordId, sessionId, triggering]);

  async function handleDownloadDocx() {
    if (!data?.rewritten_resume) return;
    try {
      const res = await fetch("/api/export-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.rewritten_resume }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "improved-resume.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  function handleDownloadPdf() {
    if (!data?.rewritten_resume) return;
    const parsed = parseResumeContent(data.rewritten_resume);
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 20;
    const bulletIndent = 8;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const maxWidthBullet = maxWidth - bulletIndent;
    let y = margin;
    const lineHeight = 5.5;
    const lineHeightSection = 7;
    const pageHeight = doc.internal.pageSize.getHeight();

    const addPageIfNeeded = (needed: number) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };
    const drawText = (text: string, x: number, size: number, bold: boolean, indent = 0) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const w = indent ? maxWidthBullet : maxWidth;
      const wrapped = doc.splitTextToSize(text || " ", w);
      addPageIfNeeded(wrapped.length * (lineHeight + 0.5));
      doc.text(wrapped, x + indent, y);
      y += wrapped.length * lineHeight;
    };

    if (parsed.name) {
      drawText(parsed.name, margin, 14, true);
      y += 2;
    }
    if (parsed.contact) {
      drawText(parsed.contact, margin, 11, false);
      y += 4;
    }
    for (const section of parsed.sections) {
      if (section.title) {
        addPageIfNeeded(lineHeightSection + 4);
        y += 4;
        drawText(section.title, margin, 11, true);
        y += 2;
      }
      for (const line of section.lines) {
        drawText(line, margin, 11, false);
      }
      for (const bullet of section.bullets) {
        drawText(`- ${bullet}`, margin, 11, false, bulletIndent);
      }
    }
    doc.save("improved-resume.pdf");
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
        <div className="mt-4 flex flex-col items-center gap-2">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Back to home
          </Link>
          <Link href="/results?session_id=preview" className="text-sm text-foreground/70 hover:underline">
            Preview results example
          </Link>
        </div>
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

  const firstName = data.candidate_first_name ?? getFirstNameFromEmail(data.email);
  const displayName = firstName ?? "there";

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        {/* Hero / greeting */}
        <section className="mb-10 text-center">
          <p className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
            {displayName}, your resume has been <span className="font-marker text-[var(--accent)]">Roasted</span><span className="font-marker text-foreground">!</span>
          </p>
          {data.email && (
            <p className="mt-2 text-sm text-gray-500">
              This report has been sent to {data.email}
            </p>
          )}
        </section>

        {/* ATS score — icon outside top-left, then card */}
        {typeof data.ats_score === "number" && (
          <section className="mb-8">
            <div className="mb-3">
              <img
                src="/icons/ats.png"
                alt=""
                className="h-12 w-12 object-contain icon-tint-orange"
                width={48}
                height={48}
              />
            </div>
            <ScoreCard score={data.ats_score} />
          </section>
        )}

        {/* Roast — icon outside top-left, then card */}
        {data.roast_text && (
          <section className="mb-8">
            <div className="mb-3">
              <img
                src="/icons/roast.png"
                alt=""
                className="h-12 w-12 object-contain icon-tint-orange"
                width={48}
                height={48}
              />
            </div>
            <RoastSection text={data.roast_text} title="The Roast" />
          </section>
        )}

        {/* Bullet improvements — icon outside top-left, then card */}
        {data.bullet_improvements && data.bullet_improvements.length > 0 && (
          <section className="mb-8">
            <div className="mb-3">
              <img
                src="/icons/bullet.png"
                alt=""
                className="h-8 w-8 object-contain icon-tint-orange"
                width={32}
                height={32}
              />
            </div>
            <div className="rounded-2xl border-2 border-foreground/10 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">
                Bullet point improvements
              </h2>
              <p className="mt-1 text-sm text-foreground/60">
                We rewrote weak bullets to be more impact-focused.
              </p>
              <ul className="mt-6 space-y-6">
                {data.bullet_improvements.map((item, i) => (
                  <li key={i} className="flex flex-col gap-3 rounded-xl bg-foreground/[0.03] p-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                        Before
                      </span>
                      <p className="mt-1 text-foreground/90">{item.before}</p>
                    </div>
                    <div className="border-t border-foreground/10 pt-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                        After
                      </span>
                      <p className="mt-1 font-medium text-foreground">{item.after}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Missing keywords — icon outside top-left (key bigger), then card */}
        {data.missing_keywords && data.missing_keywords.length > 0 && (
          <section className="mb-8">
            <div className="mb-3">
              <img
                src="/icons/keyword.png"
                alt=""
                className="h-10 w-10 object-contain icon-tint-orange"
                width={40}
                height={40}
              />
            </div>
            <div className="rounded-2xl border-2 border-foreground/10 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">
                Keywords to add for {data.job_role ?? "your role"}
              </h2>
              <p className="mt-1 text-sm text-foreground/60">
                Including these can help you get past more ATS screens.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.missing_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-medium text-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Improved resume — AI/rewrite icon outside top-left (bigger), then card */}
        {data.rewritten_resume && (
          <section className="mb-10">
            <div className="mb-3">
              <img
                src="/icons/rewrite.png"
                alt=""
                className="h-12 w-12 object-contain icon-tint-orange"
                width={48}
                height={48}
              />
            </div>
            <div className="rounded-2xl border-2 border-foreground/10 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">
                Your improved resume
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDocx}
                  className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
                >
                  Download as DOCX
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="rounded-xl border-2 border-foreground/20 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-foreground/5"
                >
                  Download as PDF
                </button>
                <a
                  href="/Resume_Template.pdf"
                  download="Resume_Template.pdf"
                  className="rounded-xl border-2 border-foreground/20 bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-foreground/5 no-underline"
                >
                  Resume Template
                </a>
              </div>
              <pre className="mt-6 max-h-[420px] overflow-y-auto rounded-xl bg-foreground/[0.04] p-5 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {data.rewritten_resume}
              </pre>
            </div>
          </section>
        )}

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[var(--accent)] font-medium hover:underline"
          >
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
