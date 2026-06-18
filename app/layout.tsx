import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import { QueryProvider } from "@/components/providers/query-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display face for hero + headings (warm "soft-serif"); body stays Geist.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Date Nite - Never Run Out of Date Ideas",
    template: "%s | Date Nite",
  },
  description:
    "Get personalized, budget-friendly date ideas tailored to your preferences. No repeats for 90 days. Schedule with a tap.",
  keywords: [
    "date ideas",
    "date night",
    "couple activities",
    "relationship",
    "dating app",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "Date Nite",
    title: "Date Nite - Never Run Out of Date Ideas",
    description:
      "Personalized date ideas for couples. Budget-aware, no repeats for 90 days.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Date Nite",
    description: "Personalized date ideas for couples",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Date Nite",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  // Browser-chrome meta colors (kept as hex per the theme-color spec); these
  // mirror --primary (light) and --background (dark) in app/globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B9D" },
    { media: "(prefers-color-scheme: dark)", color: "#1E1B4B" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LazyMotion features={domAnimation}>
              <MotionConfig reducedMotion="user">
                <NotificationProvider>{children}</NotificationProvider>
              </MotionConfig>
            </LazyMotion>
          </ThemeProvider>
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
