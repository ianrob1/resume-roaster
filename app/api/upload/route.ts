import { NextResponse } from "next/server";
import { z } from "zod";
import { createResumeRecord } from "@/lib/airtable";
import { extractResumeText } from "@/lib/resume-parser";
import type { JobRole, ExperienceLevel } from "@/lib/airtable";

export const runtime = "nodejs";

const uploadSchema = z.object({
  resume_file: z.string().url(),
  job_role: z.enum([
    "Software Engineer",
    "Product Manager",
    "Marketing",
    "Sales",
    "Finance",
    "Other",
  ]),
  experience_level: z.enum(["Entry", "Mid", "Senior"]),
  email: z.string().email(),
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
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { resume_file, job_role, experience_level, email } = parsed.data;

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
        email,
        resume_file,
        job_role: job_role as JobRole,
        experience_level: experience_level as ExperienceLevel,
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
