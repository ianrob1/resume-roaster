import { NextResponse } from "next/server";
import { z } from "zod";
import { getResumeRecord } from "@/lib/airtable";
import { runAnalysis } from "@/lib/analysis";
import { getFirstNameFromResumeText, sendResumeRoastEmail } from "@/lib/email";

const analyzeSchema = z.object({
  recordId: z.string().min(1),
  session_id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid recordId" }, { status: 400 });
    }
    const { recordId, session_id } = parsed.data;

    const result = await runAnalysis(recordId);
    const record = await getResumeRecord(recordId);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (session_id) {
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl) {
        try {
          const u = new URL(request.url);
          baseUrl = `${u.protocol}//${u.host}`;
        } catch {
          baseUrl = "http://localhost:3000";
        }
      }
      const resultsLink = `${baseUrl}/results?session_id=${encodeURIComponent(session_id)}`;
      await sendResumeRoastEmail({
        to: record.email,
        atsScore: result.ats_score,
        resultsLink,
        roastText: result.roast,
        bulletImprovements: result.bullet_improvements,
        missingKeywords: result.missing_keywords,
        rewrittenResume: result.rewritten_resume,
        jobRole: record.job_role,
        candidateFirstName: getFirstNameFromResumeText(record.raw_text),
      });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Analysis failed";
    console.error("Analyze error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
