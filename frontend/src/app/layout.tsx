import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "BCL DApp — Block Cycle Labs",
  description: "Stake $CYCLE. Earn 12% APY. Fixed rewards on Sepolia Testnet.",
  keywords: ["BCL", "DeFi", "staking", "CYCLE", "Sepolia", "Block Cycle Labs"],
  openGraph: {
    title: "BCL DApp — Block Cycle Labs",
    description: "Stake $CYCLE and earn 12% fixed APY on Sepolia Testnet.",
    url: "https://bcl.sannisanni.com",
    siteName: "BCL DApp",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
