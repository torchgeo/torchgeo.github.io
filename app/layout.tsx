import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://torchgeo.org";
const SITE_TITLE = "TorchGeo · Geospatial deep learning for PyTorch";
const SITE_DESCRIPTION =
  "TorchGeo is a PyTorch domain library for satellite and aerial imagery — datasets, samplers, transforms, and pretrained models for geospatial machine learning.";

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
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "TorchGeo",
  keywords: [
    "TorchGeo",
    "PyTorch",
    "geospatial",
    "satellite imagery",
    "remote sensing",
    "deep learning",
    "earth observation",
    "machine learning",
    "Sentinel-2",
    "multispectral",
  ],
  authors: [{ name: "The TorchGeo Authors", url: "https://github.com/torchgeo" }],
  creator: "The TorchGeo Authors",
  publisher: "The TorchGeo Organization",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "TorchGeo",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/brand/seattle-s2.png",
        width: 1536,
        height: 1024,
        alt: "Sentinel-2 imagery of Seattle rendered with TorchGeo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/brand/seattle-s2.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/logomark-color-white.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/brand/logomark-color-white.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1b2a" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#org`,
      name: "The TorchGeo Organization",
      url: SITE_URL,
      logo: `${SITE_URL}/brand/torchgeo-logo.svg`,
      sameAs: [
        "https://github.com/torchgeo",
        "https://huggingface.co/torchgeo",
        "https://pypi.org/project/torchgeo",
        "https://www.youtube.com/@TorchGeo",
        "https://www.osgeo.org/projects/torchgeo/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#site`,
      url: SITE_URL,
      name: "TorchGeo",
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}#org` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: "TorchGeo",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform",
      programmingLanguage: "Python",
      license: "https://opensource.org/licenses/MIT",
      codeRepository: "https://github.com/torchgeo/torchgeo",
      downloadUrl: "https://pypi.org/project/torchgeo",
      author: { "@id": `${SITE_URL}#org` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
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
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is static, trusted content
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
