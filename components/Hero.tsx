import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
        Your resume probably sucks.
      </h1>
      <p className="mt-6 text-lg text-foreground/80 sm:text-xl">
        Let AI roast it and fix it in 60 seconds.
      </p>
      <div className="mt-10">
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          Roast my resume
        </Link>
      </div>
    </section>
  );
}
