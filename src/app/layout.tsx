import type { Metadata } from "next";
import { jakarta, jetbrains } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "TellClaude — Voice to Perfect Prompt",
  description:
    "Speak your thoughts, craft the perfect prompt for Claude Code. Voice-to-prompt converter with customizable modes, modifiers, and AI-powered interview assistance.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="claude" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
