import { Header } from "@/components/Header";
import { UploadForm } from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get your resume roasted
          </h1>
          <p className="mt-3 text-lg text-foreground/70 max-w-lg mx-auto">
            Drop your resume, tell us your target role, and we&apos;ll send back an ATS score, brutal feedback, and a rewritten version — $19.
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm sm:p-8">
          <UploadForm />
        </div>
        <p className="mt-4 text-center text-sm text-foreground/50">
          PDF or DOCX, max 4MB. Secure checkout after upload.
        </p>
      </div>
    </main>
  );
}
