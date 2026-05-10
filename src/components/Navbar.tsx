"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useChainId } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts";

const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

export function Navbar() {
  const chainId  = useChainId();
  const wrongNet = chainId !== SEPOLIA_CHAIN_ID && chainId !== 0;

  return (
    <>
      {wrongNet && (
        <div style={{
          width: "100%",
          background: "rgba(245,158,11,0.10)",
          borderBottom: "1px solid rgba(245,158,11,0.25)",
          padding: "7px 16px",
          textAlign: "center",
          fontFamily: PP, fontSize: 12, fontWeight: 600,
          color: "#F59E0B", letterSpacing: "0.02em", flexShrink: 0,
        }}>
          ⚠ Switch to <strong>Sepolia Testnet</strong> to interact with BCL contracts
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "13px 20px", position: "relative", flexShrink: 0,
      }}>

        {/* ── Center pill ── */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(4, 9, 30, 0.90)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 50,
          padding: "5px 6px 5px 10px",
          gap: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}>

          {/* Logo */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #1a3baf 0%, #2563EB 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 0 1.5px rgba(37,99,235,0.45), 0 3px 10px rgba(0,0,0,0.5)",
            marginRight: 8,
          }}>
            <img src={LOGO} width={19} height={19} alt="BCL" style={{ objectFit: "contain" }} />
          </div>

          {/* Wordmark */}
          <span style={{
            fontFamily: PP, fontWeight: 800, fontSize: 12.5,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#fff", marginRight: 16, whiteSpace: "nowrap",
          }}>BlockCycle</span>

          {/* Nav links */}
          <NavLink href="/#stake-panel">Stake</NavLink>
          <NavLink href="https://docs.blockcyclelabs.com" external>Docs</NavLink>
          <NavLink href="https://app.uniswap.org" external>Buy $CYCLE</NavLink>

          {/* RainbowKit */}
          <div style={{ marginLeft: 5 }}>
            <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
          </div>
        </div>

        {/* Dropdown caret (Figma element) */}
        <button style={{
          position: "absolute", right: 72,
          width: 30, height: 30, borderRadius: "50%",
          background: "rgba(4, 9, 30, 0.90)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 10, color: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(28px)",
          transition: "all 0.18s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(4,9,30,0.90)"; }}
          aria-label="Menu"
        >▼</button>

        {/* Avatar */}
        <div style={{
          position: "absolute", right: 20,
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #db2777 100%)",
          border: "2px solid rgba(255,255,255,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
          flexShrink: 0, cursor: "pointer",
        }}>
          <img src={LOGO} width={26} height={26} alt="Profile" style={{ objectFit: "contain" }} />
        </div>

      </div>
    </>
  );
}

function NavLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const base: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 11.5,
    letterSpacing: "0.05em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)",
    padding: "7px 14px", borderRadius: 30,
    cursor: "pointer", transition: "all 0.16s",
    textDecoration: "none", whiteSpace: "nowrap",
    border: "none", background: "transparent",
    display: "inline-block",
  };
  const on  = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; };
  const off = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "transparent"; };

  if (external) return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={on} onMouseLeave={off}>{children}</a>
  );
  return <Link href={href} style={base} onMouseEnter={on} onMouseLeave={off}>{children}</Link>;
}
