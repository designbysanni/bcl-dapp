"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navbar } from "@/components/Navbar";
import { ActionPanel } from "@/components/ActionPanel";
import { StakingPanel } from "@/components/StakingPanel";
import { UserPosition } from "@/components/UserPosition";
import { RewardCounter } from "@/components/RewardCounter";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { useTransactionHistory, type TxRecord } from "@/hooks/useTransactionHistory";
import { useWindowSize } from "@/hooks/useWindowSize";
import { formatCycle } from "@/lib/format";

const BG   = "#3099ef";
const CARD = "#121838";
const BLUE = "#3099ef";
const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

type Filter   = "all" | "tokens" | "nfts";
type MainView = "assets" | "swap";

/* Dummy amounts shown to disconnected users (blurred) */
const DUMMY_BAL    = 5432100000000000000000n;
const DUMMY_STAKED = 2000000000000000000000n;
const DUMMY_RWDS   = 48200000000000000000n;

/* ── SVG generative NFT art (royalty-free) ─────────────── */
const NFT_ART = [
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#1e1b4b"/>
    </radialGradient></defs>
    <rect width="200" height="200" fill="url(#g1)"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="1"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.30)" stroke-width="1"/>
    <polygon points="100,38 127,55 127,89 100,106 73,89 73,55" fill="none" stroke="rgba(255,255,255,0.40)" stroke-width="1.5"/>
    <polygon points="100,62 114,70 114,86 100,94 86,86 86,70" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.30)" stroke-width="1"/>
    <circle cx="100" cy="78" r="10" fill="rgba(96,165,250,0.8)"/>
  </svg>`,
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g2" cx="30%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#0f0a1e"/>
    </radialGradient></defs>
    <rect width="200" height="200" fill="url(#g2)"/>
    <path d="M0,100 Q25,60 50,100 T100,100 T150,100 T200,100" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
    <path d="M0,110 Q25,70 50,110 T100,110 T150,110 T200,110" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
    <path d="M0,120 Q25,80 50,120 T100,120 T150,120 T200,120" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <circle cx="100" cy="100" r="28" fill="rgba(168,85,247,0.35)" stroke="rgba(255,255,255,0.40)" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="16" fill="rgba(255,255,255,0.20)"/>
  </svg>`,
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1631"/><stop offset="100%" stop-color="#134e4a"/>
    </linearGradient></defs>
    <rect width="200" height="200" fill="url(#g3)"/>
    <line x1="40" y1="40" x2="160" y2="40" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="40" y1="70" x2="100" y2="70" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="100" y1="70" x2="100" y2="130" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="100" y1="130" x2="160" y2="130" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="40" y1="160" x2="160" y2="160" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="40" y1="40" x2="40" y2="160" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="160" y1="40" x2="160" y2="160" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <circle cx="40" cy="40" r="4" fill="#2dd4bf"/><circle cx="160" cy="40" r="4" fill="#2dd4bf"/>
    <circle cx="40" cy="160" r="4" fill="#2dd4bf"/><circle cx="160" cy="160" r="4" fill="#2dd4bf"/>
    <circle cx="100" cy="100" r="22" fill="rgba(45,212,191,0.15)" stroke="#2dd4bf" stroke-width="1.5"/>
    <text x="100" y="106" text-anchor="middle" fill="#2dd4bf" font-size="14" font-family="monospace">BCL</text>
  </svg>`,
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g4" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#78350f"/><stop offset="100%" stop-color="#0c0a06"/>
    </radialGradient></defs>
    <rect width="200" height="200" fill="url(#g4)"/>
    <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(251,191,36,0.20)" stroke-width="1"/>
    <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(251,191,36,0.20)" stroke-width="1"/>
    <line x1="43" y1="43" x2="157" y2="157" stroke="rgba(251,191,36,0.15)" stroke-width="1"/>
    <line x1="157" y1="43" x2="43" y2="157" stroke="rgba(251,191,36,0.15)" stroke-width="1"/>
    <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(251,191,36,0.15)" stroke-width="1"/>
    <circle cx="100" cy="100" r="32" fill="none" stroke="rgba(251,191,36,0.25)" stroke-width="1"/>
    <circle cx="100" cy="100" r="18" fill="rgba(251,191,36,0.20)" stroke="rgba(251,191,36,0.60)" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="8" fill="rgba(251,191,36,0.80)"/>
  </svg>`,
];

const NFTS = [
  { id: "001", name: "BCL Genesis", art: NFT_ART[0] },
  { id: "002", name: "BCL Pulse",   art: NFT_ART[1] },
  { id: "003", name: "BCL Cyber",   art: NFT_ART[2] },
  { id: "004", name: "BCL Cosmic",  art: NFT_ART[3] },
];

/* ── Stake modal ─────────────────────────────────────────── */
function StakeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: CARD, borderRadius: 22, width: "100%", maxWidth: 500,
          border: "1px solid rgba(255,255,255,0.10)",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.60)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <span style={{ fontFamily: PP, fontWeight: 700, fontSize: 16, color: "#fff" }}>Staking</span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
              width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.70)",
              fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, fontFamily: "system-ui",
            }}
          >×</button>
        </div>
        <UserPosition />
        <StakingPanel />
      </div>
    </div>
  );
}

/* ── Overlay shown over blurred cards when disconnected ──── */
function ConnectOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 18, padding: 20,
      background: "rgba(10,16,44,0.60)", backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "rgba(48,153,239,0.15)", border: "1.5px solid rgba(48,153,239,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src={LOGO} width={48} height={48} alt="BCL" style={{ objectFit: "contain" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>
          Connect Your Wallet
        </div>
        <div style={{ fontFamily: PP, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 300 }}>
          View your CYCLE balance, NFTs, and start earning<br/>
          <strong style={{ color: "#3099ef" }}>12% fixed APY</strong> on Sepolia Testnet
        </div>
      </div>
      <ConnectButton label="Connect Wallet" accountStatus="avatar" chainStatus="none" showBalance={false} />
    </div>
  );
}

/* ── NFT card ────────────────────────────────────────────── */
function NftCard({
  nft, connected, onStake,
}: {
  nft: typeof NFTS[0]; connected: boolean; onStake: () => void;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.50)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(48,153,239,0.30)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div style={{ flex: 1, minHeight: 160 }} dangerouslySetInnerHTML={{ __html: nft.art }} />
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.32)" }}>#{nft.id}</div>
          {connected ? (
            <span style={{
              fontFamily: PP, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
              color: "#F59E0B", background: "rgba(245,158,11,0.12)",
              borderRadius: 10, padding: "3px 9px", letterSpacing: "0.05em",
            }}>Not Owned</span>
          ) : (
            <span style={{
              fontFamily: PP, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)",
              borderRadius: 10, padding: "3px 9px", letterSpacing: "0.05em",
            }}>NFT</span>
          )}
        </div>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>
          {nft.name}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onStake}
            style={{
              flex: 1, fontFamily: PP, fontWeight: 700, fontSize: 11, letterSpacing: "0.04em",
              textTransform: "uppercase", color: "#fff", background: BLUE,
              border: "none", borderRadius: 24, padding: "10px 20px", cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >Edit Stake</button>
          <button
            onClick={onStake}
            style={{
              flex: 1, fontFamily: PP, fontWeight: 700, fontSize: 11, letterSpacing: "0.04em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.70)",
              background: "transparent", border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 24, padding: "10px 20px", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "rgba(255,255,255,0.70)"; }}
          >Unstake</button>
        </div>
      </div>
    </div>
  );
}

/* ── Token card ──────────────────────────────────────────── */
function TokenCard({
  variant, balance, stakedBalance, pendingRewards, connected, onStake,
}: {
  variant: "available" | "staked";
  balance: bigint; stakedBalance: bigint; pendingRewards: bigint;
  connected: boolean; onStake: () => void;
}) {
  const isAvail = variant === "available";
  const amount  = isAvail ? balance : stakedBalance;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.50)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(48,153,239,0.30)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {/* Image area */}
      <div style={{
        background: "linear-gradient(135deg, #0d1225 0%, #162040 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 160, position: "relative", flex: 1,
      }}>
        <img src={LOGO} width={72} height={72} alt="CYCLE" style={{ objectFit: "contain", opacity: 0.92 }} />
        {/* Status toggle */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          width: 30, height: 17, borderRadius: 20,
          background: isAvail ? "rgba(255,255,255,0.15)" : "#16a34a",
          display: "flex", alignItems: "center", padding: "0 3px",
          justifyContent: isAvail ? "flex-start" : "flex-end",
          transition: "background 0.3s",
        }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#fff" }} />
        </div>
        {/* Label */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          fontFamily: PP, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: isAvail ? "rgba(255,255,255,0.55)" : "#10B981",
          background: isAvail ? "rgba(255,255,255,0.08)" : "rgba(16,185,129,0.12)",
          borderRadius: 10, padding: "3px 9px",
        }}>
          {isAvail ? "Available" : "Staked"}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.30)", marginBottom: 4 }}>
          #123989989
        </div>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>
          Block Cycle Token
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: "rgba(255,255,255,0.50)", marginBottom: 10 }}>
          {parseFloat(formatCycle(amount)).toFixed(2)} CYCLE
        </div>

        {!isAvail && connected && stakedBalance > 0n && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: PP, fontSize: 11, color: "#10B981", marginBottom: 12,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#10B981",
              display: "inline-block", animation: "livePulse 2s infinite",
            }} />
            <RewardCounter baseRewards={pendingRewards} stakedBalance={stakedBalance} />
            <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 10 }}>CYCLE earned</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onStake}
            style={{
              flex: 1, fontFamily: PP, fontWeight: 700, fontSize: 11, letterSpacing: "0.04em",
              textTransform: "uppercase", color: "#fff", background: BLUE,
              border: "none", borderRadius: 24, padding: "10px 20px", cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {isAvail ? "Stake" : "Claim"}
          </button>
          <button
            onClick={onStake}
            style={{
              flex: 1, fontFamily: PP, fontWeight: 700, fontSize: 11, letterSpacing: "0.04em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.70)",
              background: "transparent", border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 24, padding: "10px 20px", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "rgba(255,255,255,0.70)"; }}
          >Unstake</button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty staked placeholder ────────────────────────────── */
function EmptyStakedCard({ onStake }: { onStake: () => void }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.10)",
      borderRadius: 16, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 260, gap: 12, padding: 20,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: "rgba(48,153,239,0.08)", border: "1px dashed rgba(48,153,239,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(48,153,239,0.55)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div style={{ fontFamily: PP, fontSize: 12.5, color: "rgba(255,255,255,0.40)", textAlign: "center", lineHeight: 1.6 }}>
        No staked position yet<br/>
        <span style={{ color: "#3099ef", fontWeight: 600 }}>12% fixed APY</span> awaits
      </div>
      <button
        onClick={onStake}
        style={{
          fontFamily: PP, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em",
          color: "#fff", background: BLUE, border: "none", borderRadius: 24,
          padding: "10px 28px", cursor: "pointer", transition: "opacity 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >Stake Now</button>
    </div>
  );
}

/* ── Filter tabs ─────────────────────────────────────────── */
function FilterTabs({ active, onChange }: { active: Filter; onChange: (f: Filter) => void }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
      {(["all", "tokens", "nfts"] as Filter[]).map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            fontFamily: PP, fontWeight: 600, fontSize: 12.5,
            color: active === f ? "#fff" : "rgba(255,255,255,0.42)",
            background: active === f ? "rgba(48,153,239,0.18)" : "transparent",
            border: active === f ? "1px solid rgba(48,153,239,0.38)" : "1px solid transparent",
            borderRadius: 8, padding: "5px 16px", cursor: "pointer", textTransform: "capitalize",
            transition: "all 0.15s",
          }}
        >
          {f === "nfts" ? "NFTs" : f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}

/* ── TX table ────────────────────────────────────────────── */
function TxTable({ records, isLoading }: { records: TxRecord[]; isLoading: boolean }) {
  const short = (h: string) => h ? `${h.slice(0, 6)}…${h.slice(-4)}` : "—";
  const th: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,0.45)",
    textAlign: "left", padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    fontFamily: PP, fontSize: 12, color: "rgba(255,255,255,0.78)",
    padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle",
  };
  return (
    <div>
      <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 16 }}>
        Transaction History
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              {["Date", "ID", "Type", "Asset", "Amount", "Status", "TX Hash"].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i}>
                  {[80, 80, 60, 50, 70, 80, 120].map((w, j) => (
                    <td key={j} style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="skeleton" style={{ width: w, height: 12, borderRadius: 6 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...td, textAlign: "center", color: "rgba(255,255,255,0.30)", padding: "40px 0" }}>
                  No transactions yet — your staking activity will appear here
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr
                  key={i}
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                >
                  <td style={{ ...td, fontFamily: MONO, fontSize: 11 }}>
                    #{r.blockNumber.toLocaleString()}
                  </td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 11 }}>
                    {r.blockNumber.toString().slice(-7)}
                  </td>
                  <td style={td}>
                    <span style={{
                      fontFamily: PP, fontWeight: 700, fontSize: 10, letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: r.type === "Stake" ? "#3099ef" : r.type === "Unstake" ? "#F59E0B" : "#10B981",
                      background: r.type === "Stake" ? "rgba(48,153,239,0.12)" : r.type === "Unstake" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                      borderRadius: 20, padding: "3px 10px",
                    }}>{r.type}</span>
                  </td>
                  <td style={td}>BCL</td>
                  <td style={{ ...td, fontFamily: MONO, fontWeight: 700 }}>{formatCycle(r.amount)}</td>
                  <td style={td}><span style={{ color: "#10B981", fontWeight: 600 }}>Confirmed</span></td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 11 }}>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${r.hash}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: "#3099ef", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"}
                    >{short(r.hash)} ↗</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Asset grid (shared between mobile & desktop) ─────────── */
function AssetGrid({
  filter, connected, balance, stakedBalance, pendingRewards, onStake,
}: {
  filter: Filter; connected: boolean;
  balance: bigint; stakedBalance: bigint; pendingRewards: bigint;
  onStake: () => void;
}) {
  const showTokens = filter === "all" || filter === "tokens";
  const showNfts   = filter === "all" || filter === "nfts";
  const bal  = connected ? balance        : DUMMY_BAL;
  const sta  = connected ? stakedBalance  : DUMMY_STAKED;
  const rwd  = connected ? pendingRewards : DUMMY_RWDS;

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Cards grid — blurred when not connected */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
        filter: connected ? "none" : "blur(10px)",
        pointerEvents: connected ? "auto" : "none",
        userSelect: connected ? "auto" : "none",
        flex: 1,
        alignContent: "start",
      }}>
        {showTokens && (
          <TokenCard
            variant="available"
            balance={bal} stakedBalance={sta} pendingRewards={rwd}
            connected={connected} onStake={onStake}
          />
        )}
        {showTokens && (
          connected && stakedBalance > 0n
            ? <TokenCard variant="staked" balance={bal} stakedBalance={sta} pendingRewards={rwd} connected={connected} onStake={onStake} />
            : <EmptyStakedCard onStake={onStake} />
        )}
        {showNfts && NFTS.map(nft => (
          <NftCard key={nft.id} nft={nft} connected={connected} onStake={onStake} />
        ))}
      </div>

      {/* Connect overlay */}
      {!connected && <ConnectOverlay />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const { isConnected }              = useAccount();
  const { stakedBalance, pendingRewards } = useStaking();
  const { balance }                  = useToken();
  const { records, isLoading: txLoading } = useTransactionHistory();
  const { isMobile }                 = useWindowSize();

  const [filter,     setFilter]     = useState<Filter>("all");
  const [mainView,   setMainView]   = useState<MainView>("assets");
  const [stakeModal, setStakeModal] = useState(false);

  const openSwap  = () => setMainView("swap");
  const openStake = () => { if (isConnected) setStakeModal(true); };

  /* ── Mobile layout ────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: BG,
      }}>
        <Navbar onBuyCycle={openSwap} />

        <div style={{
          flex: 1,
          overflowY: isConnected ? "auto" : "hidden",
          padding: "10px 12px 24px",
        }}>

          {/* Main card */}
          <div style={{
            background: CARD, borderRadius: 18, padding: "16px 14px",
            marginBottom: 12, position: "relative",
            minHeight: isConnected ? undefined : "calc(100vh - 130px)",
            display: "flex", flexDirection: "column",
          }}>
            {mainView === "swap" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <button
                    onClick={() => setMainView("assets")}
                    style={{
                      fontFamily: PP, fontWeight: 600, fontSize: 12,
                      color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)",
                      border: "none", borderRadius: 20, padding: "6px 14px",
                      cursor: "pointer",
                    }}
                  >← Assets</button>
                  <span style={{ fontFamily: PP, fontWeight: 700, fontSize: 15, color: "#fff" }}>
                    Swap Tokens
                  </span>
                </div>
                <ActionPanel forcedTab={"swap" as any} />
              </>
            ) : (
              <>
                <FilterTabs active={filter} onChange={setFilter} />
                <AssetGrid
                  filter={filter} connected={isConnected}
                  balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards}
                  onStake={openStake}
                />
              </>
            )}
          </div>

          {/* Staking action panel — only when connected + asset view */}
          {isConnected && mainView === "assets" && (
            <div
              id="action-panel"
              style={{ background: CARD, borderRadius: 18, overflow: "hidden", marginBottom: 12 }}
            >
              <ActionPanel />
            </div>
          )}

          {/* TX history — only when connected */}
          {isConnected && (
            <div style={{ background: CARD, borderRadius: 18, padding: "16px 14px" }}>
              <TxTable records={records} isLoading={txLoading} />
            </div>
          )}
        </div>

        {stakeModal && <StakeModal onClose={() => setStakeModal(false)} />}
        <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    );
  }

  /* ── Desktop layout ───────────────────────────────────── */
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: isConnected ? "auto" : "100vh",
      minHeight: "100vh",
      overflow: isConnected ? "auto" : "hidden",
      background: BG,
    }}>
      <Navbar onBuyCycle={openSwap} />

      {/* Page body */}
      <div style={{ flex: 1, padding: "0 20px 24px", display: "flex", flexDirection: "column" }}>

        {/* Large asset card */}
        <div style={{
          background: CARD, borderRadius: 22, padding: "24px 26px",
          marginBottom: 16,
          flex: 1,
          minHeight: "calc(100vh - 96px)",
          display: "flex", flexDirection: "column",
          position: "relative",
        }}>

          {mainView === "swap" ? (
            /* ── Swap view ── */
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <button
                  onClick={() => setMainView("assets")}
                  style={{
                    fontFamily: PP, fontWeight: 600, fontSize: 13,
                    color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)",
                    border: "none", borderRadius: 24, padding: "8px 18px",
                    cursor: "pointer", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                >← Assets</button>
                <span style={{ fontFamily: PP, fontWeight: 700, fontSize: 18, color: "#fff" }}>
                  Swap Tokens
                </span>
              </div>
              <div style={{ maxWidth: 480, width: "100%", margin: "0 auto" }}>
                <ActionPanel forcedTab={"swap" as any} />
              </div>
            </div>
          ) : (
            /* ── Asset view ── */
            <>
              <FilterTabs active={filter} onChange={setFilter} />
              <AssetGrid
                filter={filter} connected={isConnected}
                balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards}
                onStake={openStake}
              />
            </>
          )}
        </div>

        {/* TX history — only when connected */}
        {isConnected && (
          <div style={{ background: CARD, borderRadius: 22, padding: "24px 26px" }}>
            <TxTable records={records} isLoading={txLoading} />
          </div>
        )}
      </div>

      {stakeModal && <StakeModal onClose={() => setStakeModal(false)} />}
      <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
