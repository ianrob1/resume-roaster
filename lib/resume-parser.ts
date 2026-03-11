import mammoth from "mammoth";

export async function extractResumeText(
  fileUrl: string,
  mimeType?: string
): Promise<string> {
  const res = await fetch(fileUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status}`);
  }
  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const type = mimeType?.toLowerCase() ?? contentType;
  const urlLower = fileUrl.toLowerCase();
  const isPdf =
    type.includes("pdf") ||
    urlLower.endsWith(".pdf") ||
    contentType.includes("pdf");
  const isDocx =
    type.includes("wordprocessingml") ||
    type.includes("docx") ||
    type.includes("msword") ||
    urlLower.endsWith(".docx") ||
    urlLower.endsWith(".doc") ||
    contentType.includes("wordprocessingml") ||
    contentType.includes("vnd.openxmlformats");

  if (isPdf) {
    return extractPdfText(buffer);
  }
  if (isDocx) {
    return extractDocxText(buffer);
  }
  if (buffer.length >= 5 && buffer.toString("ascii", 0, 4) === "%PDF") {
    return extractPdfText(buffer);
  }
  if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
    return extractDocxText(buffer);
  }
  throw new Error("Unsupported file type. Use PDF or DOCX.");
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const mod = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = typeof mod.default === "function" ? mod.default : mod;
  const data = await pdfParse(buffer);
  return data?.text ?? "";
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}
