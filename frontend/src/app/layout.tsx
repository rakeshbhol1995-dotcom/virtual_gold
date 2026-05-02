import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://virtualgold.org'),
  title: "Gold Chain | The Premier Gold-Backed DEX & Commodity Protocol",
  description: "Trade digital gold (GRAMS) with institutional security on the Base Network. Gold Chain is a decentralized commodity-backed protocol featuring a fair launch bonding curve and 100% on-chain liquidity.",
  keywords: ["Gold Chain", "Base Network Trading", "Base DEX", "Gold Trading", "DEX", "Bonding Curve", "DeFi", "GRAMS Token", "Base Sepolia Gold"],
  authors: [{ name: "Gold Chain Team" }],
  openGraph: {
    title: "Gold Chain | Professional Gold-Backed DEX",
    description: "The gold standard of decentralized finance. Secure, Decentralized, and 100% Backed.",
    url: "https://virtualgold.org",
    siteName: "Gold Chain",
    images: [
      {
        url: "/gold-logo.png",
        width: 1200,
        height: 630,
        alt: "Gold Chain Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gold Chain | Gold-Backed Exchange",
    description: "The premier L2 ecosystem for digital gold.",
    images: ["/gold-logo.png"],
  },
  icons: {
    icon: [
      { url: "/gold-logo.png" },
      { url: "/gold-logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/gold-logo.png",
  },
};

import { Web3Provider } from "@/components/providers/Web3Provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gold Chain Protocol",
    "url": "https://virtualgold.org",
    "logo": "https://virtualgold.org/gold-logo.png",
    "sameAs": [
      "https://x.com/virtualgold26",
      "https://www.linkedin.com/in/virtual-gold-138400406/",
      "https://www.instagram.com/"
    ]
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${spaceGrotesk.variable} font-sans bg-black text-white h-full antialiased selection:bg-gold/30 selection:text-gold`}
    >
      <head>
        <link rel="icon" href="/gold-logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
