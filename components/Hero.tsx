"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";
import { ATSInfoButtonLight } from "@/components/ATSInfoButton";

const JOB_ROLES = [
  "Software Engineer",
  "Product Manager",
  "Marketing",
  "Sales",
  "Finance",
  "Other",
] as const;

const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior"] as const;

export function Hero() {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [roastLoading, setRoastLoading] = useState(false);
  const [roastError, setRoastError] = useState<string | null>(null);
  const [roastSubmitted, setRoastSubmitted] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-0 pb-16 sm:pb-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your resume probably <span className="font-marker text-4xl sm:text-5xl" style={{ fontFamily: '"Knewave", cursive' }}><span className="text-[#e87b35]">sucks</span><span className="text-foreground">!</span></span>
          </h1>
          <p className="mt-6 text-lg text-foreground/80 max-w-lg md:max-w-lg mx-auto md:mx-0">
            Get an ATS score, brutal feedback, and a rewritten resume in 60 seconds with your own personal resume roast.
          </p>

          <div className="mt-8 space-y-5 flex flex-col items-center md:items-stretch">
            <div
              className={`flex w-full max-w-xl md:max-w-none rounded-xl border-2 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden h-12 transition-colors ${fileUrl ? "cursor-default border-solid border-[#e87b35]" : "cursor-pointer border-dashed border-foreground/25 hover:border-[#e87b35]"}`}
            >
              <div className="flex-1 min-w-0 flex rounded-l-xl rounded-r-xl overflow-hidden [&_[data-ut-element]]:!mt-0 [&_[data-ut-element=allowed-content]]:!hidden [&_[data-ut-element=button]]:!hidden [&_[data-ut-element=upload-icon]]:!hidden [&_[data-ut-element]]:!cursor-pointer">
                {!fileUrl ? (
                  <UploadDropzone
                    endpoint="resumeUploader"
                    config={{ mode: "auto" }}
                    className="!m-0 !flex !h-full !min-h-full !w-full !flex-row !items-center !justify-center !rounded-xl !border-0 !bg-transparent !px-4 !py-0 !shadow-none !transition-colors"
                    appearance={{
                      container: ({ isDragActive }) =>
                        `!m-0 !flex !h-full !min-h-full !w-full !flex-row !items-center !justify-center !rounded-xl !border-0 !bg-transparent !px-4 !py-0 !shadow-none !transition-colors ${isDragActive ? "!border-[#e87b35] !bg-[#e87b35]/5" : ""}`,
                      uploadIcon: "!hidden",
                      label: "!m-0 !w-auto !text-sm !text-gray-500",
                    }}
                    content={{
                      label: ({ isUploading }) =>
                        isUploading ? (
                          <span className="flex items-center gap-2 text-sm text-foreground/70">
                            <span className="size-4 animate-spin rounded-full border-2 border-foreground/25 border-t-[#e87b35]" aria-hidden />
                            Uploading…
                          </span>
                        ) : (
                          "Drag or click to upload your resume"
                        ),
                      allowedContent: () => null,
                    }}
                    onClientUploadComplete={(res) => {
                      if (res?.[0]?.url) {
                        setFileUrl(res[0].url);
                        setFileName(res[0].name ?? null);
                      }
                    }}
                    onUploadError={(err) => setError(err.message)}
                  />
                ) : (
                  <div className="flex items-center w-full px-4 h-12 bg-white">
                    <span className="truncate text-sm text-foreground pointer-events-none select-none" title={fileName ?? undefined}>{fileName ?? "File uploaded"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFileUrl(null);
                        setFileName(null);
                        setEmail("");
                        setRoastSubmitted(false);
                        setRoastError(null);
                      }}
                      className="ml-2 text-sm text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {fileUrl && !roastSubmitted && (
              <div className="mt-4 space-y-4 w-full max-w-xl md:max-w-none mx-auto md:mx-0 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="hero-job-role" className="block text-sm font-medium text-foreground">
                      Target role
                    </label>
                    <select
                      id="hero-job-role"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full rounded-xl border border-foreground/20 bg-white px-4 py-2.5 text-sm text-foreground focus:border-[#e87b35] focus:outline-none focus:ring-2 focus:ring-[#e87b35]/20"
                    >
                      <option value="">Select role</option>
                      {JOB_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="hero-experience" className="block text-sm font-medium text-foreground">
                      Experience level
                    </label>
                    <select
                      id="hero-experience"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full rounded-xl border border-foreground/20 bg-white px-4 py-2.5 text-sm text-foreground focus:border-[#e87b35] focus:outline-none focus:ring-2 focus:ring-[#e87b35]/20"
                    >
                      <option value="">Select level</option>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="hero-email" className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="hero-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-foreground/20 bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-[#e87b35] focus:outline-none focus:ring-2 focus:ring-[#e87b35]/20"
                  />
                </div>
                <button
                  type="button"
                  disabled={!experienceLevel || !email.trim() || roastLoading}
                  onClick={async () => {
                    if (!fileUrl || !experienceLevel || !email.trim()) return;
                    setRoastError(null);
                    setRoastLoading(true);
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          resume_file: fileUrl,
                          experience_level: experienceLevel,
                          job_role: jobRole || undefined,
                          email: email.trim(),
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
                      const recordId = data.recordId ?? "";
                      if (recordId) router.push(`/checkout?record_id=${encodeURIComponent(recordId)}`);
                      else setRoastSubmitted(true);
                    } catch (err) {
                      setRoastError(err instanceof Error ? err.message : "Something went wrong");
                    } finally {
                      setRoastLoading(false);
                    }
                  }}
                  className="w-full max-w-xl md:max-w-none mx-auto md:mx-0 rounded-xl bg-[#e87b35] py-3 text-base font-semibold text-white transition hover:bg-[#d96d2b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roastLoading ? "Submitting…" : "Roast your resume"}
                </button>
              </div>
            )}

            {fileUrl && roastSubmitted && (
              <p className="mt-4 text-sm font-medium text-foreground/80">We&apos;re roasting your resume. Check back soon.</p>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {roastError && (
              <p className="text-sm text-red-600">{roastError}</p>
            )}

            <div className="flex flex-wrap gap-8 pt-4 border-t border-foreground/10 justify-center md:justify-start">
              <div className="flex flex-col">
                <p className="min-h-[2rem] text-2xl font-bold leading-tight text-foreground">87.3%</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-foreground/70">
                  <span>Average ATS score</span>
                  <ATSInfoButtonLight />
                </p>
              </div>
              <div className="flex flex-col">
                <p className="min-h-[2rem] text-2xl font-bold leading-tight text-foreground">15.2k</p>
                <p className="mt-0.5 text-sm text-foreground/70">Resumes roasted</p>
              </div>
              <div className="flex flex-col">
                <p className="flex min-h-[2rem] items-center leading-tight text-foreground" aria-hidden>
                  <span className="text-lg font-bold">★★★★</span>
                  <span className="relative inline-block text-lg font-bold">
                    <span className="text-foreground/30">☆</span>
                    <span className="absolute left-0 top-0 w-1/2 overflow-hidden text-foreground">★</span>
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-foreground/70">4.5 Average user rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg">
            <img
              src="/hero-schematic.jpg"
              alt="Resume Roast — upload, get roasted, get results"
              className="w-full h-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
