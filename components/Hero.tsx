"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";
import { ATSInfoButtonLight } from "@/components/ATSInfoButton";
import { FormSelect } from "@/components/FormSelect";

const DEFAULT_JOB_ROLES = [
  "Finance",
  "Marketing",
  "Other",
  "Product Manager",
  "Sales",
  "Software Engineer",
].sort((a, b) => a.localeCompare(b));

const EXPERIENCE_LEVEL_ORDER = ["Internship", "Entry", "Intermediate", "Senior"];
const DEFAULT_EXPERIENCE_LEVELS = [...EXPERIENCE_LEVEL_ORDER];

export function Hero() {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [roastLoading, setRoastLoading] = useState(false);
  const [roastError, setRoastError] = useState<string | null>(null);
  const [roastSubmitted, setRoastSubmitted] = useState(false);
  const [jobRoles, setJobRoles] = useState<string[]>(DEFAULT_JOB_ROLES);
  const [experienceLevels, setExperienceLevels] = useState<string[]>(DEFAULT_EXPERIENCE_LEVELS);
  const [formExiting, setFormExiting] = useState(false);
  const [priceTilt, setPriceTilt] = useState({ x: 0, y: 0 });
  const priceRef = useRef<HTMLDivElement>(null);

  const MAX_TILT = 14;
  const onPriceMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = priceRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      setPriceTilt({
        x: Math.max(-1, Math.min(1, x)) * -MAX_TILT,
        y: Math.max(-1, Math.min(1, y)) * MAX_TILT,
      });
    },
    []
  );
  const onPriceMouseLeave = useCallback(() => setPriceTilt({ x: 0, y: 0 }), []);

  useEffect(() => {
    fetch("/api/options")
      .then((res) => res.json())
      .then((data: { job_roles?: string[]; experience_levels?: string[] }) => {
        if (Array.isArray(data.job_roles) && data.job_roles.length) setJobRoles([...data.job_roles].sort((a, b) => a.localeCompare(b)));
        if (Array.isArray(data.experience_levels) && data.experience_levels.length) {
          const order = EXPERIENCE_LEVEL_ORDER;
          setExperienceLevels(
            [...data.experience_levels].sort((a, b) => {
              const i = order.indexOf(a);
              const j = order.indexOf(b);
              if (i === -1 && j === -1) return a.localeCompare(b);
              if (i === -1) return 1;
              if (j === -1) return -1;
              return i - j;
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!roastError) return;
    const t = setTimeout(() => setRoastError(null), 2000);
    return () => clearTimeout(t);
  }, [roastError]);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-0 pb-16 sm:pb-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="text-center md:text-left">
          <div className="text-left">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Your resume probably <span className="font-marker text-5xl sm:text-6xl" style={{ fontFamily: '"Knewave", cursive' }}><span className="text-[#e2672f]">sucks</span><span className="text-foreground">!</span></span>
            </h1>
            <p className="mt-6 text-lg text-foreground/80 max-w-lg">
              Get more interviews. Upload your resume and get an ATS score, brutal feedback, and a full rewrite in 60 seconds.
            </p>
            <div className="mt-4 flex items-center">
              <div
                ref={priceRef}
                className="mr-2 shrink-0 origin-center"
                style={{ perspective: "600px" }}
                onMouseMove={onPriceMouseMove}
                onMouseLeave={onPriceMouseLeave}
              >
                <div
                  className="flex scale-90 flex-col items-center justify-center rounded-md border border-foreground/25 px-4 py-2 text-white transition-transform duration-200 ease-out max-sm:scale-85 max-sm:px-3 max-sm:py-1.5"
                  style={{
                    background: "linear-gradient(165deg, #f08d4a 0%, #e87b35 35%, #d96d2b 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08)",
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${priceTilt.y}deg) rotateY(${priceTilt.x}deg)`,
                  }}
                >
                  <p className="text-3xl font-bold leading-tight tracking-tight max-sm:text-2xl" style={{ textShadow: "0 0 8px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.3)" }}>$19</p>
                  <p className="mt-0.5 text-[8px] font-medium uppercase tracking-wider opacity-90 max-sm:text-[7px]" style={{ textShadow: "0 0 4px rgba(0,0,0,0.2), 0 1px 1px rgba(0,0,0,0.25)" }}>One-time</p>
                </div>
              </div>
              <div className="flex min-w-0 items-center self-stretch border-l-2 border-foreground/50 pl-4 max-sm:min-h-0 max-sm:pl-2 sm:min-h-[2.75rem]">
                <p className="text-base text-foreground/80 max-sm:text-xs">Stands between you and your next interview.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-5 flex flex-col items-center md:items-stretch">
            <div
              className={`flex w-full max-w-xl md:max-w-none rounded-box border-2 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden h-12 transition-colors ${fileUrl ? "cursor-default border-solid border-[#e87b35]" : "cursor-pointer border-dashed border-foreground/25 hover:border-[#e87b35]"}`}
            >
              <div className="flex-1 min-w-0 flex rounded-l-xl rounded-r-xl overflow-hidden [&_[data-ut-element]]:!mt-0 [&_[data-ut-element=allowed-content]]:!hidden [&_[data-ut-element=button]]:!hidden [&_[data-ut-element=upload-icon]]:!hidden [&_[data-ut-element]]:!cursor-pointer">
                {!fileUrl ? (
                  <UploadDropzone
                    endpoint="resumeUploader"
                    config={{ mode: "auto" }}
                    className="!m-0 !flex !h-full !min-h-full !w-full !flex-row !items-center !justify-center !rounded-xl !border-0 !bg-transparent !px-4 !py-0 !shadow-none !transition-colors"
                    appearance={{
                      container: ({ isDragActive }) =>
                        `!m-0 !flex !h-full !min-h-full !w-full !flex-row !items-center !justify-center !rounded-xl !border-0 !bg-transparent !px-4 !py-0 !shadow-none !transition-colors ${uploadError ? "!border-red-400 !bg-red-50/80" : ""} ${isDragActive && !uploadError ? "!border-[#e87b35] !bg-[#e87b35]/5" : ""}`,
                      uploadIcon: "!hidden",
                      label: "!m-0 !w-auto !text-sm",
                    }}
                    content={{
                      label: ({ isUploading }) =>
                        uploadError ? (
                          <span className="text-red-600 font-medium">
                            {uploadError}
                          </span>
                        ) : isUploading ? (
                          <span className="flex items-center gap-2 text-sm text-foreground/70">
                            <span className="size-4 animate-spin rounded-full border-2 border-foreground/25 border-t-[#e87b35]" aria-hidden />
                            Uploading…
                          </span>
                        ) : (
                          <span className="text-gray-500">Drag or click to upload your resume</span>
                        ),
                      allowedContent: () => null,
                    }}
                    onDrop={() => setUploadError(null)}
                    onClientUploadComplete={(res) => {
                      setUploadError(null);
                      if (res?.[0]?.url) {
                        setFileUrl(res[0].url);
                        setFileName(res[0].name ?? null);
                      }
                    }}
                    onUploadError={(err) => {
                      const msg = err.message ?? "";
                      const isFileType =
                        /file type|invalid type|not allowed|unsupported|\.pdf|\.doc/i.test(msg) ||
                        msg.toLowerCase().includes("type");
                      setUploadError(
                        isFileType
                          ? "Please upload a PDF or Word document (.pdf, .doc or .docx)."
                          : msg || "Upload failed. Please try again."
                      );
                    }}
                  />
                ) : (
                  <div className="flex items-center w-full px-4 h-12 bg-white">
                    <span className="truncate text-sm text-foreground pointer-events-none select-none" title={fileName ?? undefined}>{fileName ?? "File uploaded"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormExiting(true);
                        setUploadError(null);
                        setTimeout(() => {
                          setFileUrl(null);
                          setFileName(null);
                          setJobDescription("");
                          setEmail("");
                          setRoastSubmitted(false);
                          setRoastError(null);
                          setFormExiting(false);
                        }, 120);
                      }}
                      className="ml-2 text-sm text-[var(--accent)] hover:underline shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(fileUrl && !roastSubmitted) || formExiting ? (
              <div className={`mt-4 space-y-4 w-full max-w-xl md:max-w-none mx-auto md:mx-0 max-sm:px-4 text-left ${formExiting ? "upload-form-exit pointer-events-none" : "upload-form-enter"}`}>
                <div className="grid gap-4 sm:grid-cols-2 text-left">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="hero-job-role" className="block text-sm font-medium text-foreground text-left max-sm:pl-0 md:pl-4">
                      Target role
                    </label>
                    <FormSelect
                      id="hero-job-role"
                      value={jobRole}
                      onChange={setJobRole}
                      options={jobRoles}
                      placeholder="Select role"
                      aria-label="Target role"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="hero-experience" className="block text-sm font-medium text-foreground text-left max-sm:pl-0 md:pl-4">
                      Experience level
                    </label>
                    <FormSelect
                      id="hero-experience"
                      value={experienceLevel}
                      onChange={setExperienceLevel}
                      options={experienceLevels}
                      placeholder="Select level"
                      aria-label="Experience level"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-col gap-0.5 max-sm:pl-0 max-sm:pr-0 md:pl-4 md:pr-0 md:flex-row md:items-start md:justify-between md:gap-2">
                    <label htmlFor="hero-job-description" className="text-sm font-medium text-foreground shrink-0">
                      Job description
                    </label>
                    <span className="text-[10px] text-gray-500 max-sm:order-2 max-sm:whitespace-normal md:mt-1.5 md:whitespace-nowrap md:text-right">
                      Don&apos;t have a job description? No worries — just leave it blank.
                    </span>
                  </div>
                  <textarea
                    id="hero-job-description"
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      if (roastError) setRoastError(null);
                    }}
                    placeholder="Paste the job description here to tailor feedback and keywords to this role…"
                    rows={4}
                    className="w-full max-w-xl md:max-w-none mx-auto md:mx-0 rounded-box border-2 border-foreground/15 bg-white px-4 py-3 text-sm text-foreground shadow-sm transition placeholder:text-foreground/40 focus:outline-none focus:border-[#e87b35] focus:ring-2 focus:ring-[#e87b35]/25 focus:shadow-md focus:shadow-[#e87b35]/10 resize-y min-h-[4.5rem] hover:border-foreground/25"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-col gap-0.5 max-sm:pl-0 max-sm:pr-0 md:pl-4 md:pr-0 md:flex-row md:items-start md:justify-between md:gap-2">
                    <label htmlFor="hero-email" className="text-sm font-medium text-foreground shrink-0">
                      Email
                    </label>
                    <span className="text-[10px] text-gray-500 max-sm:order-2 max-sm:whitespace-normal md:mt-1.5 md:whitespace-nowrap md:text-right">
                      A copy of your results will be sent to this email. Make sure it&apos;s correct.
                    </span>
                  </div>
                  <input
                    id="hero-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (roastError) setRoastError(null);
                    }}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-box border-2 border-foreground/15 bg-white px-4 py-3 text-sm text-foreground shadow-sm transition placeholder:text-foreground/40 focus:outline-none focus:border-[#e87b35] focus:ring-2 focus:ring-[#e87b35]/25 focus:shadow-md focus:shadow-[#e87b35]/10 hover:border-foreground/25"
                  />
                </div>
                <button
                  type="button"
                  disabled={!experienceLevel || !email.trim() || roastLoading || formExiting}
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
                          job_description: jobDescription.trim() || undefined,
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
                  className={`w-full max-w-xl md:max-w-none mx-auto md:mx-0 rounded-box py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${roastError ? "bg-red-500 text-white hover:bg-red-600" : "bg-[#e87b35] text-white hover:bg-[#d96d2b]"}`}
                >
                  {roastLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                      Submitting…
                    </span>
                  ) : roastError ? roastError : "Roast your resume"}
                </button>
              </div>
            ) : null}

            {fileUrl && roastSubmitted && (
              <p className="mt-4 text-sm font-medium text-foreground/80">We&apos;re roasting your resume. Check back soon.</p>
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
                <p className="min-h-[2rem] text-2xl font-bold leading-tight text-foreground">~15.2k</p>
                <p className="mt-0.5 text-sm text-foreground/70">Resumes roasted</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="flex min-h-[2rem] items-center justify-center leading-tight text-foreground" aria-hidden>
                  <span className="text-lg font-bold">★★★★</span>
                  <span className="relative inline-block text-lg font-bold">
                    <span className="text-foreground/30">☆</span>
                    <span className="absolute left-0 top-0 w-1/2 overflow-hidden text-foreground">★</span>
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-foreground/70">4.5 Average user rating</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-gray-500 md:text-left">Resume Roaster users report a measurable increase in interview callbacks.</p>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg animate-slide-in-right">
            <Image
              src="/hero-schematic.jpg"
              alt="Resume Roaster — upload, get roasted, get results"
              width={800}
              height={500}
              className="w-full h-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
