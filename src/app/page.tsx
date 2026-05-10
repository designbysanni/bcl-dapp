"use client";

import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { StakingPanel } from "@/components/StakingPanel";
import { UserPosition } from "@/components/UserPosition";
import { RewardCounter } from "@/components/RewardCounter";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { useTransactionHistory, type TxRecord } from "@/hooks/useTransactionHistory";
import { formatCycle } from "@/lib/format";
import {
  etherscanAddress,
  CYCLE_TOKEN_ADDRESS,
  CYCLE_STAKING_ADDRESS,
} from "@/lib/contracts";

/* ─── Design tokens ───────────────────────────────────────── */
const PP     = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO   = "'Space Mono', var(--font-mono), monospace";
const LOGO   = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

const C = {
  pageBg:  "#1565D8",
  card:    "rgba(4, 9, 30, 0.96)",
  cardEl:  "rgba(7, 14, 45, 0.98)",
  border:  "rgba(255,255,255,0.09)",
  borderA: "rgba(255,255,255,0.18)",
  white:   "#ffffff",
  muted:   "rgba(255,255,255,0.52)",
  dim:     "rgba(255,255,255,0.28)",
  green:   "#10B981",
  blue:    "#3B82F6",
  purple:  "#8B5CF6",
  yellow:  "#F59E0B",
  red:     "#EF4444",
};

/* ─── SVG hex-grid card background ───────────────────────── */
function HexGrid({ id }: { id: string }) {
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}
    >
      <defs>
        <pattern id={id} x="0" y="0" width="56" height="48.5" patternUnits="userSpaceOnUse">
          <polygon
            points="28,1.5 53,14.5 53,40.5 28,53.5 3,40.5 3,14.5"
            fill="none" stroke="white" strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ─── Blockchain node-graph SVG decoration ────────────────── */
function NodeGraph() {
  const nodes = [
    { x: 78, y: 18 }, { x: 92, y: 42 }, { x: 85, y: 68 },
    { x: 68, y: 82 }, { x: 96, y: 20 }, { x: 72, y: 50 },
  ];
  const edges = [[0,1],[1,2],[2,3],[0,4],[0,5],[1,5],[5,2]];
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.055 }}
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`}
          x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
          stroke="white" strokeWidth="0.8"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`} r={i === 0 ? 4 : 2.5} fill="white" />
      ))}
    </svg>
  );
}

/* ─── Gradient top-accent bar ─────────────────────────────── */
function CardAccent({ color = `linear-gradient(90deg, ${C.blue}, ${C.purple}, transparent)` }: { color?: string }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: color, borderRadius: "16px 16px 0 0",
    }} />
  );
}

/* ─── BCL token logo circle ───────────────────────────────── */
function BclIcon({ size = 38 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #1a3baf 0%, #2563EB 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 0 0 1.5px rgba(59,130,246,0.45), 0 4px 12px rgba(0,0,0,0.4)",
    }}>
      <img
        src={LOGO}
        width={size * 0.58}
        height={size * 0.58}
        alt="BCL"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

/* ─── Portfolio card ──────────────────────────────────────── */
interface PortfolioCardProps {
  variant: "available" | "staked" | "empty-staked";
  balance: bigint;
  stakedBalance: bigint;
  pendingRewards: bigint;
  onAction: () => void;
}

function PortfolioCard({ variant, balance, stakedBalance, pendingRewards, onAction }: PortfolioCardProps) {
  const isAvailable    = variant === "available";
  const isEmptyStaked  = variant === "empty-staked";
  const accentColor    = isAvailable
    ? `linear-gradient(90deg, ${C.blue} 0%, ${C.purple} 60%, transparent 100%)`
    : `linear-gradient(90deg, ${C.green} 0%, ${C.blue} 60%, transparent 100%)`;

  return (
    <div style={{
      position: "relative",
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      padding: "22px 24px 20px",
      overflow: "hidden",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      transition: "border-color 0.22s, box-shadow 0.22s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.borderA;
        (e.currentTarget as HTMLDivElement).style.boxShadow  = "0 12px 40px rgba(0,0,0,0.55)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
        (e.currentTarget as HTMLDivElement).style.boxShadow  = "none";
      }}
    >
      <CardAccent color={accentColor} />
      <HexGrid id={isAvailable ? "hex-a" : "hex-s"} />
      <NodeGraph />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <BclIcon size={40} />
            <div>
              <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 14, color: C.white, lineHeight: 1.3 }}>
                Block Cycle Token
              </div>
              <div style={{ fontFamily: PP, fontSize: 10.5, color: C.muted, letterSpacing: "0.07em", marginTop: 2 }}>
                CYCLE · Sepolia Testnet
              </div>
            </div>
          </div>

          {/* Status badge */}
          {!isEmptyStaked && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: PP, fontWeight: 700, fontSize: 9.5,
              letterSpacing: "0.09em", textTransform: "uppercase",
              color: isAvailable ? C.blue : C.green,
              background: isAvailable ? "rgba(59,130,246,0.12)" : "rgba(16,185,129,0.12)",
              border: `1px solid ${isAvailable ? "rgba(59,130,246,0.28)" : "rgba(16,185,129,0.28)"}`,
              borderRadius: 20, padding: "4px 10px",
              flexShrink: 0,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: isAvailable ? C.blue : C.green,
                animation: isAvailable ? "none" : "livePulse 2s ease-in-out infinite",
                display: "inline-block",
              }} />
              {isAvailable ? "Available" : "Earning 12% APY"}
            </div>
          )}
        </div>

        {/* Main number */}
        {isEmptyStaked ? (
          /* Empty staked state */
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "8px 0 16px",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              border: `1px dashed rgba(255,255,255,0.15)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{ fontFamily: PP, fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.60)", marginBottom: 6 }}>
              No active position
            </div>
            <div style={{ fontFamily: PP, fontSize: 11.5, color: C.muted, textAlign: "center", maxWidth: 200, lineHeight: 1.6 }}>
              Stake your CYCLE tokens to start earning 12% fixed APY
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.white, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {formatCycle(isAvailable ? balance : stakedBalance)}
              </div>
              <div style={{ fontFamily: PP, fontSize: 11, color: C.muted, letterSpacing: "0.14em", marginTop: 5 }}>
                CYCLE
              </div>
            </div>

            {/* Rewards row — only for staked card */}
            {!isAvailable && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.18)",
                borderRadius: 10, padding: "9px 13px",
                marginTop: 8, marginBottom: 4,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: C.green, flexShrink: 0,
                  boxShadow: `0 0 6px ${C.green}`,
                  animation: "livePulse 2s ease-in-out infinite",
                }} />
                <div>
                  <div style={{ fontFamily: PP, fontSize: 9.5, fontWeight: 600, color: C.green, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 2 }}>
                    Pending Rewards
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                    <RewardCounter baseRewards={pendingRewards} stakedBalance={stakedBalance} />
                    <span style={{ fontFamily: PP, fontSize: 10, color: "rgba(255,255,255,0.42)" }}>CYCLE</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Divider + actions */}
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.07)`, marginTop: "auto", paddingTop: 14, display: "flex", gap: 8 }}>
          <button
            onClick={onAction}
            style={{
              flex: 1,
              fontFamily: PP, fontWeight: 700, fontSize: 12,
              letterSpacing: "0.05em", textTransform: "uppercase",
              color: C.white,
              background: isAvailable
                ? "linear-gradient(135deg, #1d4ed8, #2563EB)"
                : isEmptyStaked ? "rgba(255,255,255,0.08)" : "rgba(16,185,129,0.18)",
              border: isAvailable ? "none" : `1px solid ${isEmptyStaked ? "rgba(255,255,255,0.15)" : "rgba(16,185,129,0.35)"}`,
              borderRadius: 10, padding: "10px 16px",
              cursor: "pointer", transition: "all 0.18s",
              boxShadow: isAvailable ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            {isAvailable ? "Stake Now →" : isEmptyStaked ? "Start Staking →" : "Claim Rewards →"}
          </button>

          {!isEmptyStaked && (
            <a
              href={etherscanAddress(isAvailable ? CYCLE_TOKEN_ADDRESS : CYCLE_STAKING_ADDRESS)}
              target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${C.border}`,
                color: C.muted, textDecoration: "none", fontSize: 15,
                flexShrink: 0, transition: "all 0.18s",
              }}
              title="View on Etherscan"
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLAnchorElement).style.color = C.white;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.color = C.muted;
              }}
            >↗</a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── TX type badge ───────────────────────────────────────── */
function TxBadge({ type }: { type: TxRecord["type"] }) {
  const map = {
    Stake:   { color: C.blue,   bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)"  },
    Unstake: { color: C.yellow, bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)"  },
    Claim:   { color: C.green,  bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)"  },
  }[type];
  return (
    <span style={{
      fontFamily: PP, fontWeight: 700, fontSize: 9.5, letterSpacing: "0.07em",
      textTransform: "uppercase", color: map.color,
      background: map.bg, border: `1px solid ${map.border}`,
      borderRadius: 20, padding: "3px 9px",
      display: "inline-flex", alignItems: "center",
    }}>{type}</span>
  );
}

/* ─── TX row ──────────────────────────────────────────────── */
function TxRow({ record }: { record: TxRecord }) {
  const short = (h: string) => h ? `${h.slice(0, 8)}…${h.slice(-6)}` : "—";
  const td: React.CSSProperties = {
    fontFamily: PP, fontSize: 12.5, fontWeight: 400,
    color: "rgba(255,255,255,0.78)", padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    verticalAlign: "middle",
  };
  return (
    <tr style={{ transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
    >
      <td style={td}><TxBadge type={record.type} /></td>
      <td style={{ ...td, fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.white }}>
        {formatCycle(record.amount)}
        <span style={{ fontFamily: PP, fontSize: 10, color: C.muted, marginLeft: 5, fontWeight: 400 }}>CYCLE</span>
      </td>
      <td style={{ ...td, fontFamily: MONO, fontSize: 11, color: C.muted }}>
        #{record.blockNumber.toLocaleString()}
      </td>
      <td style={td}>
        <a
          href={`https://sepolia.etherscan.io/tx/${record.hash}`}
          target="_blank" rel="noreferrer"
          style={{ fontFamily: MONO, fontSize: 11, color: C.blue, textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"}
        >
          {short(record.hash)} ↗
        </a>
      </td>
    </tr>
  );
}

/* ─── TX empty state ──────────────────────────────────────── */
function TxEmpty() {
  return (
    <tr><td colSpan={4}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "36px 20px", gap: 10,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
        <div style={{ fontFamily: PP, fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.40)" }}>
          No transactions yet
        </div>
        <div style={{ fontFamily: PP, fontSize: 11.5, color: C.muted, textAlign: "center" }}>
          Your staking activity on Sepolia will appear here
        </div>
      </div>
    </td></tr>
  );
}

/* ─── TX skeleton rows ────────────────────────────────────── */
function TxSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <tr key={i}>
          {[70, 140, 90, 160].map((w, j) => (
            <td key={j} style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="skeleton" style={{ width: w, height: 14, borderRadius: 7 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Sidebar stat ────────────────────────────────────────── */
function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ fontFamily: PP, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", color: C.muted }}>
        {label}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: accent ?? C.white }}>
        {value}
      </span>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function Home() {
  const { isConnected, address } = useAccount();
  const { stakedBalance, pendingRewards, totalStaked, rewardPool } = useStaking();
  const { balance } = useToken();
  const { records, isLoading: txLoading, refetch: refetchTx } = useTransactionHistory();

  const short     = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
  const hasStaked = stakedBalance > 0n;

  /* scroll right panel into view on CTA click */
  const focusStake = () => document.getElementById("stake-panel")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar />

      {/* ── Body ── */}
      <div style={{
        display: "flex", flex: 1, overflow: "hidden",
        gap: 12, padding: "0 14px 14px",
      }}>

        {/* ══════════ SIDEBAR ══════════ */}
        <div style={{
          width: 232, flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 10,
          overflowY: "auto",
        }}>

          {/* Protocol stats */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
            <CardAccent />
            <HexGrid id="hex-proto" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: PP, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: C.muted, marginBottom: 12 }}>
                Protocol
              </div>
              <Stat label="Fixed APY"    value="12%"                        accent={C.green}  />
              <Stat label="Total Staked" value={`${formatCycle(totalStaked)} CYCLE`} accent={C.blue}   />
              <Stat label="Reward Pool"  value={`${formatCycle(rewardPool)} CYCLE`}  accent={C.purple} />
              <Stat label="Network"      value="Sepolia"                    accent={C.blue}   />
            </div>
          </div>

          {/* Wallet card */}
          {isConnected && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ fontFamily: PP, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: C.muted, marginBottom: 10 }}>
                Wallet
              </div>
              <div style={{
                fontFamily: MONO, fontSize: 11, color: C.white,
                background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "8px 10px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{short(address ?? "")}</div>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank" rel="noreferrer"
                style={{ fontFamily: PP, fontSize: 10, color: C.muted, textDecoration: "none", marginTop: 7, display: "block", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >View on Etherscan ↗</a>
            </div>
          )}

          {/* Contracts */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ fontFamily: PP, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: C.muted, marginBottom: 12 }}>
              Contracts
            </div>
            {[
              { label: "CYCLE Token", addr: CYCLE_TOKEN_ADDRESS },
              { label: "Staking",     addr: CYCLE_STAKING_ADDRESS },
            ].map(c => (
              <div key={c.label} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: PP, fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>{c.label}</div>
                <a
                  href={etherscanAddress(c.addr)}
                  target="_blank" rel="noreferrer"
                  style={{ fontFamily: MONO, fontSize: 10, color: C.blue, textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "opacity 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >{c.addr.slice(0, 12)}…{c.addr.slice(-6)} ↗</a>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: "auto", padding: "4px 2px" }}>
            <div style={{ fontFamily: PP, fontSize: 10, color: C.dim, textAlign: "center" }}>
              © 2026 Block Cycle Labs
            </div>
          </div>
        </div>

        {/* ══════════ MAIN CENTER ══════════ */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 12,
          overflow: "hidden", minWidth: 0,
        }}>

          {/* Portfolio header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 18, color: C.white, letterSpacing: "-0.01em" }}>
                My Portfolio
              </div>
              {isConnected && (
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, marginTop: 3 }}>
                  {address}
                </div>
              )}
            </div>
            {isConnected && (
              <button
                onClick={() => refetchTx()}
                style={{
                  fontFamily: PP, fontWeight: 600, fontSize: 11,
                  color: C.muted, background: "rgba(255,255,255,0.07)",
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: "7px 14px", cursor: "pointer", transition: "all 0.18s",
                  letterSpacing: "0.04em",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.white; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.11)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
              >↻ Refresh</button>
            )}
          </div>

          {/* Portfolio cards */}
          {!isConnected ? (
            /* ── Not connected hero ── */
            <div style={{
              position: "relative",
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 18, overflow: "hidden",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "48px 24px", gap: 18, flexShrink: 0,
            }}>
              <CardAccent />
              <HexGrid id="hex-hero" />
              <NodeGraph />
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <BclIcon size={60} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 20, color: C.white, marginBottom: 8 }}>
                    Block Cycle Labs DApp
                  </div>
                  <div style={{ fontFamily: PP, fontSize: 13, color: C.muted, maxWidth: 320, lineHeight: 1.7 }}>
                    Connect your wallet to view your CYCLE balance, staking position, and transaction history on Sepolia.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Portfolio cards row ── */
            <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
              <PortfolioCard
                variant="available"
                balance={balance}
                stakedBalance={stakedBalance}
                pendingRewards={pendingRewards}
                onAction={focusStake}
              />
              <PortfolioCard
                variant={hasStaked ? "staked" : "empty-staked"}
                balance={balance}
                stakedBalance={stakedBalance}
                pendingRewards={pendingRewards}
                onAction={focusStake}
              />
            </div>
          )}

          {/* Transaction history */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 18, flex: 1,
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px 12px",
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: PP, fontWeight: 700, fontSize: 14, color: C.white }}>
                  Transaction History
                </span>
                {txLoading && (
                  <div style={{
                    fontFamily: PP, fontSize: 10, color: C.muted,
                    background: "rgba(255,255,255,0.06)", borderRadius: 20,
                    padding: "2px 9px",
                  }}>Loading…</div>
                )}
              </div>
              {records.length > 0 && (
                <div style={{
                  fontFamily: PP, fontSize: 10, color: C.muted,
                  letterSpacing: "0.06em",
                }}>{records.length} transaction{records.length !== 1 ? "s" : ""}</div>
              )}
            </div>

            {/* Table */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "rgba(4,9,30,0.98)", zIndex: 1 }}>
                  <tr>
                    {["Type", "Amount", "Block", "Transaction"].map(h => (
                      <th key={h} style={{
                        fontFamily: PP, fontWeight: 600, fontSize: 10,
                        letterSpacing: "0.09em", textTransform: "uppercase",
                        color: C.muted, textAlign: "left",
                        padding: "8px 14px",
                        borderBottom: `1px solid rgba(255,255,255,0.07)`,
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txLoading
                    ? <TxSkeleton />
                    : records.length === 0
                      ? <TxEmpty />
                      : records.map((r, i) => <TxRow key={i} record={r} />)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL ══════════ */}
        <div id="stake-panel" style={{
          width: 308, flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 10, overflow: "hidden",
        }}>

          {/* Balance pill */}
          <div style={{
            display: "flex", alignItems: "center",
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: "hidden", flexShrink: 0,
          }}>
            <div style={{
              flex: 1, fontFamily: PP, fontWeight: 800, fontSize: 17,
              color: C.white, padding: "12px 16px", letterSpacing: "-0.01em",
            }}>
              {isConnected ? `${formatCycle(balance)} CYCLE` : "— CYCLE"}
            </div>
            <div style={{
              background: "rgba(255,255,255,0.07)",
              borderLeft: `1px solid ${C.border}`,
              padding: "12px 14px",
              fontFamily: PP, fontWeight: 600, fontSize: 10,
              letterSpacing: "0.10em", textTransform: "uppercase", color: C.muted,
            }}>Balance</div>
          </div>

          {/* Staking panel card */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 18, flex: 1,
            display: "flex", flexDirection: "column", overflow: "hidden",
            position: "relative",
          }}>
            <CardAccent color={`linear-gradient(90deg, ${C.green} 0%, ${C.blue} 50%, transparent 100%)`} />
            <div style={{ flex: 1, overflowY: "auto" }}>
              <StakingPanel />
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />
              <UserPosition />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.30; }
        }
        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 75%);
          background-size: 400% 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
