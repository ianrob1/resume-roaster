/**
 * Client-safe type for the upload router.
 * Do not import from app/api/uploadthing/core here — it pulls in server-only code and breaks the client bundle.
 */
export type OurFileRouter = {
  resumeUploader: Record<string, unknown>;
};
