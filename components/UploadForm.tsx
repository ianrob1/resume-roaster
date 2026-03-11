"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";

const JOB_ROLES = [
  "Software Engineer",
  "Product Manager",
  "Marketing",
  "Sales",
  "Finance",
  "Other",
] as const;

const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior"] as const;

export function UploadForm() {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    fileUrl && jobRole && experienceLevel && email && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_file: fileUrl,
          job_role: jobRole,
          experience_level: experienceLevel,
          email: email.trim(),
        }),
      });
      const text = await res.text();
      let data: { recordId?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Upload response was not JSON:", text.slice(0, 200));
        throw new Error(res.ok ? "Invalid response from server" : `Upload failed (${res.status}). Check the terminal for errors.`);
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      const recordId = data.recordId ?? "";
      if (!recordId) throw new Error("No record ID returned");
      router.push(`/checkout?record_id=${encodeURIComponent(recordId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          Resume
        </label>
        {!fileUrl ? (
          <div className="[&_.uploadthing]:!rounded-xl">
            <UploadDropzone
              endpoint="resumeUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) {
                  setFileUrl(res[0].url);
                  setFileName(res[0].name ?? null);
                }
              }}
              onUploadError={(err) => setError(err.message)}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.02] px-4 py-3">
            <span className="truncate text-sm font-medium text-foreground" title={fileName ?? undefined}>
              {fileName ?? "File uploaded"}
            </span>
            <button
              type="button"
              onClick={() => {
                setFileUrl(null);
                setFileName(null);
              }}
              className="ml-3 shrink-0 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="job_role" className="block text-sm font-semibold text-foreground">
            Target role
          </label>
          <select
            id="job_role"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full rounded-xl border border-foreground/20 bg-white px-4 py-3 text-foreground focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            required
          >
            <option value="">Select role</option>
            {JOB_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="experience_level" className="block text-sm font-semibold text-foreground">
            Experience level
          </label>
          <select
            id="experience_level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full rounded-xl border border-foreground/20 bg-white px-4 py-3 text-foreground focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            required
          >
            <option value="">Select level</option>
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-foreground/20 bg-white px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          required
        />
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-[var(--accent)] py-3.5 text-base font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Uploading…" : "Continue to checkout — $19"}
      </button>
    </form>
  );
}
