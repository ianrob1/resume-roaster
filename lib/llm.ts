import { analyzeWithClaude } from "./claude";
import { analyzeWithGemini } from "./gemini";
import { analyzeWithOpenAI } from "./openai";
import type { ResumeAnalysisResult } from "./llm-shared";

export type { ResumeAnalysisResult };

/**
 * Run resume analysis using the first available provider in order:
 * OpenAI → Claude → Gemini. Only attempts a provider if its API key is set.
 */
export async function analyzeResume(
  resumeText: string,
  jobRole: string,
  experienceLevel?: string
): Promise<ResumeAnalysisResult> {
  const args = [resumeText, jobRole, experienceLevel] as const;
  let lastError: unknown;

  if (process.env.OPENAI_API_KEY) {
    try {
      return await analyzeWithOpenAI(...args);
    } catch (e) {
      lastError = e;
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await analyzeWithClaude(...args);
    } catch (e) {
      lastError = e;
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(...args);
    } catch (e) {
      lastError = e;
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : typeof lastError === "string"
        ? lastError
        : lastError != null && typeof (lastError as { message?: string }).message === "string"
          ? (lastError as { message: string }).message
          : "All providers failed";
  throw new Error(message);
}
