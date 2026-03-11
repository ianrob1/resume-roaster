import { Resend } from "resend";
import type { BulletImprovement } from "./airtable";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendResumeRoastEmail({
  to,
  atsScore,
  resultsLink,
  roastText,
  bulletImprovements,
  missingKeywords,
  rewrittenResume,
  jobRole,
}: {
  to: string;
  atsScore: number;
  resultsLink: string;
  roastText?: string;
  bulletImprovements?: BulletImprovement[];
  missingKeywords?: string[];
  rewrittenResume?: string;
  jobRole?: string;
}) {
  const from = process.env.EMAIL_FROM ?? "Resume Roast <onboarding@resend.dev>";
  const resend = getResend();

  const roleHeading = jobRole ? ` for ${escapeHtml(jobRole)}` : "";

  const sections: string[] = [
    `<p style="font-size:18px;margin:0 0 8px 0;"><strong>ATS Score: ${atsScore} / 100</strong></p>`,
  ];

  if (roastText?.trim()) {
    sections.push(
      `<h2 style="font-size:16px;margin:16px 0 8px 0;color:#333;">The Roast</h2>`,
      `<p style="margin:0 0 16px 0;line-height:1.5;color:#444;">${escapeHtml(roastText).replace(/\n/g, "<br>")}</p>`
    );
  }

  if (bulletImprovements?.length) {
    sections.push(
      `<h2 style="font-size:16px;margin:16px 0 8px 0;color:#333;">Bullet improvements</h2>`,
      `<ul style="margin:0 0 16px 0;padding-left:20px;">`,
      ...bulletImprovements.slice(0, 10).map(
        (b) =>
          `<li style="margin:8px 0;line-height:1.4;"><strong>Before:</strong> ${escapeHtml(b.before)}<br><strong>After:</strong> ${escapeHtml(b.after)}</li>`
      ),
      `</ul>`,
      bulletImprovements.length > 10
        ? `<p style="margin:0 0 16px 0;font-size:14px;color:#666;">… and ${bulletImprovements.length - 10} more. <a href="${resultsLink}">View full report</a></p>`
        : ""
    );
  }

  if (missingKeywords?.length) {
    sections.push(
      `<h2 style="font-size:16px;margin:16px 0 8px 0;color:#333;">Missing keywords${roleHeading}</h2>`,
      `<p style="margin:0 0 16px 0;">${escapeHtml(missingKeywords.slice(0, 15).join(", "))}${missingKeywords.length > 15 ? "…" : ""}</p>`
    );
  }

  if (rewrittenResume?.trim()) {
    const preview = rewrittenResume.slice(0, 1500);
    const truncated = rewrittenResume.length > 1500;
    sections.push(
      `<h2 style="font-size:16px;margin:16px 0 8px 0;color:#333;">Improved resume</h2>`,
      `<pre style="margin:0 0 16px 0;white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.4;color:#444;background:#f5f5f5;padding:12px;border-radius:6px;">${escapeHtml(preview)}${truncated ? "\n\n…" : ""}</pre>`,
      truncated
        ? `<p style="margin:0 0 16px 0;"><a href="${resultsLink}">View and download full improved resume</a></p>`
        : ""
    );
  }

  sections.push(
    `<p style="margin:20px 0 0 0;padding-top:16px;border-top:1px solid #eee;"><a href="${resultsLink}" style="color:#0066cc;">View full report online</a></p>`
  );

  const html = `
    <div style="max-width:600px;font-family:sans-serif;color:#222;">
      <p>Your resume roast is ready.</p>
      ${sections.join("")}
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Your Resume Roast Is Ready 🔥",
    html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
  return data;
}
