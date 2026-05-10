import type { Metadata } from "next";
import { Poppins, Space_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

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
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${spaceMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
