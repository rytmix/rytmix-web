import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AudioHost from "@/components/audio-host";
import NowPlayingBar from "@/components/NowPlayingBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rytmix",
  description: "Web-first music streaming, rebuilt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Bottom padding reserves space for the fixed now-playing bar. */}
        <div className="flex-1 pb-36 md:pb-24">{children}</div>
        <NowPlayingBar />
        <AudioHost />
      </body>
    </html>
  );
}
