import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineScope AI — Next-Gen Movie Intelligence Platform",
  description:
    "Decode the audience mind. Enter any IMDb ID and get AI-powered sentiment analysis, audience insights, and cinematic intelligence powered by Claude AI.",
  keywords: [
    "movie",
    "sentiment analysis",
    "IMDb",
    "AI",
    "reviews",
    "Claude AI",
    "movie intelligence",
    "audience insights",
    "film analysis",
  ],
  openGraph: {
    title: "CineScope AI — Next-Gen Movie Intelligence",
    description:
      "AI-powered audience sentiment analysis and cinematic intelligence for any movie.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="noise-overlay">{children}</div>
      </body>
    </html>
  );
}
