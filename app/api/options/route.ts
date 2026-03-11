import { NextResponse } from "next/server";

const DEFAULT_JOB_ROLES = [
  "Finance",
  "Marketing",
  "Other",
  "Product Manager",
  "Sales",
  "Software Engineer",
];

const EXPERIENCE_LEVEL_ORDER = ["Internship", "Entry", "Intermediate", "Senior"];
const DEFAULT_EXPERIENCE_LEVELS = [...EXPERIENCE_LEVEL_ORDER];

function sortExperienceLevels(levels: string[]): string[] {
  return [...levels].sort((a, b) => {
    const i = EXPERIENCE_LEVEL_ORDER.indexOf(a);
    const j = EXPERIENCE_LEVEL_ORDER.indexOf(b);
    if (i === -1 && j === -1) return a.localeCompare(b);
    if (i === -1) return 1;
    if (j === -1) return -1;
    return i - j;
  });
}

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableName = process.env.AIRTABLE_TABLE_NAME || "resumes";

  if (!baseId || !apiKey) {
    return NextResponse.json({
      job_roles: DEFAULT_JOB_ROLES,
      experience_levels: DEFAULT_EXPERIENCE_LEVELS,
    });
  }

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.warn("Airtable meta fetch failed:", res.status, err);
      return NextResponse.json({
        job_roles: DEFAULT_JOB_ROLES,
        experience_levels: DEFAULT_EXPERIENCE_LEVELS,
      });
    }
    const data = (await res.json()) as {
      tables?: Array<{
        name?: string;
        id?: string;
        fields?: Array<{
          name?: string;
          type?: string;
          options?: { choices?: Array<{ name?: string }> };
        }>;
      }>;
    };

    let job_roles = DEFAULT_JOB_ROLES;
    let experience_levels = DEFAULT_EXPERIENCE_LEVELS;

    const table = data.tables?.find(
      (t) =>
        t.name?.toLowerCase() === tableName.toLowerCase() ||
        t.id === tableName
    );
    if (table?.fields) {
      for (const field of table.fields) {
        const choices = field.options?.choices?.map((c) => c.name).filter(Boolean) as string[] | undefined;
        if (!choices?.length) continue;
        const name = field.name?.toLowerCase().replace(/\s/g, "_") ?? "";
        if (name === "job_role") {
          job_roles = [...choices].sort((a, b) => a.localeCompare(b));
        } else if (name === "experience_level") {
          experience_levels = sortExperienceLevels(choices);
        }
      }
    }

    return NextResponse.json({
      job_roles: [...job_roles].sort((a, b) => a.localeCompare(b)),
      experience_levels,
    });
  } catch (err) {
    console.warn("Options fetch error:", err);
    return NextResponse.json({
      job_roles: DEFAULT_JOB_ROLES,
      experience_levels: DEFAULT_EXPERIENCE_LEVELS,
    });
  }
}
