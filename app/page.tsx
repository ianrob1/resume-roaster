import { Header } from "@/components/Header";
import { ExampleRoastsMarquee } from "@/components/ExampleRoastsMarquee";
import { Hero } from "@/components/Hero";
import { ATSInfoButton } from "@/components/ATSInfoButton";

const iconClass = "size-10 text-[var(--accent)]";

const atsIconClass = "size-10 text-white";
const atsFeature = {
  title: "ATS Compatibility Score",
  desc: "See how well your resume passes applicant tracking systems.",
  icon: (
    <svg className={atsIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 3v1M15 3v1M8 4v1M16 4v1" />
      <rect x="5" y="6" width="14" height="12" rx="2" />
      <circle cx="9.5" cy="10.5" r="1.25" fill="currentColor" />
      <circle cx="14.5" cy="10.5" r="1.25" fill="currentColor" />
      <path d="M9 15h6" />
    </svg>
  ),
};

const otherFeatures = [
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
    title: "Brutal Roast Feedback",
    desc: "Honest, no-fluff feedback on what's holding your resume back.",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

// Order: [Bullet, Keyword, ATS (center/highlight), Brutal Roast, AI Rewrite]
const features = [
  otherFeatures[0],
  otherFeatures[1],
  atsFeature,
  otherFeatures[2],
  otherFeatures[3],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-marker text-center text-4xl font-semibold text-foreground sm:text-5xl">
          What you get
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 justify-items-center sm:justify-items-stretch">
          {features.map((f) => {
            const isATS = f.title === "ATS Compatibility Score";
            return (
              <div
                key={f.title}
                className={`relative rounded-xl border p-6 shadow-sm w-full max-w-sm sm:max-w-none ${
                  isATS
                    ? "border-[#d96d2b] bg-gradient-to-b from-[#e87b35] to-[#d96d2b] p-6 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(233,123,53,0.45),0_16px_32px_-12px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.2)] ring-2 ring-[#e87b35]/50 ring-offset-2 ring-offset-background"
                    : "border-foreground/10 bg-white"
                }`}
              >
                {isATS && <ATSInfoButton />}
                <div className="mb-3 flex items-center justify-center" aria-hidden>
                  {f.icon}
                </div>
                <h3 className={`font-semibold ${isATS ? "text-white" : "text-foreground"}`}>{f.title}</h3>
                <p className={`mt-2 text-sm ${isATS ? "text-white/90" : "text-foreground/70"}`}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
      <ExampleRoastsMarquee />
      <footer className="border-t border-foreground/10 py-8 text-center text-sm text-foreground/60">
        Resume Roaster — Get roasted, get hired.
      </footer>
    </main>
  );
}
