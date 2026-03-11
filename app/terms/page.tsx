import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Terms and Conditions — Resume Roaster",
  description: "Terms and conditions for using Resume Roaster.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-foreground/60">Last updated: {new Date().toLocaleDateString("en-US")}</p>
        <div className="mt-8 space-y-6 text-foreground/80">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By using Resume Roaster (&quot;the Service&quot;), you agree to these Terms and Conditions. If you do not agree, please do not use the Service.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Use of the Service</h2>
            <p>
              You may use the Service to upload your resume and receive feedback, an ATS score, and rewritten content. You are responsible for the accuracy of information you provide and for how you use the results.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Intellectual Property</h2>
            <p>
              Resume Roaster and its content are owned by us. You retain ownership of your resume and any content you upload. By using the Service, you grant us a limited license to process your content to provide the Service.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Disclaimer</h2>
            <p>
              The Service provides AI-generated feedback and suggestions for informational purposes. We do not guarantee job offers, ATS compatibility outcomes, or the accuracy of suggestions. Use the results at your own discretion.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Contact</h2>
            <p>
              For questions about these terms, please contact us through the channels provided on the main site.
            </p>
          </section>
        </div>
        <p className="mt-10">
          <Link href="/" className="text-[#e87b35] underline hover:no-underline">
            ← Back to home
          </Link>
        </p>
      </div>
      <footer className="border-t border-foreground/10 py-8 text-center text-sm text-foreground/60">
        <p>Resume Roaster. All rights reserved.</p>
      </footer>
    </main>
  );
}
