"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { ActionPanel } from "@/components/ActionPanel";
import { RewardCounter } from "@/components/RewardCounter";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { useTransactionHistory, type TxRecord } from "@/hooks/useTransactionHistory";
import { useWindowSize } from "@/hooks/useWindowSize";
import { formatCycle } from "@/lib/format";

/* ── Exact Figma palette ─────────────────────────────────── */
const BG   = "#135989";
const CARD = "#131939";
const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

type Tab     = "stake" | "swap" | "send" | "pool";
type Filter  = "all" | "tokens" | "nfts";

/* ── Royalty-free SVG generative NFT art ─────────────────── */
const NFT_ART = [
  /* BCL Genesis #001 — blue hex grid orb */
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </radialGradient>
    </defs>
    <rect width="200" height="200" fill="url(#g1)"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="1"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.30)" stroke-width="1"/>
    <polygon points="100,38 127,55 127,89 100,106 73,89 73,55" fill="none" stroke="rgba(255,255,255,0.40)" stroke-width="1.5"/>
    <polygon points="100,62 114,70 114,86 100,94 86,86 86,70" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.30)" stroke-width="1"/>
    <circle cx="100" cy="78" r="10" fill="rgba(96,165,250,0.8)"/>
  </svg>`,
  /* BCL Pulse #002 — purple wave */
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g2" cx="30%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#0f0a1e"/>
      </radialGradient>
    </defs>
    <rect width="200" height="200" fill="url(#g2)"/>
    <path d="M0,100 Q25,60 50,100 T100,100 T150,100 T200,100" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
    <path d="M0,110 Q25,70 50,110 T100,110 T150,110 T200,110" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
    <path d="M0,120 Q25,80 50,120 T100,120 T150,120 T200,120" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <circle cx="100" cy="100" r="28" fill="rgba(168,85,247,0.35)" stroke="rgba(255,255,255,0.40)" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="16" fill="rgba(255,255,255,0.20)"/>
  </svg>`,
  /* BCL Cyber #003 — teal circuit */
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d1631"/>
        <stop offset="100%" stop-color="#134e4a"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#g3)"/>
    <line x1="40" y1="40" x2="160" y2="40" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="40" y1="70" x2="100" y2="70" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="100" y1="70" x2="100" y2="130" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="100" y1="130" x2="160" y2="130" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="40" y1="160" x2="160" y2="160" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="40" y1="40" x2="40" y2="160" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <line x1="160" y1="40" x2="160" y2="160" stroke="#2dd4bf" stroke-width="0.8" opacity="0.5"/>
    <circle cx="40" cy="40" r="4" fill="#2dd4bf"/>
    <circle cx="160" cy="40" r="4" fill="#2dd4bf"/>
    <circle cx="40" cy="160" r="4" fill="#2dd4bf"/>
    <circle cx="160" cy="160" r="4" fill="#2dd4bf"/>
    <circle cx="100" cy="100" r="22" fill="rgba(45,212,191,0.15)" stroke="#2dd4bf" stroke-width="1.5"/>
    <text x="100" y="106" text-anchor="middle" fill="#2dd4bf" font-size="14" font-family="monospace">BCL</text>
  </svg>`,
  /* BCL Cosmic #004 — gold starburst */
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g4" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#78350f"/>
        <stop offset="100%" stop-color="#0c0a06"/>
      </radialGradient>
    </defs>
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
  { id: "001", name: "BCL Genesis",  art: NFT_ART[0] },
  { id: "002", name: "BCL Pulse",    art: NFT_ART[1] },
  { id: "003", name: "BCL Cyber",    art: NFT_ART[2] },
  { id: "004", name: "BCL Cosmic",   art: NFT_ART[3] },
];

/* ── NFT card ──────────────────────────────────────────────── */
function NftCard({ nft, mobile }: { nft: typeof NFTS[0]; mobile?: boolean }) {
  const w = mobile ? "100%" : 148;
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, overflow: "hidden",
      width: w, minWidth: mobile ? undefined : 148, flexShrink: mobile ? undefined : 0,
      display: "flex", flexDirection: "column",
    }}>
      <div
        style={{ height: mobile ? 180 : 120 }}
        dangerouslySetInnerHTML={{ __html: nft.art }}
      />
      <div style={{ padding: "10px 10px 10px" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>
          #{nft.id}
        </div>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: mobile ? 15 : 12.5, color: "#fff", marginBottom: 6 }}>
          {nft.name}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button style={{
            flex: 1, fontFamily: PP, fontWeight: 700, fontSize: mobile ? 11 : 9.5,
            textTransform: "uppercase", color: "#fff", background: "#1565D8",
            border: "none", borderRadius: 20, padding: mobile ? "8px 0" : "6px 0", cursor: "pointer",
          }}>Edit Stake</button>
          <button style={{
            flex: 1, fontFamily: PP, fontWeight: 700, fontSize: mobile ? 11 : 9.5,
            textTransform: "uppercase", color: "#fff", background: "transparent",
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: 20,
            padding: mobile ? "8px 0" : "6px 0", cursor: "pointer",
          }}>Unstake</button>
        </div>
      </div>
    </div>
  );
}

/* ── CYCLE token card ──────────────────────────────────────── */
function TokenCard({
  variant, balance, stakedBalance, pendingRewards, mobile,
}: {
  variant: "available" | "staked";
  balance: bigint; stakedBalance: bigint; pendingRewards: bigint;
  mobile?: boolean;
}) {
  const isAvail = variant === "available";
  const amount  = isAvail ? balance : stakedBalance;
  const w       = mobile ? "100%" : 148;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, overflow: "hidden",
      width: w, minWidth: mobile ? undefined : 148, flexShrink: mobile ? undefined : 0,
      display: "flex", flexDirection: "column",
    }}>
      {/* Image area */}
      <div style={{
        background: "#0d1631", display: "flex", alignItems: "center", justifyContent: "center",
        height: mobile ? 180 : 120, position: "relative",
      }}>
        <img src={LOGO} width={mobile ? 72 : 50} height={mobile ? 72 : 50} alt="CYCLE" style={{ objectFit: "contain" }} />
        {/* Active toggle */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 16, borderRadius: 20,
          background: isAvail ? "rgba(255,255,255,0.15)" : "#16a34a",
          display: "flex", alignItems: "center", padding: "0 3px",
          justifyContent: isAvail ? "flex-start" : "flex-end",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "10px 10px 10px" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>
          123989989
        </div>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: mobile ? 15 : 12.5, color: "#fff", marginBottom: 2 }}>
          Block Cycle Token
        </div>
        <div style={{ fontFamily: MONO, fontSize: mobile ? 12 : 10.5, color: "rgba(255,255,255,0.55)", marginBottom: !isAvail ? 6 : 8 }}>
          ≈{parseFloat(formatCycle(amount)).toFixed(3)}
        </div>

        {!isAvail && stakedBalance > 0n && (
          <div style={{ fontFamily: PP, fontSize: 9.5, color: "#10B981", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "livePulse 2s infinite" }} />
            <RewardCounter baseRewards={pendingRewards} stakedBalance={stakedBalance} />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>CYCLE</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 5 }}>
          <button style={{
            flex: 1, fontFamily: PP, fontWeight: 700, fontSize: mobile ? 11 : 9.5,
            textTransform: "uppercase", color: "#fff", background: "#1565D8",
            border: "none", borderRadius: 20, padding: mobile ? "8px 0" : "6px 0", cursor: "pointer",
          }}>
            {isAvail ? "Edit Stake" : "Claim"}
          </button>
          <button style={{
            flex: 1, fontFamily: PP, fontWeight: 700, fontSize: mobile ? 11 : 9.5,
            textTransform: "uppercase", color: "#fff", background: "transparent",
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: 20,
            padding: mobile ? "8px 0" : "6px 0", cursor: "pointer",
          }}>Unstake</button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty staked card ─────────────────────────────────────── */
function EmptyStakedCard({ mobile }: { mobile?: boolean }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)",
      borderRadius: 14, overflow: "hidden",
      width: mobile ? "100%" : 148, minWidth: mobile ? undefined : 148, flexShrink: 0,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: mobile ? 280 : 220, gap: 8, padding: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div style={{ fontFamily: PP, fontSize: 11, color: "rgba(255,255,255,0.40)", textAlign: "center" }}>
        Stake CYCLE to earn 12% APY
      </div>
      <button style={{
        fontFamily: PP, fontWeight: 700, fontSize: 10, textTransform: "uppercase",
        color: "#fff", background: "#1565D8", border: "none", borderRadius: 20,
        padding: "6px 16px", cursor: "pointer",
      }}>Stake Now</button>
    </div>
  );
}

/* ── Filter tabs ───────────────────────────────────────────── */
function FilterTabs({ active, onChange }: { active: Filter; onChange: (f: Filter) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {(["all", "tokens", "nfts"] as Filter[]).map(f => (
        <button key={f} onClick={() => onChange(f)} style={{
          fontFamily: PP, fontWeight: 600, fontSize: 12,
          color: active === f ? "#fff" : "rgba(255,255,255,0.50)",
          background: active === f ? "rgba(255,255,255,0.12)" : "transparent",
          border: "none", borderRadius: 6,
          padding: "4px 12px", cursor: "pointer", textTransform: "capitalize",
        }}>
          {f === "nfts" ? "NFTs" : f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}

/* ── Balance pill (mobile) ─────────────────────────────────── */
function BalancePill({ balance }: { balance: bigint }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", overflow: "hidden",
      background: "#fff", borderRadius: 30, marginBottom: 14,
    }}>
      <div style={{ flex: 1, fontFamily: MONO, fontWeight: 800, fontSize: 16, color: "#131939", padding: "13px 18px" }}>
        {formatCycle(balance)} BCL
      </div>
      <div style={{
        background: CARD, color: "#fff",
        fontFamily: PP, fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
        padding: "13px 18px", whiteSpace: "nowrap",
      }}>Balance</div>
    </div>
  );
}

/* ── TX table ──────────────────────────────────────────────── */
function TxTable({ records, isLoading }: { records: TxRecord[]; isLoading: boolean }) {
  const short = (h: string) => h ? `${h.slice(0, 6)}…${h.slice(-4)}` : "—";
  const th: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,0.50)",
    textAlign: "left", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    fontFamily: PP, fontSize: 12, color: "rgba(255,255,255,0.80)",
    padding: "11px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle",
  };
  return (
    <div>
      <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 14 }}>
        Transaction History
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              {["Date","ID","Type","Asset","Amount","Status","Wallet Address"].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1,2,3].map(i => (
                <tr key={i}>
                  {[80,80,60,50,70,80,120].map((w,j) => (
                    <td key={j} style={{ padding:"11px 12px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <div className="skeleton" style={{ width:w, height:12, borderRadius:6 }}/>
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...td, textAlign:"center", color:"rgba(255,255,255,0.35)", padding:"32px 0" }}>
                  No transactions yet — your staking activity will appear here
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={i}
                  style={{ transition:"background 0.12s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                >
                  <td style={{ ...td, fontFamily:MONO, fontSize:11 }}>#{r.blockNumber.toLocaleString()}</td>
                  <td style={{ ...td, fontFamily:MONO, fontSize:11 }}>{r.blockNumber.toString().slice(-7)}</td>
                  <td style={td}>
                    <span style={{
                      fontFamily:PP, fontWeight:700, fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase",
                      color: r.type==="Stake" ? "#3B82F6" : r.type==="Unstake" ? "#F59E0B" : "#10B981",
                      background: r.type==="Stake" ? "rgba(59,130,246,0.12)" : r.type==="Unstake" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                      borderRadius:20, padding:"3px 9px",
                    }}>{r.type}</span>
                  </td>
                  <td style={td}>BCL</td>
                  <td style={{ ...td, fontFamily:MONO, fontWeight:700 }}>{formatCycle(r.amount)}</td>
                  <td style={td}><span style={{ color:"#10B981", fontWeight:600 }}>Completed</span></td>
                  <td style={{ ...td, fontFamily:MONO, fontSize:11 }}>
                    <a href={`https://sepolia.etherscan.io/tx/${r.hash}`} target="_blank" rel="noreferrer"
                      style={{ color:"#60a5fa", textDecoration:"none" }}
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

/* ── Connect hero ──────────────────────────────────────────── */
function ConnectHero({ fullHeight }: { fullHeight?: boolean }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "52px 24px", gap: 14, minHeight: fullHeight ? "55vh" : 200,
    }}>
      <img src={LOGO} width={62} height={62} alt="BCL" style={{ objectFit: "contain" }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 20, color: "#fff", marginBottom: 8 }}>
          Block Cycle Labs
        </div>
        <div style={{ fontFamily: PP, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 340 }}>
          Connect your wallet to view your CYCLE balance and start earning 12% fixed APY on Sepolia.
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function Home() {
  const { isConnected, address } = useAccount();
  const { stakedBalance, pendingRewards } = useStaking();
  const { balance } = useToken();
  const { records, isLoading: txLoading } = useTransactionHistory();
  const { isMobile } = useWindowSize();

  const [filter, setFilter]     = useState<Filter>("all");
  const [forcedTab, setForcedTab] = useState<Tab | null>(null);

  const openSwap = () => {
    setForcedTab("swap");
    setTimeout(() => document.getElementById("action-panel")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const showTokens = filter === "all" || filter === "tokens";
  const showNfts   = filter === "all" || filter === "nfts";

  /* ── Mobile layout ── */
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: BG }}>
        <Navbar onBuyCycle={openSwap} />
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px 24px" }}>

          {isConnected && <BalancePill balance={balance} />}

          {/* Asset section */}
          <div style={{ background: CARD, borderRadius: 16, padding: "14px 12px", marginBottom: 12 }}>
            <FilterTabs active={filter} onChange={setFilter} />
            {!isConnected ? (
              <ConnectHero fullHeight />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {showTokens && (
                  <TokenCard variant="available" balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards} mobile />
                )}
                {showTokens && (
                  stakedBalance > 0n
                    ? <TokenCard variant="staked" balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards} mobile />
                    : <EmptyStakedCard mobile />
                )}
                {showNfts && NFTS.map(nft => <NftCard key={nft.id} nft={nft} mobile />)}
              </div>
            )}
          </div>

          {/* Action panel */}
          <div id="action-panel" style={{ background: CARD, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <ActionPanel forcedTab={forcedTab} />
          </div>

          {/* TX history — only after connecting */}
          {isConnected && (
            <div style={{ background: CARD, borderRadius: 16, padding: "16px 14px" }}>
              <TxTable records={records} isLoading={txLoading} />
            </div>
          )}
        </div>
        <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    );
  }

  /* ── Desktop layout ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: BG }}>
      <Navbar onBuyCycle={openSwap} />

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>

        {/* Asset section — fills above-the-fold */}
        <div style={{
          background: CARD, borderRadius: 18, padding: "20px 22px",
          marginBottom: 16,
          minHeight: "calc(100vh - 82px)",
          display: "flex", flexDirection: "column",
        }}>
          <FilterTabs active={filter} onChange={setFilter} />

          {!isConnected ? (
            <ConnectHero fullHeight />
          ) : (
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6, flex: 1, alignItems: "flex-start" }}>
              {showTokens && (
                <TokenCard variant="available" balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards} />
              )}
              {showTokens && (
                stakedBalance > 0n
                  ? <TokenCard variant="staked" balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards} />
                  : <EmptyStakedCard />
              )}
              {showNfts && NFTS.map(nft => <NftCard key={nft.id} nft={nft} />)}
            </div>
          )}
        </div>

        {/* TX history — only when connected */}
        {isConnected && (
          <div style={{ background: CARD, borderRadius: 18, padding: "20px 22px" }}>
            <TxTable records={records} isLoading={txLoading} />
          </div>
        )}

      </div>
      <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
