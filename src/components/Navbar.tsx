"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useChainId, useAccount, useDisconnect } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts";
import { useWindowSize } from "@/hooks/useWindowSize";

const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const CARD = "#131939";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";
const DOCS = "https://bcl.sannisanni.com/docs";

interface NavbarProps {
  onBuyCycle?: () => void;
}

export function Navbar({ onBuyCycle }: NavbarProps) {
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
      {isMobile
        ? <MobileNav onBuyCycle={onBuyCycle} />
        : <DesktopNav onBuyCycle={onBuyCycle} />
      }
    </>
  );
}

/* ── Desktop: single centered pill (no dropdown, no avatar) ── */
function DesktopNav({ onBuyCycle }: { onBuyCycle?: () => void }) {
  const { isConnected } = useAccount();
  const { disconnect }  = useDisconnect();

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "14px 20px", flexShrink: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        background: CARD,
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 50,
        padding: "6px 8px 6px 12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
      }}>
        {/* BCL logo — no circle, just the image */}
        <img src={LOGO} width={28} height={28} alt="BCL"
          style={{ objectFit: "contain", marginRight: 8, flexShrink: 0 }} />

        {/* Wordmark */}
        <span style={{
          fontFamily: PP, fontWeight: 800, fontSize: 13,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#fff", marginRight: 14, whiteSpace: "nowrap",
        }}>BlockCycle</span>

        {/* Nav links */}
        <PillLink href="#action-panel">Stake</PillLink>
        <PillLink href={DOCS} external>Doc</PillLink>
        <button
          onClick={onBuyCycle}
          style={{
            fontFamily: PP, fontWeight: 600, fontSize: 12,
            letterSpacing: "0.04em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
            padding: "7px 14px", borderRadius: 30,
            textDecoration: "none", whiteSpace: "nowrap",
            border: "none", background: "transparent",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >Buy $CYCLE</button>

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
                padding: "8px 18px", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >Disconnect</button>
          ) : (
            <ConnectButton label="Connect" accountStatus="avatar" chainStatus="none" showBalance={false} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Pill link ───────────────────────────────────────────────── */
function PillLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const base: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 12,
    letterSpacing: "0.04em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)", padding: "7px 14px", borderRadius: 30,
    textDecoration: "none", whiteSpace: "nowrap", border: "none",
    background: "transparent", display: "inline-block", cursor: "pointer", transition: "all 0.15s",
  };
  const on  = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; };
  const off = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "transparent"; };
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={on} onMouseLeave={off}>{children}</a>;
  return <Link href={href} style={base} onMouseEnter={on} onMouseLeave={off}>{children}</Link>;
}

/* ── Mobile nav: 2 rows — logo+connect on row1, links on row2 ── */
function MobileNav({ onBuyCycle }: { onBuyCycle?: () => void }) {
  const { isConnected } = useAccount();
  const { disconnect }  = useDisconnect();

  return (
    <div style={{
      background: "#135989",
      borderBottom: "1px solid rgba(255,255,255,0.10)",
      flexShrink: 0, padding: "11px 14px 0",
    }}>
      {/* Row 1: logo + wordmark + connect/disconnect (inline) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {/* BCL logo — no circle */}
        <img src={LOGO} width={26} height={26} alt="BCL" style={{ objectFit: "contain", flexShrink: 0 }} />

        <span style={{
          fontFamily: PP, fontWeight: 800, fontSize: 12.5,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", flex: 1,
        }}>BlockCycle</span>

        {/* Connect / Disconnect inline */}
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            style={{
              fontFamily: PP, fontWeight: 700, fontSize: 11,
              letterSpacing: "0.05em", textTransform: "uppercase",
              color: "#fff", background: "#1565D8",
              border: "none", borderRadius: 20,
              padding: "7px 14px", cursor: "pointer", flexShrink: 0,
            }}
          >Disconnect</button>
        ) : (
          <div style={{ flexShrink: 0 }}>
            <ConnectButton label="Connect Wallet" accountStatus="avatar" chainStatus="none" showBalance={false} />
          </div>
        )}
      </div>

      {/* Row 2: nav links */}
      <div style={{ display: "flex", gap: 0, paddingBottom: 6 }}>
        <MobileLink href="/#action-panel">Stake</MobileLink>
        <MobileLink href={DOCS} external>Docs</MobileLink>
        <MobileLink onClick={onBuyCycle}>Buy $Cycle</MobileLink>
      </div>
    </div>
  );
}

function MobileLink({
  href, children, external, onClick,
}: {
  href?: string; children: React.ReactNode; external?: boolean; onClick?: () => void;
}) {
  const base: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 12, letterSpacing: "0.03em",
    color: "rgba(255,255,255,0.65)", padding: "6px 14px", borderRadius: 20,
    background: "transparent", border: "none", cursor: "pointer",
    textDecoration: "none", display: "inline-block", whiteSpace: "nowrap",
  };
  if (onClick) return <button style={base} onClick={onClick}>{children}</button>;
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" style={base}>{children}</a>;
  return <Link href={href ?? "/"} style={base}>{children}</Link>;
}
