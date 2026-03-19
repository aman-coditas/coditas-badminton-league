import type { Metadata } from "next";
import { Inter, Urbanist } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Coditas Badminton League",
  description: "Official website for Coditas Badminton League - Register your team and track tournament progress.",
  keywords: "badminton, tournament, coditas, league, sports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${urbanist.variable} ${inter.className}`}>
        <NavbarWrapper />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
