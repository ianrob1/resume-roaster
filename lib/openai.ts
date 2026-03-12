import OpenAI from "openai";
import {
  SYSTEM_PROMPT,
  buildUserContent,
  parseAnalysisResult,
  type ResumeAnalysisResult,
} from "./llm-shared";

export type { ResumeAnalysisResult };

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

export async function analyzeWithOpenAI(
  resumeText: string,
  jobRole: string,
  experienceLevel?: string,
  jobDescription?: string
): Promise<ResumeAnalysisResult> {
  const userContent = buildUserContent(resumeText, jobRole, experienceLevel, jobDescription);
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from OpenAI");
  return parseAnalysisResult(raw);
}
