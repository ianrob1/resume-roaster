const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "resumes";
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

export type JobRole =
  | "Software Engineer"
  | "Product Manager"
  | "Marketing"
  | "Sales"
  | "Finance"
  | "Other";

export type ExperienceLevel = "Entry" | "Mid" | "Senior";

export type ResumeStatus = "uploaded" | "processing" | "completed";

export interface BulletImprovement {
  before: string;
  after: string;
}

export interface ResumeRecord {
  id: string;
  email: string;
  resume_file: string;
  job_role: string;
  job_description?: string;
  experience_level: string;
  raw_text: string;
  ats_score?: number;
  roast_text?: string;
  bullet_improvements?: BulletImprovement[];
  missing_keywords?: string[];
  rewritten_resume?: string;
  status: ResumeStatus;
  created_at: string;
}

interface AirtableRecord<T> {
  id: string;
  createdTime?: string;
  fields: T;
}

interface AirtableFields {
  email?: string;
  resume_file?: string;
  job_role?: string;
  job_description?: string;
  experience_level?: string;
  raw_text?: string;
  ats_score?: number;
  roast_text?: string;
  bullet_improvements?: string;
  missing_keywords?: string;
  rewritten_resume?: string;
  status?: string;
  created_at?: string;
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function mapFromAirtable(record: AirtableRecord<AirtableFields>): ResumeRecord {
  const f = record.fields;
  let bullet_improvements: BulletImprovement[] = [];
  if (typeof f.bullet_improvements === "string") {
    try {
      bullet_improvements = JSON.parse(f.bullet_improvements) as BulletImprovement[];
    } catch {
      // ignore
    }
  }
  let missing_keywords: string[] = [];
  if (typeof f.missing_keywords === "string") {
    try {
      missing_keywords = JSON.parse(f.missing_keywords) as string[];
    } catch {
      // ignore
    }
  }
  return {
    id: record.id,
    email: f.email ?? "",
    resume_file: f.resume_file ?? "",
    job_role: (f.job_role as string) ?? "Other",
    job_description: (f.job_description as string) ?? "",
    experience_level: (f.experience_level as string) ?? "Mid",
    raw_text: f.raw_text ?? "",
    ats_score: f.ats_score,
    roast_text: f.roast_text,
    bullet_improvements,
    missing_keywords,
    rewritten_resume: f.rewritten_resume,
    status: (f.status as ResumeStatus) ?? "uploaded",
    created_at: f.created_at ?? record.createdTime ?? new Date().toISOString(),
  };
}

export async function createResumeRecord(fields: {
  email: string;
  resume_file: string;
  job_role: string;
  job_description?: string;
  experience_level: string;
  raw_text: string;
}): Promise<ResumeRecord> {
  const { job_description, ...rest } = fields;
  const bodyFields: Record<string, unknown> = { ...rest, status: "uploaded" };
  if (job_description != null && job_description !== "") {
    bodyFields.job_description = job_description;
  }
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      fields: bodyFields,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable create failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as AirtableRecord<AirtableFields>;
  return mapFromAirtable(data);
}

export async function getResumeRecord(recordId: string): Promise<ResumeRecord | null> {
  const res = await fetch(`${BASE_URL}/${recordId}`, {
    headers: headers(),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable get failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as AirtableRecord<AirtableFields>;
  return mapFromAirtable(data);
}

export async function updateResumeRecord(
  recordId: string,
  fields: Partial<{
    status: ResumeStatus;
    raw_text: string;
    ats_score: number;
    roast_text: string;
    bullet_improvements: BulletImprovement[];
    missing_keywords: string[];
    rewritten_resume: string;
  }>
): Promise<ResumeRecord> {
  const body: { bullet_improvements?: string; missing_keywords?: string } & Record<string, unknown> = {};
  if (fields.bullet_improvements !== undefined) {
    body.bullet_improvements = JSON.stringify(fields.bullet_improvements);
  }
  if (fields.missing_keywords !== undefined) {
    body.missing_keywords = JSON.stringify(fields.missing_keywords);
  }
  Object.assign(body, {
    status: fields.status,
    raw_text: fields.raw_text,
    ats_score: fields.ats_score,
    roast_text: fields.roast_text,
    rewritten_resume: fields.rewritten_resume,
  });
  const cleanFields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) cleanFields[k] = v;
  }
  const res = await fetch(`${BASE_URL}/${recordId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields: cleanFields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable update failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as AirtableRecord<AirtableFields>;
  return mapFromAirtable(data);
}
