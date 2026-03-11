import type { BulletImprovement, JobRole } from "./airtable";

export interface ResumeAnalysisResult {
  ats_score: number;
  roast: string;
  bullet_improvements: BulletImprovement[];
  missing_keywords: string[];
  rewritten_resume: string;
}

export const SYSTEM_PROMPT = `You are an expert recruiter and resume coach.
Analyze the following resume.
Generate:
1. ATS compatibility score from 0-100
2. A brutal but helpful roast of the resume
3. Improved bullet points (before/after pairs for weak bullets)
4. Missing keywords for the target role
5. A rewritten version of the resume

Return valid JSON only, no markdown or extra text, with this exact shape:
{
  "ats_score": number,
  "roast": "string",
  "bullet_improvements": [{"before": "string", "after": "string"}],
  "missing_keywords": ["string"],
  "rewritten_resume": "string"
}`;

export function buildUserContent(
  resumeText: string,
  jobRole: JobRole,
  experienceLevel?: string
): string {
  return `Resume Text:\n${resumeText}\n\nTarget Role: ${jobRole}${experienceLevel ? `\nExperience Level: ${experienceLevel}` : ""}`;
}

/** Strip markdown code fences if present, then parse and validate. */
export function parseAnalysisResult(raw: string): ResumeAnalysisResult {
  let text = raw.trim();
  const codeBlock = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/;
  const m = text.match(codeBlock);
  if (m) text = m[1].trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON from provider");
  }

  const p = parsed as Record<string, unknown>;
  const ats_score = typeof p.ats_score === "number" ? p.ats_score : Number(p.ats_score) || 0;
  const roast = typeof p.roast === "string" ? p.roast : "";
  const rewritten_resume = typeof p.rewritten_resume === "string" ? p.rewritten_resume : "";

  let bullet_improvements: BulletImprovement[] = [];
  if (Array.isArray(p.bullet_improvements)) {
    bullet_improvements = p.bullet_improvements
      .filter((x): x is Record<string, string> => typeof x === "object" && x !== null && "before" in x && "after" in x)
      .map((x) => ({ before: String(x.before ?? ""), after: String(x.after ?? "") }));
  }

  let missing_keywords: string[] = [];
  if (Array.isArray(p.missing_keywords)) {
    missing_keywords = p.missing_keywords.map((k) => String(k));
  }

  return {
    ats_score: Math.min(100, Math.max(0, ats_score)),
    roast,
    bullet_improvements,
    missing_keywords,
    rewritten_resume,
  };
}
