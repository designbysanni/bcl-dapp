import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

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
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
