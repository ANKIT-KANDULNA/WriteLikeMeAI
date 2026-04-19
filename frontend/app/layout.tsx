import type { Metadata } from "next";
import { Inter, Indie_Flower, Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const indieFlower = Indie_Flower({
  weight: "400",
  variable: "--font-indie-flower",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Write Like Me AI – Generate Realistic Handwriting",
  description: "Upload a handwriting sample and let AI generate realistic, personalized handwritten pages. Export as PNG or PDF instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${indieFlower.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-indigo-500/30">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
