import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DECIPHERER — Founder Operating Layer",
  description:
    "An AI-native Founder Operating Layer that turns company signals, ambiguity and decisions into coordinated execution.",
  applicationName: "DECIPHERER",
  keywords: [
    "Founder Operating System",
    "AI Agents",
    "Chief of Staff",
    "Founder Office",
    "Agentic Workflows",
    "DECIPHERER",
  ],
  authors: [
    {
      name: "Vaibhav Venu",
    },
  ],
  openGraph: {
    title: "DECIPHERER — Founder Operating Layer",
    description:
      "One founder. Multiple companies. DECIPHERER keeps watch, coordinates specialist agents and surfaces only what genuinely needs the founder.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DECIPHERER — Founder Operating Layer",
    description:
      "An AI-native operating layer between a founder's brain and everything else.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}