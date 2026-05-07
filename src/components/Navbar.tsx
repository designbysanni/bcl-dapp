"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useChainId } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts";

export function Navbar() {
  const chainId  = useChainId();
  const wrongNet = chainId !== SEPOLIA_CHAIN_ID && chainId !== 0;

  return (
    <>
      {/* Wrong-network banner */}
      {wrongNet && (
        <div style={{
          width: '100%',
          background: 'rgba(251,191,36,0.10)',
          borderBottom: '1px solid rgba(251,191,36,0.25)',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: 13,
          color: '#fbbf24',
          fontFamily: "'Exo 2', sans-serif",
          fontWeight: 600,
        }}>
          ⚠️ Please switch to <strong>Sepolia Testnet</strong> to use BCL DApp.
        </div>
      )}

      {/* ── Main nav ── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        gap: 0,
      }}>
        {/* Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(10,20,70,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50,
          padding: '5px 6px 5px 10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)',
          gap: 0,
        }}>
          {/* Logo mark */}
          <div style={{
            width: 30, height: 30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3faf 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: 14,
            color: 'white',
            fontWeight: 800,
            boxShadow: '0 0 0 2px rgba(6,182,212,0.28)',
          }}>
            ⬡
          </div>

          {/* Brand name */}
          <span style={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'white',
            margin: '0 14px 0 8px',
            whiteSpace: 'nowrap',
          }}>
            BlockCycle
          </span>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NavLink href="/#stake">Stake</NavLink>
            <NavLink href="https://docs.blockcyclelabs.com" external>Doc</NavLink>
            <NavLink href="https://app.uniswap.org" external>Buy $Cycle</NavLink>

            {/* RainbowKit connect / account button */}
            <div style={{ marginLeft: 4 }}>
              <ConnectButton
                accountStatus="avatar"
                chainStatus="none"
                showBalance={false}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const base: React.CSSProperties = {
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.65)',
    padding: '7px 13px',
    borderRadius: 30,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    border: 'none',
    background: 'transparent',
  };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={base}
        onMouseEnter={e => { (e.target as HTMLElement).style.color = 'white'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; (e.target as HTMLElement).style.background = 'transparent'; }}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} style={base}
      onMouseEnter={e => { (e.target as HTMLElement).style.color = 'white'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; (e.target as HTMLElement).style.background = 'transparent'; }}
    >
      {children}
    </Link>
  );
}
