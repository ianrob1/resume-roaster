import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const RESUME_MAX = { maxFileSize: "4MB", maxFileCount: 1 } as const;

export const ourFileRouter = {
  resumeUploader: f({
    pdf: RESUME_MAX,
    "application/msword": RESUME_MAX, // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": RESUME_MAX, // .docx
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url, name: file.name };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
