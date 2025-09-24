import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "next-themes";

import SessionProvider from "@/components/shared/layout/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "API Pulse - Unified API Monitoring Platform",
  description:
    "Monitor, track, and optimize your APIs across multiple providers. Get real-time health checks, and intelligent alerts.",
  keywords: ["API monitoring", "health checks", "rate limits", "alerts"],
  authors: [{ name: "API Pulse Team" }],
  openGraph: {
    title: "API Pulse - Unified API Monitoring Platform",
    description:
      "Monitor, track, and optimize your APIs across multiple providers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
