import { GoogleGenAI } from "@google/genai";
import {
  SYSTEM_PROMPT,
  buildUserContent,
  parseAnalysisResult,
  type ResumeAnalysisResult,
} from "./llm-shared";

function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: key });
}

export async function analyzeWithGemini(
  resumeText: string,
  jobRole: string,
  experienceLevel?: string
): Promise<ResumeAnalysisResult> {
  const userContent = buildUserContent(resumeText, jobRole, experienceLevel);
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: userContent,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("No text in Gemini response");
  return parseAnalysisResult(raw);
}
