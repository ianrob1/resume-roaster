import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from "docx";
import { parseResumeContent } from "@/lib/resume-format";

const DEFAULT_FONT = "Calibri";
const NAME_SIZE = 28; // 14pt in half-points
const HEADING_SIZE = 24; // 12pt
const BODY_SIZE = 22; // 11pt
const BULLET_INDENT = convertInchesToTwip(0.25);
const SPACE_AFTER_SMALL = 80;
const SPACE_AFTER_NORMAL = 120;
const SPACE_AFTER_SECTION = 180;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content : "";
    if (!content.trim()) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const parsed = parseResumeContent(content);
    const children: Paragraph[] = [];

    // Name — large, bold
    if (parsed.name) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: parsed.name,
              bold: true,
              size: NAME_SIZE,
              font: DEFAULT_FONT,
            }),
          ],
          spacing: { after: SPACE_AFTER_SMALL },
        })
      );
    }

    // Contact line
    if (parsed.contact) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: parsed.contact,
              size: BODY_SIZE,
              font: DEFAULT_FONT,
            }),
          ],
          spacing: { after: SPACE_AFTER_NORMAL },
        })
      );
    }

    // Sections
    for (const section of parsed.sections) {
      if (section.title) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                size: HEADING_SIZE,
                font: DEFAULT_FONT,
                allCaps: true,
              }),
            ],
            spacing: { before: SPACE_AFTER_SECTION, after: SPACE_AFTER_SMALL },
          })
        );
      }
      for (const line of section.lines) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: line, size: BODY_SIZE, font: DEFAULT_FONT }),
            ],
            spacing: { after: SPACE_AFTER_SMALL },
          })
        );
      }
      for (const bullet of section.bullets) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `- ${bullet}`,
                size: BODY_SIZE,
                font: DEFAULT_FONT,
              }),
            ],
            indent: { left: BULLET_INDENT },
            spacing: { after: SPACE_AFTER_SMALL },
          })
        );
      }
    }

    const doc = new Document({
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="improved-resume.docx"',
      },
    });
  } catch (err) {
    console.error("Export resume error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}
