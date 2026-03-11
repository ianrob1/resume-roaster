import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Build-time cache buster so production/CDN can't serve old favicon (Vercel sets VERCEL_GIT_COMMIT_SHA)
const faviconVersion = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_REF ?? "v1";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://resroa.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Resume Roaster — Get your resume roasted in 60 seconds",
  description: "Get more interviews.",
  icons: {
    icon: [
      { url: `/favicon-32.png?v=${faviconVersion}`, sizes: "32x32", type: "image/png" },
      { url: `/favicon-16.png?v=${faviconVersion}`, sizes: "16x16", type: "image/png" },
    ],
    apple: `/favicon-32.png?v=${faviconVersion}`,
  },
  openGraph: {
    title: "Resume Roaster — Get your resume roasted in 60 seconds",
    description: "Get more interviews.",
    url: "/",
    siteName: "Resume Roaster",
    images: [{ url: "/logo.png", width: 640, height: 256, alt: "Resume Roaster" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Roaster — Get your resume roasted in 60 seconds",
    description: "Get more interviews.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden min-w-0`}>
        {children}
      </body>
    </html>
  );
}
