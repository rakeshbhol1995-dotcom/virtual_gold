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
  title: "GOLD CHAIN | The #1 Gold Standard on Base L2 Protocol",
  description: "The premier decentralized gold protocol native to Base Chain. 100% Backed, Ultra-Low Gas, and Institutional Security. Trade physical-grade gold on the world's most efficient L2 ecosystem.",
  keywords: [
    "Gold Chain", "Base Chain", "Base L2", "Coinbase Base", "Gold Trading", 
    "RWA", "Real World Assets", "DeFi Gold", "GRAMS Token", "Crypto Gold", 
    "Bonding Curve", "Base Network Gold", "Institutional Gold Protocol"
  ],
  authors: [{ name: "Gold Chain Protocol" }],
  openGraph: {
    title: "GOLD CHAIN | Native Gold Standard on Base L2",
    description: "Secure, Decentralized, and 100% Backed. The future of gold is here on the Base Network. Experience high-speed, low-cost gold trading.",
    url: "https://virtualgold.org",
    siteName: "Gold Chain Protocol",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
        alt: "Gold Chain - The Base Standard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOLD CHAIN | Premium Gold on Base L2",
    description: "The world's most secure gold-backed protocol, native to Base.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png?v=4",
    shortcut: "/icon.png?v=4",
    apple: "/icon.png?v=4",
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
