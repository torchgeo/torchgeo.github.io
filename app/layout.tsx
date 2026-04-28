import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Single sans family for both display and body — keeps the page reading
// like a scientific PyTorch library, not marketing copy.
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TorchGeo · Geospatial deep learning for PyTorch",
  description:
    "TorchGeo is a PyTorch domain library for satellite and aerial imagery — datasets, samplers, transforms, and pretrained models for geospatial machine learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
