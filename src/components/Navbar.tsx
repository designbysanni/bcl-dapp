"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useChainId } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts";

const PP = "'Poppins', var(--font-poppins), system-ui, sans-serif";

export function Navbar() {
  const chainId  = useChainId();
  const wrongNet = chainId !== SEPOLIA_CHAIN_ID && chainId !== 0;

  return (
    <>
      {wrongNet && (
        <div style={{
          width: '100%',
          background: 'rgba(251,191,36,0.12)',
          borderBottom: '1px solid rgba(251,191,36,0.28)',
          padding: '7px 16px',
          textAlign: 'center',
          fontSize: 12,
          color: '#fbbf24',
          fontFamily: PP,
          fontWeight: 600,
          letterSpacing: '0.03em',
          flexShrink: 0,
        }}>
          ⚠️ Switch to <strong>Sepolia Testnet</strong> to use BCL DApp
        </div>
      )}

      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 20px',
        position: 'relative',
        flexShrink: 0,
      }}>

        {/* Center pill nav */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(8,16,56,0.84)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 50,
          padding: '5px 6px 5px 10px',
          gap: 0,
          boxShadow: '0 6px 28px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.10)',
        }}>
          {/* Logo circle */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3faf 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(6,182,212,0.35), 0 2px 8px rgba(0,0,0,0.4)',
            marginRight: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="9" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>

          {/* Brand */}
          <span style={{
            fontFamily: PP,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginRight: 14,
            whiteSpace: 'nowrap',
          }}>BlockCycle</span>

          {/* Nav links */}
          <NavLink href="/#stake">Stake</NavLink>
          <NavLink href="https://docs.blockcyclelabs.com" external>Doc</NavLink>
          <NavLink href="https://app.uniswap.org" external>Buy $Cycle</NavLink>

          {/* RainbowKit connect button */}
          <div style={{ marginLeft: 5 }}>
            <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
          </div>
        </div>

        {/* Dropdown caret */}
        <div style={{
          position: 'absolute', right: 76,
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(8,16,56,0.84)',
          border: '1px solid rgba(255,255,255,0.14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 10, color: 'rgba(255,255,255,0.65)',
        }}>▼</div>

        {/* Avatar */}
        <div style={{
          position: 'absolute', right: 20,
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
          border: '2px solid rgba(255,255,255,0.24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,0.42)',
          flexShrink: 0,
        }}>🧑‍💻</div>
      </div>
    </>
  );
}

function NavLink({ href, children, external }: {
  href: string; children: React.ReactNode; external?: boolean;
}) {
  const style: React.CSSProperties = {
    fontFamily: PP,
    fontWeight: 600,
    fontSize: 11.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
    padding: '7px 14px',
    borderRadius: 30,
    cursor: 'pointer',
    transition: 'all 0.18s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    border: 'none',
    background: 'transparent',
    display: 'inline-block',
  };
  const enter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = '#fff';
    e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
  };
  const leave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
    e.currentTarget.style.background = 'transparent';
  };
  if (external) return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}
      onMouseEnter={enter} onMouseLeave={leave}>{children}</a>
  );
  return (
    <Link href={href} style={style} onMouseEnter={enter} onMouseLeave={leave}>
      {children}
    </Link>
  );
}
