import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/providers/GameProvider";
import { GameNotification } from "@/components/GameNotification";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Cricket Quiz Battle",
  description: "Real-time multiplayer IPL cricket trivia game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-surface)] text-white selection:bg-[var(--color-neon)] selection:text-black" suppressHydrationWarning>
        <GameProvider>
          <div className="absolute inset-0 bg-[url('/pitch-texture.svg')] opacity-5 pointer-events-none z-[-1]" />
          <GameNotification />
          <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
            {children}
          </main>
        </GameProvider>
      </body>
    </html>
  );
}
