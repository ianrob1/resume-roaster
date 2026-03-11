import Link from "next/link";
import { Header } from "@/components/Header";
import { ExampleRoastsMarquee } from "@/components/ExampleRoastsMarquee";
import { Hero } from "@/components/Hero";
import { ATSInfoButton } from "@/components/ATSInfoButton";

const iconClass = "size-10 text-[var(--accent)]";

const atsIconClass = "size-10 text-white";
const atsFeature = {
  title: "ATS Compatibility Score",
  desc: "See how well your resume passes applicant tracking systems.",
  iconSrc: "/icons/ats.png",
  icon: (
    <svg className={atsIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v4l2 2" />
    </svg>
  ),
};

const otherFeatures = [
  {
    title: "Bullet Point Rewrites",
    desc: "Get before/after versions of weak bullets.",
    iconSrc: "/icons/bullet.png",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 6h12M4 12h8M4 18h10" />
        <path d="M16 8l2 2-2 2M16 14l2 2-2 2" />
      </svg>
    ),
  },
  {
    title: "Keyword Optimization",
    desc: "Missing keywords for your target role.",
    iconSrc: "/icons/keyword.png",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2l2 7h7l-5.5 5 2 7L12 16l-5.5 5 2-7L3 9h7l2-7z" />
      </svg>
    ),
  },
  {
    title: "Brutal Roast Feedback",
    desc: "Honest, no-fluff feedback on what's holding your resume back.",
    iconSrc: "/icons/roast.png",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22c3-2 5-5 5-8 0-1.5-.5-3-1.5-4.5C13 5 12 2 12 2s-1 3-4 7.5C7 11 6.5 12.5 6.5 14c0 3 2 6 5 8z" />
      </svg>
    ),
  },
  {
    title: "AI Resume Rewrite",
    desc: "A full improved version of your resume.",
    iconSrc: "/icons/rewrite.png",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        <path d="M12 18l1.5-1.5M15 15l3-3" />
      </svg>
    ),
  },
];

// To use your own icons: add files to public/icons/ (e.g. roast.svg), then add iconSrc: "/icons/roast.svg" to the feature object.
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
            const isBullet = f.title === "Bullet Point Rewrites";
            const iconSize = isATS ? "size-12" : isBullet ? "size-8" : "size-10";
            const iconPx = isATS ? 48 : isBullet ? 32 : 40;
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
                  {"iconSrc" in f && f.iconSrc ? (
                    <img
                      src={f.iconSrc}
                      alt=""
                      className={`${iconSize} object-contain ${isATS ? "icon-tint-white" : "icon-tint-orange"}`}
                      width={iconPx}
                      height={iconPx}
                    />
                  ) : (
                    f.icon
                  )}
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
        <p>Resume Roaster — Get roasted, get hired.</p>
        <p className="mt-2">
          <Link href="/terms" className="text-foreground/70 hover:text-foreground hover:underline">
            Terms and Conditions
          </Link>
          {" · "}
          All rights reserved.
        </p>
      </footer>
    </main>
  );
}
