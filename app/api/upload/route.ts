import { NextResponse } from "next/server";
import { z } from "zod";
import { createResumeRecord } from "@/lib/airtable";
import { extractResumeText } from "@/lib/resume-parser";

export const runtime = "nodejs";

const uploadSchema = z.object({
  resume_file: z.string().url(),
  experience_level: z.string().min(1, "Experience level is required"),
  job_role: z.string().optional(),
  email: z.string().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: "Invalid email" }).optional(),
});

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Upload failed";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const firstMessage =
        (flat.fieldErrors.email?.[0] as string) ??
        (flat.fieldErrors.experience_level?.[0] as string) ??
        (flat.fieldErrors.resume_file?.[0] as string) ??
        "Invalid input";
      return NextResponse.json(
        { error: firstMessage, details: flat },
        { status: 400 }
      );
    }
    const { resume_file, experience_level, job_role, email } = parsed.data;

    let raw_text: string;
    try {
      raw_text = await extractResumeText(resume_file);
    } catch (err) {
      console.error("Resume text extraction error:", err);
      return NextResponse.json(
        { error: `Text extraction failed: ${getErrorMessage(err)}` },
        { status: 500 }
      );
    }
    if (!raw_text || raw_text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from resume. Ensure the file is a valid PDF or DOCX." },
        { status: 400 }
      );
    }

    let record: { id: string };
    try {
      record = await createResumeRecord({
        email: email?.trim() ?? "",
        resume_file,
        job_role: job_role?.trim() || "Other",
        experience_level: experience_level.trim(),
        raw_text,
      });
    } catch (err) {
      console.error("Airtable create error:", err);
      return NextResponse.json(
        { error: `Database error: ${getErrorMessage(err)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ recordId: record.id });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
