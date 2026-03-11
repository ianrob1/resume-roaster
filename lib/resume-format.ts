/**
 * Parses plain-text resume content into a structure that matches the reference format:
 * Name, contact line, then sections with ALL CAPS headers and body/bullets.
 * Used by both DOCX and PDF export to produce consistent, professional formatting.
 */

export interface ResumeSection {
  title: string;
  /** Body lines (company + location, role + date, or paragraph text) */
  lines: string[];
  /** Bullet points (strip "- " or "• " prefix when parsing) */
  bullets: string[];
}

export interface ParsedResume {
  name: string;
  contact: string | null;
  sections: ResumeSection[];
}

const BULLET_PREFIXES = /^[\s]*[-•·]\s+/;
const ALL_CAPS_MIN_LEN = 2;
const ALL_CAPS_MAX_LEN = 80;

function isSectionHeader(line: string): boolean {
  const t = line.trim();
  if (t.length < ALL_CAPS_MIN_LEN || t.length > ALL_CAPS_MAX_LEN) return false;
  if (/^\d+$/.test(t)) return false; // pure numbers
  const letters = t.replace(/\s/g, "");
  if (!letters.length) return false;
  return letters === letters.toUpperCase();
}

function isContactLine(line: string): boolean {
  return /\d{3}[\s\-)]*\d{3}[\s\-]*\d{4}/.test(line) || line.includes("@");
}

function isBullet(line: string): boolean {
  return BULLET_PREFIXES.test(line) || /^[\s]*[-•·]\s/.test(line);
}

function stripBullet(line: string): string {
  return line.replace(BULLET_PREFIXES, "").trim();
}

/**
 * Parse raw resume text into name, contact, and sections (with titles, lines, bullets).
 */
export function parseResumeContent(content: string): ParsedResume {
  const lines = content.split(/\n/).map((l) => l.trimEnd());
  const result: ParsedResume = {
    name: "",
    contact: null,
    sections: [],
  };

  let i = 0;
  while (i < lines.length && !lines[i]) i++;
  if (i >= lines.length) return result;

  result.name = lines[i] ?? "";
  i++;

  if (i < lines.length && isContactLine(lines[i] ?? "")) {
    result.contact = lines[i] ?? null;
    i++;
  }
  while (i < lines.length && !lines[i]) i++;

  let currentSection: ResumeSection | null = null;
  const flushSection = () => {
    if (currentSection && (currentSection.lines.length > 0 || currentSection.bullets.length > 0)) {
      result.sections.push(currentSection);
    }
    currentSection = null;
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line) {
      i++;
      continue;
    }
    if (isSectionHeader(line)) {
      flushSection();
      currentSection = { title: line.trim(), lines: [], bullets: [] };
      i++;
      continue;
    }
    if (isBullet(line)) {
      if (!currentSection) {
        currentSection = { title: "", lines: [], bullets: [] };
      }
      currentSection.bullets.push(stripBullet(line));
      i++;
      continue;
    }
    if (currentSection) {
      currentSection.lines.push(line);
    } else {
      flushSection();
      currentSection = { title: "", lines: [line], bullets: [] };
    }
    i++;
  }
  flushSection();

  return result;
}
