import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  buildUserContent,
  parseAnalysisResult,
  type ResumeAnalysisResult,
} from "./llm-shared";

function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

export async function analyzeWithClaude(
  resumeText: string,
  jobRole: string,
  experienceLevel?: string
): Promise<ResumeAnalysisResult> {
  const userContent = buildUserContent(resumeText, jobRole, experienceLevel);
  const client = getAnthropic();
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const block = message.content.find((b) => b.type === "text");
  const raw = block && "text" in block ? block.text : "";
  if (!raw) throw new Error("No text in Claude response");
  return parseAnalysisResult(raw);
}
