"use client";

import Link from "next/link";
import { useState } from "react";

/** Upload your logo to public/logo.png (or logo.svg) — it appears in the top left. */
const LOGO_PATH = "/logo.png";

export function Header() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2">
          {!logoFailed ? (
            <img
              src={LOGO_PATH}
              alt="Resume Roast"
              className="h-32 w-auto object-contain sm:h-40"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="text-lg font-semibold text-foreground">Resume Roast</span>
          )}
        </Link>
      </div>
    </header>
  );
}
