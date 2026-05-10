"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useChainId, useAccount } from "wagmi";
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts";
import { useWindowSize } from "@/hooks/useWindowSize";

const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

interface NavbarProps {
  onStakeClick?: () => void;
}

export function Navbar({ onStakeClick }: NavbarProps) {
  const chainId  = useChainId();
  const wrongNet = chainId !== SEPOLIA_CHAIN_ID && chainId !== 0;
  const { isMobile } = useWindowSize();

  return (
    <>
      {wrongNet && (
        <div style={{
          width:"100%",
          background:"rgba(245,158,11,0.10)",
          borderBottom:"1px solid rgba(245,158,11,0.25)",
          padding:"7px 16px", textAlign:"center",
          fontFamily:PP, fontSize:12, fontWeight:600,
          color:"#F59E0B", letterSpacing:"0.02em", flexShrink:0,
        }}>
          ⚠ Switch to <strong>Sepolia Testnet</strong> to interact with BCL contracts
        </div>
      )}

      {isMobile ? (
        <MobileNav onStakeClick={onStakeClick}/>
      ) : (
        <DesktopNav/>
      )}
    </>
  );
}

/* ── Desktop pill nav ─────────────────────────────────────── */
function DesktopNav() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"13px 20px", position:"relative", flexShrink:0,
    }}>
      <div style={{
        display:"flex", alignItems:"center",
        background:"rgba(4,9,30,0.90)",
        backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
        border:"1px solid rgba(255,255,255,0.12)",
        borderRadius:50, padding:"5px 6px 5px 10px", gap:2,
        boxShadow:"0 8px 32px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.08)",
      }}>
        {/* Logo */}
        <div style={{
          width:32, height:32, borderRadius:"50%",
          background:"linear-gradient(135deg,#1a3baf 0%,#2563EB 100%)",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          boxShadow:"0 0 0 1.5px rgba(37,99,235,0.45),0 3px 10px rgba(0,0,0,0.5)",
          marginRight:8,
        }}>
          <img src={LOGO} width={19} height={19} alt="BCL" style={{ objectFit:"contain" }}/>
        </div>

        <span style={{
          fontFamily:PP, fontWeight:800, fontSize:12.5,
          letterSpacing:"0.12em", textTransform:"uppercase",
          color:"#fff", marginRight:16, whiteSpace:"nowrap",
        }}>BlockCycle</span>

        <NavLink href="/#action-panel">Stake</NavLink>
        <NavLink href="https://docs.blockcyclelabs.com" external>Docs</NavLink>
        <NavLink href="https://app.uniswap.org" external>Buy $CYCLE</NavLink>

        <div style={{ marginLeft:5 }}>
          <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false}/>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile nav (2 rows) ──────────────────────────────────── */
function MobileNav({ onStakeClick }: { onStakeClick?: () => void }) {
  const { address, isConnected } = useAccount();
  const short = (a: string) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : "";

  return (
    <div style={{
      background:"rgba(4,9,30,0.92)",
      backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
      borderBottom:"1px solid rgba(255,255,255,0.10)",
      flexShrink:0, padding:"10px 14px 0",
    }}>
      {/* Row 1: Logo + address + wallet button */}
      <div style={{ display:"flex", alignItems:"center", gap:10, paddingBottom:10 }}>
        {/* Logo + wordmark */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background:"linear-gradient(135deg,#1a3baf 0%,#2563EB 100%)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            boxShadow:"0 0 0 1.5px rgba(37,99,235,0.45)",
          }}>
            <img src={LOGO} width={18} height={18} alt="BCL" style={{ objectFit:"contain" }}/>
          </div>
          <span style={{
            fontFamily:PP, fontWeight:800, fontSize:12, letterSpacing:"0.12em",
            textTransform:"uppercase", color:"#fff", whiteSpace:"nowrap",
          }}>BlockCycle</span>

          {/* Wallet address pill (when connected) */}
          {isConnected && address && (
            <div style={{
              fontFamily:"'Space Mono', monospace", fontSize:10, color:"rgba(255,255,255,0.60)",
              background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:20, padding:"4px 10px", whiteSpace:"nowrap",
              overflow:"hidden", textOverflow:"ellipsis", maxWidth:110,
            }}>
              {short(address)}
            </div>
          )}
        </div>

        {/* RainbowKit */}
        <div style={{ flexShrink:0 }}>
          <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false}/>
        </div>
      </div>

      {/* Row 2: Nav links */}
      <div style={{
        display:"flex", alignItems:"center", gap:2,
        borderTop:"1px solid rgba(255,255,255,0.07)",
        padding:"6px 0",
      }}>
        <MobileNavLink onClick={onStakeClick}>Stake</MobileNavLink>
        <MobileNavLink href="https://docs.blockcyclelabs.com" external>Docs</MobileNavLink>
        <MobileNavLink href="https://app.uniswap.org" external>Buy $CYCLE</MobileNavLink>
      </div>
    </div>
  );
}

function MobileNavLink({
  href, external, onClick, children,
}: {
  href?: string; external?: boolean; onClick?: () => void; children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    fontFamily:PP, fontWeight:600, fontSize:11, letterSpacing:"0.04em", textTransform:"uppercase",
    color:"rgba(255,255,255,0.60)", padding:"6px 14px", borderRadius:20,
    background:"transparent", border:"none",
    cursor:"pointer", textDecoration:"none", display:"inline-block", whiteSpace:"nowrap",
    transition:"all 0.15s",
  };
  const on  = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; };
  const off = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "rgba(255,255,255,0.60)"; e.currentTarget.style.background = "transparent"; };

  if (onClick) return (
    <button style={base} onMouseEnter={on} onMouseLeave={off} onClick={onClick}>{children}</button>
  );
  if (external) return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={on} onMouseLeave={off}>{children}</a>
  );
  return <Link href={href ?? "/"} style={base} onMouseEnter={on} onMouseLeave={off}>{children}</Link>;
}

/* ── Desktop nav link ─────────────────────────────────────── */
function NavLink({ href, children, external }: { href:string; children:React.ReactNode; external?:boolean }) {
  const base: React.CSSProperties = {
    fontFamily:PP, fontWeight:600, fontSize:11.5, letterSpacing:"0.05em", textTransform:"uppercase",
    color:"rgba(255,255,255,0.65)", padding:"7px 14px", borderRadius:30,
    cursor:"pointer", transition:"all 0.16s",
    textDecoration:"none", whiteSpace:"nowrap", border:"none", background:"transparent", display:"inline-block",
  };
  const on  = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; };
  const off = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.background = "transparent"; };

  if (external) return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={on} onMouseLeave={off}>{children}</a>
  );
  return <Link href={href} style={base} onMouseEnter={on} onMouseLeave={off}>{children}</Link>;
}
