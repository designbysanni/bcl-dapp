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

/* ── Palette (exact Figma values) ──────────────────────────── */
const BG   = "#135989";   /* page background                  */
const CARD = "#131939";   /* card / panel background           */
const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

type AssetFilter = "all" | "tokens" | "nfts";

/* ── BCL logo circle ────────────────────────────────────────── */
function BclCircle({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "#1156b5",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "2px solid rgba(255,255,255,0.18)",
    }}>
      <img src={LOGO} width={size * 0.58} height={size * 0.58} alt="BCL" style={{ objectFit: "contain" }} />
    </div>
  );
}

/* ── Filter tabs ────────────────────────────────────────────── */
function FilterTabs({ active, onChange }: { active: AssetFilter; onChange: (f: AssetFilter) => void }) {
  const tabs: { id: AssetFilter; label: string }[] = [
    { id: "all",    label: "All"    },
    { id: "tokens", label: "Tokens" },
    { id: "nfts",   label: "NFTs"   },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            fontFamily: PP, fontWeight: 600, fontSize: 12, color: active === t.id ? "#fff" : "rgba(255,255,255,0.50)",
            background: active === t.id ? "rgba(255,255,255,0.12)" : "transparent",
            border: "none", borderRadius: 6,
            padding: "4px 12px", cursor: "pointer", transition: "all 0.15s",
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}

/* ── Asset card (portrait, Figma style) ────────────────────── */
interface AssetCardProps {
  variant: "available" | "staked";
  balance: bigint;
  stakedBalance: bigint;
  pendingRewards: bigint;
  mobile?: boolean;
}

function AssetCard({ variant, balance, stakedBalance, pendingRewards, mobile }: AssetCardProps) {
  const isAvail  = variant === "available";
  const amount   = isAvail ? balance : stakedBalance;
  const cardW    = mobile ? "100%" : 148;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      overflow: "hidden",
      width: cardW,
      minWidth: mobile ? undefined : 148,
      flexShrink: mobile ? undefined : 0,
      display: "flex", flexDirection: "column",
    }}>
      {/* Image area */}
      <div style={{
        background: "#0d1631",
        display: "flex", alignItems: "center", justifyContent: "center",
        height: mobile ? 180 : 120,
        position: "relative",
      }}>
        <BclCircle size={mobile ? 80 : 54} />
        {/* Active toggle indicator */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 16, borderRadius: 20,
          background: isAvail ? "rgba(255,255,255,0.15)" : "#16a34a",
          display: "flex", alignItems: "center",
          padding: "0 3px",
          justifyContent: isAvail ? "flex-start" : "flex-end",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "10px 10px 10px" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>
          {isAvail ? "123989989" : "987654321"}
        </div>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: mobile ? 15 : 12.5, color: "#fff", marginBottom: 2 }}>
          Block Cycle Token
        </div>
        <div style={{ fontFamily: MONO, fontSize: mobile ? 12 : 10.5, color: "rgba(255,255,255,0.55)", marginBottom: !isAvail ? 8 : 10 }}>
          ≈{formatCycle(amount).slice(0, 6)}
        </div>

        {/* Rewards row for staked */}
        {!isAvail && stakedBalance > 0n && (
          <div style={{ fontFamily: PP, fontSize: 9.5, color: "#10B981", marginBottom: 8 }}>
            <RewardCounter baseRewards={pendingRewards} stakedBalance={stakedBalance} /> CYCLE rewards
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 5 }}>
          <button style={{
            flex: 1,
            fontFamily: PP, fontWeight: 700, fontSize: mobile ? 11 : 9.5,
            letterSpacing: "0.02em", textTransform: "uppercase",
            color: "#fff", background: "#1565D8",
            border: "none", borderRadius: 20,
            padding: mobile ? "8px 0" : "6px 0", cursor: "pointer",
          }}>
            {isAvail ? "Edit Stake" : "Claim"}
          </button>
          <button style={{
            flex: 1,
            fontFamily: PP, fontWeight: 700, fontSize: mobile ? 11 : 9.5,
            letterSpacing: "0.02em", textTransform: "uppercase",
            color: "#fff", background: "transparent",
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: 20,
            padding: mobile ? "8px 0" : "6px 0", cursor: "pointer",
          }}>
            Unstake
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty staked placeholder card ──────────────────────────── */
function EmptyStakedCard({ mobile }: { mobile?: boolean }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px dashed rgba(255,255,255,0.12)",
      borderRadius: 14, overflow: "hidden",
      width: mobile ? "100%" : 148, minWidth: mobile ? undefined : 148, flexShrink: 0,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: mobile ? 280 : 220, gap: 8,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div style={{ fontFamily: PP, fontSize: 11, color: "rgba(255,255,255,0.40)", textAlign: "center", padding: "0 16px" }}>
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

/* ── Transaction table ──────────────────────────────────────── */
function TxTable({ records, isLoading }: { records: TxRecord[]; isLoading: boolean }) {
  const short = (h: string) => h ? `${h.slice(0, 6)}…${h.slice(-4)}` : "—";
  const thStyle: React.CSSProperties = {
    fontFamily: PP, fontWeight: 600, fontSize: 11,
    color: "rgba(255,255,255,0.55)", textAlign: "left",
    padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)",
    whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    fontFamily: PP, fontSize: 12, color: "rgba(255,255,255,0.80)",
    padding: "11px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)",
    verticalAlign: "middle",
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
              {["Date", "ID", "Type", "Asset", "Amount", "Status", "Wallet Address"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1,2,3].map(i => (
                <tr key={i}>
                  {[80, 80, 60, 50, 70, 80, 120].map((w, j) => (
                    <td key={j} style={{ padding: "11px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="skeleton" style={{ width: w, height: 12, borderRadius: 6 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,0.35)", padding: "32px 0" }}>
                  No transactions yet — your staking activity will appear here
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={i}
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                >
                  <td style={tdStyle}>
                    <span style={{ fontFamily: MONO, fontSize: 11 }}>#{r.blockNumber.toLocaleString()}</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: MONO, fontSize: 11 }}>
                    {r.blockNumber.toString().slice(-7)}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: PP, fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
                      color: r.type === "Stake" ? "#3B82F6" : r.type === "Unstake" ? "#F59E0B" : "#10B981",
                      background: r.type === "Stake" ? "rgba(59,130,246,0.12)" : r.type === "Unstake" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                      borderRadius: 20, padding: "3px 9px",
                    }}>
                      {r.type === "Claim" ? "Claim" : r.type}
                    </span>
                  </td>
                  <td style={tdStyle}>BCL</td>
                  <td style={{ ...tdStyle, fontFamily: MONO, fontWeight: 700 }}>
                    {formatCycle(r.amount)}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#10B981", fontWeight: 600 }}>Completed</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: MONO, fontSize: 11 }}>
                    <a href={`https://sepolia.etherscan.io/tx/${r.hash}`} target="_blank" rel="noreferrer"
                      style={{ color: "#60a5fa", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"}
                    >
                      {short(r.hash)} ↗
                    </a>
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

/* ── Balance pill (mobile) ──────────────────────────────────── */
function BalancePill({ balance }: { balance: bigint }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", overflow: "hidden",
      background: "#fff", borderRadius: 30, marginBottom: 14,
    }}>
      <div style={{
        flex: 1, fontFamily: MONO, fontWeight: 800, fontSize: 16,
        color: "#131939", padding: "13px 18px", letterSpacing: "-0.01em",
      }}>
        {formatCycle(balance)} BCL
      </div>
      <div style={{
        background: CARD, color: "#fff",
        fontFamily: PP, fontWeight: 700, fontSize: 11,
        letterSpacing: "0.12em", textTransform: "uppercase",
        padding: "13px 18px", whiteSpace: "nowrap",
      }}>
        Balance
      </div>
    </div>
  );
}

/* ── Connect hero ───────────────────────────────────────────── */
function ConnectHero({ mobile }: { mobile?: boolean }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 24px", gap: 14,
      minHeight: mobile ? 260 : 200,
    }}>
      <BclCircle size={60} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>
          Block Cycle Labs
        </div>
        <div style={{ fontFamily: PP, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
          Connect your wallet to view your CYCLE balance and start earning 12% fixed APY on Sepolia.
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function Home() {
  const { isConnected } = useAccount();
  const { stakedBalance, pendingRewards, totalStaked } = useStaking();
  const { balance } = useToken();
  const { records, isLoading: txLoading } = useTransactionHistory();
  const { isMobile } = useWindowSize();

  const [filter, setFilter] = useState<AssetFilter>("all");
  const showCards = filter === "all" || filter === "tokens";

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: BG }}>
        <Navbar />
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px 24px" }}>

          {/* Balance pill */}
          {isConnected && <BalancePill balance={balance} />}

          {/* Asset cards */}
          <div style={{ background: CARD, borderRadius: 16, padding: "14px 12px", marginBottom: 12 }}>
            <FilterTabs active={filter} onChange={setFilter} />
            {!isConnected ? (
              <ConnectHero mobile />
            ) : filter === "nfts" ? (
              <div style={{ fontFamily: PP, fontSize: 12, color: "rgba(255,255,255,0.40)", padding: "24px 0", textAlign: "center" }}>
                No NFTs in this wallet on Sepolia
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {showCards && (
                  <AssetCard
                    variant="available"
                    balance={balance}
                    stakedBalance={stakedBalance}
                    pendingRewards={pendingRewards}
                    mobile
                  />
                )}
                {showCards && (
                  stakedBalance > 0n
                    ? <AssetCard variant="staked" balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards} mobile />
                    : <EmptyStakedCard mobile />
                )}
              </div>
            )}
          </div>

          {/* Action panel (Swap / Send / Pool) */}
          <div style={{ background: CARD, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <ActionPanel />
          </div>

          {/* TX History */}
          <div style={{ background: CARD, borderRadius: 16, padding: "16px 14px" }}>
            <TxTable records={records} isLoading={txLoading} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Desktop ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: BG }}>
      <Navbar />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>

        {/* Asset section */}
        <div style={{ background: CARD, borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
          <FilterTabs active={filter} onChange={setFilter} />

          {!isConnected ? (
            <ConnectHero />
          ) : filter === "nfts" ? (
            <div style={{ fontFamily: PP, fontSize: 13, color: "rgba(255,255,255,0.40)", padding: "28px 0", textAlign: "center" }}>
              No NFTs in this wallet on Sepolia
            </div>
          ) : (
            /* Horizontal scrollable card row */
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
              {showCards && (
                <AssetCard
                  variant="available"
                  balance={balance}
                  stakedBalance={stakedBalance}
                  pendingRewards={pendingRewards}
                />
              )}
              {showCards && (
                stakedBalance > 0n
                  ? <AssetCard variant="staked" balance={balance} stakedBalance={stakedBalance} pendingRewards={pendingRewards} />
                  : <EmptyStakedCard />
              )}
              {/* Future asset placeholder */}
              <div style={{
                width: 148, minWidth: 148, flexShrink: 0,
                background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                height: 220,
              }}>
                <div style={{ fontFamily: PP, fontSize: 10, color: "rgba(255,255,255,0.20)", textAlign: "center", padding: 12 }}>
                  More assets<br />coming soon
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction history */}
        <div style={{ background: CARD, borderRadius: 18, padding: "18px 20px" }}>
          <TxTable records={records} isLoading={txLoading} />
        </div>

      </div>
    </div>
  );
}
