import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Use Inter for a clean, corporate medical look matching the client's reference
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shealth AI | Medical Imaging Intelligence",
  description: "Next-generation AI analysis for DICOM medical imaging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} antialiased bg-[var(--color-background)] text-[var(--color-text)]`}
      >
        {children}
      </body>
    </html>
  );
}
