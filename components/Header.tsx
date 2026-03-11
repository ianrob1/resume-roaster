"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

/** Upload your logo to public/logo.png (or logo.svg) — it appears in the top left. */
const LOGO_PATH = "/logo.png";

export function Header() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="-mt-4 py-0 -mb-6 sm:-mb-8">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2">
          {!logoFailed ? (
            <Image
              src={LOGO_PATH}
              alt="Resume Roaster"
              width={640}
              height={256}
              className="h-64 w-auto object-contain sm:h-80"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="text-lg font-semibold text-foreground">Resume Roaster</span>
          )}
        </Link>
      </div>
    </header>
  );
}
