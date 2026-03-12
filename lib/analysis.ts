import { getResumeRecord, updateResumeRecord } from "@/lib/airtable";
import { analyzeResume, type ResumeAnalysisResult } from "@/lib/llm";

export async function runAnalysis(recordId: string): Promise<ResumeAnalysisResult> {
  const record = await getResumeRecord(recordId);
  if (!record) {
    throw new Error("Record not found");
  }
  if (record.status === "completed") {
    throw new Error("Record already processed");
  }

  if (!record.raw_text?.trim()) {
    throw new Error("Resume text is missing. Re-upload the resume and try again.");
  }

  await updateResumeRecord(recordId, { status: "processing" });

  let result: ResumeAnalysisResult;
  try {
    result = await analyzeResume(
      record.raw_text,
      record.job_role,
      record.experience_level,
      record.job_description
    );
  } catch (err) {
    await updateResumeRecord(recordId, { status: "uploaded" });
    throw err;
  }

  await updateResumeRecord(recordId, {
    status: "completed",
    ats_score: result.ats_score,
    roast_text: result.roast,
    bullet_improvements: result.bullet_improvements,
    missing_keywords: result.missing_keywords,
    rewritten_resume: result.rewritten_resume,
  });

  return result;
}
