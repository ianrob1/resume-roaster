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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://resroa.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Resume Roaster",
  description: "Brutal feedback. Better resume. More interviews.",
  keywords: ["resume feedback", "resume roast", "ATS score", "resume checker", "resume improvement", "job application", "resume review"],
  icons: {
    icon: [{ url: "/favicon.png?v=2", type: "image/png", sizes: "32x32" }],
    apple: "/favicon.png?v=2",
  },
  openGraph: {
    title: "Resume Roaster",
    description: "Brutal feedback. Better resume. More interviews.",
    url: "/",
    siteName: "Resume Roaster",
    images: [{ url: "/logo.png", width: 640, height: 256, alt: "Resume Roaster" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Roaster",
    description: "Brutal feedback. Better resume. More interviews.",
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
