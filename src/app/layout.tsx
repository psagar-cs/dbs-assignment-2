import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlannerProvider } from "@/components/PlannerContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Today — Day Planner",
  description: "A personal day planner",
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
      <body className="min-h-full">
        <PlannerProvider>{children}</PlannerProvider>
      </body>
    </html>
  );
}
