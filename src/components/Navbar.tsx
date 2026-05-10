"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useChainId, useAccount, useDisconnect } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts";
import { useWindowSize } from "@/hooks/useWindowSize";

const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const CARD = "#131939";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

export function Navbar() {
  const chainId  = useChainId();
  const wrongNet = chainId !== SEPOLIA_CHAIN_ID && chainId !== 0;
  const { isMobile } = useWindowSize();

  return (
    <>
      {wrongNet && (
        <div style={{
          width: "100%", background: "rgba(245,158,11,0.12)",
          borderBottom: "1px solid rgba(245,158,11,0.28)",
          padding: "7px 16px", textAlign: "center", flexShrink: 0,
          fontFamily: PP, fontSize: 12, fontWeight: 600, color: "#F59E0B",
        }}>
          ⚠ Switch to <strong>Sepolia Testnet</strong> to interact with BCL
        </div>
      )}
      {isMobile ? <MobileNav /> : <DesktopNav />}
    </>
  );
}

/* ── Desktop: single centered pill ─────────────────────────── */
function DesktopNav() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const short = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "14px 20px", position: "relative", flexShrink: 0,
    }}>

      {/* Centered pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        background: CARD,
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 50,
        padding: "6px 8px 6px 12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
      }}>

        {/* BCL logo circle */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "#1156b5",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.16)",
          marginRight: 8,
        }}>
          <img src={LOGO} width={19} height={19} alt="BCL" style={{ objectFit: "contain" }} />
        </div>

        {/* Wordmark */}
        <span style={{
          fontFamily: PP, fontWeight: 800, fontSize: 13,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#fff", marginRight: 14, whiteSpace: "nowrap",
        }}>BlockCycle</span>

        {/* Nav links */}
        <PillLink href="#stake-panel">Stake</PillLink>
        <PillLink href="https://docs.blockcyclelabs.com" external>Doc</PillLink>
        <PillLink href="https://app.uniswap.org" external>Buy $CYCLE</PillLink>

        {/* Wallet button */}
        <div style={{ marginLeft: 6 }}>
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              style={{
                fontFamily: PP, fontWeight: 700, fontSize: 11.5,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: "#fff", background: "#1565D8",
                border: "none", borderRadius: 24,
                padding: "8px 18px", cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Disconnect
            </button>
          ) : (
            <ConnectButton label="Connect" accountStatus="avatar" chainStatus="none" showBalance={false} />
          )}
        </div>
      </div>

      {/* Dropdown caret (outside pill, right side) */}
      <button
        style={{
          position: "absolute", right: 80,
          width: 32, height: 32, borderRadius: "50%",
          background: CARD, border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 10, color: "rgba(255,255,255,0.55)",
          transition: "all 0.16s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; }}
        aria-label="Menu"
      >▼</button>

      {/* Avatar circle (outside pill, far right) */}
      <div style={{
        position: "absolute", right: 22,
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg,#4c1d95,#7c3aed,#db2777)",
        border: "2px solid rgba(255,255,255,0.22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0,0,0,0.50)",
      }}>
        {isConnected && address ? (
          <span style={{ fontFamily: PP, fontWeight: 800, fontSize: 14, color: "#fff" }}>
            {address.slice(2, 4).toUpperCase()}
          </span>
        ) : (
          <img src={LOGO} width={26} height={26} alt="avatar" style={{ objectFit: "contain" }} />
        )}
      </div>

    </div>
  );
}

/* ── Pill nav link ──────────────────────────────────────────── */
function PillLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const base: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 12,
    letterSpacing: "0.04em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)",
    padding: "7px 14px", borderRadius: 30,
    textDecoration: "none", whiteSpace: "nowrap",
    border: "none", background: "transparent",
    display: "inline-block", cursor: "pointer", transition: "all 0.15s",
  };
  const on  = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; };
  const off = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "transparent"; };
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={on} onMouseLeave={off}>{children}</a>;
  return <Link href={href} style={base} onMouseEnter={on} onMouseLeave={off}>{children}</Link>;
}

/* ── Mobile nav: 3-row layout ───────────────────────────────── */
function MobileNav() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const short = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";

  return (
    <div style={{
      background: "#135989",
      borderBottom: "1px solid rgba(255,255,255,0.10)",
      flexShrink: 0, padding: "12px 14px 0",
    }}>

      {/* Row 1: Logo + wordmark + dropdown */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: "#1156b5", border: "2px solid rgba(255,255,255,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 8,
        }}>
          <img src={LOGO} width={17} height={17} alt="BCL" style={{ objectFit: "contain" }} />
        </div>
        <span style={{
          fontFamily: PP, fontWeight: 800, fontSize: 12.5,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff",
          flex: 1,
        }}>BlockCycle</span>
        <button style={{
          width: 26, height: 26, borderRadius: "50%",
          background: CARD, border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 9, color: "rgba(255,255,255,0.55)", flexShrink: 0,
        }} aria-label="Menu">▼</button>
      </div>

      {/* Row 2: Wallet address pill + disconnect */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        {isConnected && address ? (
          <>
            <div style={{
              flex: 1,
              background: CARD, border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 24, padding: "9px 14px",
              fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.75)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {short(address)}
            </div>
            <button
              onClick={() => disconnect()}
              style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: CARD, border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.55)",
              }}
              aria-label="Disconnect"
            >⊗</button>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex" }}>
            <ConnectButton label="Connect Wallet" accountStatus="address" chainStatus="none" showBalance={false} />
          </div>
        )}
      </div>

      {/* Row 3: Nav links */}
      <div style={{ display: "flex", gap: 0, paddingBottom: 6 }}>
        <MobileLink href="/#action-panel">Stake</MobileLink>
        <MobileLink href="https://docs.blockcyclelabs.com" external>Docs</MobileLink>
        <MobileLink href="https://app.uniswap.org" external>Buy $Cycle</MobileLink>
      </div>

    </div>
  );
}

function MobileLink({ href, children, external, onClick }: { href?: string; children: React.ReactNode; external?: boolean; onClick?: () => void }) {
  const base: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 12, letterSpacing: "0.03em",
    color: "rgba(255,255,255,0.65)",
    padding: "6px 14px", borderRadius: 20,
    background: "transparent", border: "none",
    cursor: "pointer", textDecoration: "none", display: "inline-block",
    whiteSpace: "nowrap", transition: "all 0.14s",
  };
  const on  = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; };
  const off = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "transparent"; };
  if (onClick) return <button style={base} onClick={onClick} onMouseEnter={on} onMouseLeave={off}>{children}</button>;
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={on} onMouseLeave={off}>{children}</a>;
  return <Link href={href ?? "/"} style={base} onMouseEnter={on} onMouseLeave={off}>{children}</Link>;
}
