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
  title: "Gold Chain | The Gold Standard of DeFi | To The Moon 🚀",
  description: "The world's most secure gold-backed decentralized exchange on Base. Trade GRAMS with 100% transparency, guaranteed liquidity, and institutional-grade security. Join the Moon Mission today!",
  keywords: ["Gold Chain", "Base Network", "Gold Trading", "Crypto Moon", "DEX", "Bonding Curve", "DeFi Gold", "GRAMS Token", "Institutional Crypto"],
  authors: [{ name: "Gold Chain Protocol" }],
  openGraph: {
    title: "Gold Chain | Gold-Backed Exchange | To The Moon",
    description: "Secure, Decentralized, and 100% Backed. The future of gold is here on the Base Network.",
    url: "https://virtualgold.org",
    siteName: "Gold Chain",
    images: [
      {
        url: "/gold-logo.png",
        width: 1200,
        height: 630,
        alt: "Gold Chain Moon Mission",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gold Chain | Moon Mission 🚀",
    description: "The premier ecosystem for digital gold on Base.",
    images: ["/gold-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
