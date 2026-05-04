"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChainId } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts";
import clsx from "clsx";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Stake", href: "/#stake" },
  { label: "Docs", href: "https://bcl.sannisanni.com/docs", external: true },
];

export function Navbar() {
  const pathname = usePathname();
  const chainId = useChainId();
  const isWrongNetwork = chainId !== SEPOLIA_CHAIN_ID;

  return (
    <>
      {/* Wrong-network banner */}
      {isWrongNetwork && chainId !== 0 && (
        <div className="w-full bg-status-warning/10 border-b border-status-warning/20 px-4 py-2 text-center text-sm text-status-warning">
          ⚠️ You&apos;re on the wrong network. Please switch to{" "}
          <span className="font-semibold">Sepolia Testnet</span>.
        </div>
      )}

      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-bg-deep/80 border-b border-[rgba(0,198,255,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-bg-deep"
                  fill="none"
                />
                <circle cx="9" cy="9" r="2.5" fill="currentColor" className="text-bg-deep" />
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-text-primary text-base leading-none block">
                BCL
              </span>
              <span className="text-text-muted text-[10px] leading-none">
                Block Cycle Labs
              </span>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                  pathname === link.href
                    ? "text-accent-cyan bg-accent-cyan/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="badge-network hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              Sepolia
            </span>
            <ConnectButton
              accountStatus="avatar"
              chainStatus="none"
              showBalance={false}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
