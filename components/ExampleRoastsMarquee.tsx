"use client";

const EXAMPLES = [
  {
    roast: "Your resume reads like a job description, not an achievement list.",
    instead: "Managed 12 projects worth $2.1M in client revenue.",
  },
  {
    roast: "\"Responsible for\" tells recruiters nothing. What did you actually do?",
    instead: "Led 3 engineers to ship 4 features that increased signups by 40%.",
  },
  {
    roast: "This bullet could apply to anyone. Where are the numbers?",
    instead: "Reduced support tickets by 25% by redesigning the onboarding flow.",
  },
  {
    roast: "Vague verbs like \"helped\" and \"supported\" hide your impact.",
    instead: "Built and launched the payment integration used by 10K+ customers.",
  },
  {
    roast: "Your skills section is a keyword dump. Weave them into your bullets.",
    instead: "Used SQL and Python to automate reporting, saving 15 hrs/week.",
  },
];

export function ExampleRoastsMarquee() {
  return (
    <section className="relative py-16">
      <h2 className="font-marker text-center text-4xl font-semibold text-foreground mb-10 sm:text-5xl">
        Example roasts
      </h2>
      <div className="group-marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="marquee-track flex w-max gap-6 px-4">
          {[...EXAMPLES, ...EXAMPLES].map((ex, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[300px] sm:w-[360px] rounded-xl border border-foreground/10 bg-white p-5 shadow-sm"
            >
              <p className="font-medium text-foreground text-sm">Roast:</p>
              <p className="mt-1 text-foreground/90 text-sm">{ex.roast}</p>
              <p className="mt-3 font-medium text-foreground text-sm">Instead try:</p>
              <p className="mt-1 text-foreground/90 text-sm italic">&quot;{ex.instead}&quot;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
