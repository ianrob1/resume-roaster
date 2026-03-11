import Link from "next/link";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

const iconClass = "size-10 text-[var(--accent)]";

const features = [
  {
    title: "ATS Compatibility Score",
    desc: "See how well your resume passes applicant tracking systems.",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 3v1M15 3v1M8 4v1M16 4v1" />
        <rect x="5" y="6" width="14" height="12" rx="2" />
        <circle cx="9.5" cy="10.5" r="1.25" fill="currentColor" />
        <circle cx="14.5" cy="10.5" r="1.25" fill="currentColor" />
        <path d="M9 15h6" />
      </svg>
    ),
  },
  {
    title: "Bullet Point Rewrites",
    desc: "Get before/after versions of weak bullets.",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01" />
        <path d="M3 6c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zM3 12c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zM3 18c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Keyword Optimization",
    desc: "Missing keywords for your target role.",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="7.5" cy="15.5" r="2.5" />
        <path d="M10 13L19 4M15 4h4v4" />
      </svg>
    ),
  },
  {
    title: "AI Resume Rewrite",
    desc: "A full improved version of your resume.",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        <path d="m9 19 2 2 4-4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-foreground">
          What you get
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-foreground/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-center" aria-hidden>
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-foreground">
          Example roast
        </h2>
        <div className="mt-8 rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
          <p className="font-medium text-foreground">Roast:</p>
          <p className="mt-2 text-foreground/90">
            Your resume reads like a job description, not an achievement list.
            &quot;Responsible for managing projects&quot; tells recruiters nothing.
          </p>
          <p className="mt-4 font-medium text-foreground">Instead try:</p>
          <p className="mt-2 text-foreground/90">
            &quot;Managed 12 projects worth $2.1M in client revenue.&quot;
          </p>
        </div>
      </section>
      <footer className="border-t border-foreground/10 py-8 text-center text-sm text-foreground/60">
        Resume Roaster — Get roasted, get hired.
      </footer>
    </main>
  );
}
