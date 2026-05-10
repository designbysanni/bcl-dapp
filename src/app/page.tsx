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
import { etherscanAddress, CYCLE_TOKEN_ADDRESS, CYCLE_STAKING_ADDRESS } from "@/lib/contracts";

/* ─── Design tokens ───────────────────────────────────────── */
const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

const C = {
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

/* ─── HexGrid SVG decoration ──────────────────────────────── */
function HexGrid({ id }: { id: string }) {
  return (
    <svg aria-hidden style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.035 }}>
      <defs>
        <pattern id={id} x="0" y="0" width="56" height="48.5" patternUnits="userSpaceOnUse">
          <polygon points="28,1.5 53,14.5 53,40.5 28,53.5 3,40.5 3,14.5" fill="none" stroke="white" strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`}/>
    </svg>
  );
}

/* ─── Gradient accent bar ─────────────────────────────────── */
function CardAccent({ color }: { color?: string }) {
  return (
    <div style={{
      position:"absolute", top:0, left:0, right:0, height:2,
      background: color ?? `linear-gradient(90deg,${C.blue},${C.purple},transparent)`,
      borderRadius:"16px 16px 0 0",
    }}/>
  );
}

/* ─── BCL logo circle ─────────────────────────────────────── */
function BclIcon({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:"linear-gradient(135deg,#1a3baf 0%,#2563EB 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      boxShadow:"0 0 0 1.5px rgba(59,130,246,0.45),0 4px 12px rgba(0,0,0,0.4)",
    }}>
      <img src={LOGO} width={size*0.58} height={size*0.58} alt="BCL" style={{ objectFit:"contain" }}/>
    </div>
  );
}

/* ─── Sidebar stat row ────────────────────────────────────── */
function Stat({ label, value, accent }: { label:string; value:string; accent?:string }) {
  return (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ fontFamily:PP, fontSize:9.5, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.09em", color:C.muted }}>{label}</span>
      <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:accent??C.white }}>{value}</span>
    </div>
  );
}

/* ─── Asset card (Figma compact portrait) ─────────────────── */
interface AssetCardProps {
  variant: "available" | "staked";
  balance: bigint;
  stakedBalance: bigint;
  pendingRewards: bigint;
  onAction: () => void;
}

function AssetCard({ variant, balance, stakedBalance, pendingRewards, onAction }: AssetCardProps) {
  const isAvail = variant === "available";
  const amount  = isAvail ? balance : stakedBalance;
  const accent  = isAvail
    ? `linear-gradient(90deg,${C.blue} 0%,${C.purple} 60%,transparent 100%)`
    : `linear-gradient(90deg,${C.green} 0%,${C.blue} 60%,transparent 100%)`;

  return (
    <div
      style={{
        position:"relative",
        background:C.card,
        border:`1px solid ${C.border}`,
        borderRadius:16,
        padding:"16px 14px 14px",
        overflow:"hidden",
        display:"flex", flexDirection:"column", gap:10,
        minWidth:168, width:168, flexShrink:0,
        transition:"border-color 0.2s,box-shadow 0.2s",
        cursor:"default",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.borderA;
        (e.currentTarget as HTMLDivElement).style.boxShadow  = "0 8px 32px rgba(0,0,0,0.55)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
        (e.currentTarget as HTMLDivElement).style.boxShadow  = "none";
      }}
    >
      <CardAccent color={accent}/>
      <HexGrid id={`hex-${variant}`}/>

      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:10 }}>

        {/* Icon + badge */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <BclIcon size={34}/>
          <span style={{
            fontFamily:PP, fontWeight:700, fontSize:8.5, letterSpacing:"0.10em", textTransform:"uppercase",
            color: isAvail ? C.blue : C.green,
            background: isAvail ? "rgba(59,130,246,0.12)" : "rgba(16,185,129,0.12)",
            border:`1px solid ${isAvail?"rgba(59,130,246,0.25)":"rgba(16,185,129,0.25)"}`,
            borderRadius:20, padding:"3px 8px",
          }}>
            {isAvail ? "Wallet" : "Staked"}
          </span>
        </div>

        {/* Token name */}
        <div>
          <div style={{ fontFamily:PP, fontWeight:700, fontSize:12.5, color:C.white, lineHeight:1.3 }}>CYCLE</div>
          <div style={{ fontFamily:PP, fontSize:9.5, color:C.muted, marginTop:1 }}>Block Cycle Token</div>
        </div>

        {/* Amount */}
        <div>
          <div style={{ fontFamily:MONO, fontWeight:700, fontSize:17, color:C.white, lineHeight:1 }}>
            {formatCycle(amount)}
          </div>
          <div style={{ fontFamily:PP, fontSize:9, color:C.dim, marginTop:3, letterSpacing:"0.10em" }}>CYCLE</div>
        </div>

        {/* Rewards row for staked */}
        {!isAvail && (
          <div style={{
            background:"rgba(16,185,129,0.08)",
            border:"1px solid rgba(16,185,129,0.18)",
            borderRadius:8, padding:"6px 8px",
            display:"flex", alignItems:"center", gap:5,
          }}>
            <div style={{
              width:5, height:5, borderRadius:"50%", background:C.green, flexShrink:0,
              boxShadow:`0 0 5px ${C.green}`, animation:"livePulse 2s ease-in-out infinite",
            }}/>
            <div>
              <div style={{ fontFamily:PP, fontSize:8, fontWeight:700, color:C.green, textTransform:"uppercase", letterSpacing:"0.08em" }}>Rewards</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
                <RewardCounter baseRewards={pendingRewards} stakedBalance={stakedBalance}/>
                <span style={{ fontFamily:PP, fontSize:8, color:"rgba(255,255,255,0.38)" }}>CYCLE</span>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", gap:5, marginTop:2 }}>
          <button
            onClick={onAction}
            style={{
              flex:1,
              fontFamily:PP, fontWeight:700, fontSize:10, letterSpacing:"0.04em", textTransform:"uppercase",
              color:C.white,
              background: isAvail ? "linear-gradient(135deg,#1d4ed8,#2563EB)" : "rgba(16,185,129,0.18)",
              border: isAvail ? "none" : "1px solid rgba(16,185,129,0.35)",
              borderRadius:8, padding:"7px 6px",
              cursor:"pointer", transition:"opacity 0.18s",
              boxShadow: isAvail ? "0 3px 10px rgba(37,99,235,0.35)" : "none",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.82"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            {isAvail ? "Stake →" : "Claim →"}
          </button>
          <a
            href={etherscanAddress(isAvail ? CYCLE_TOKEN_ADDRESS : CYCLE_STAKING_ADDRESS)}
            target="_blank" rel="noreferrer"
            style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              width:30, borderRadius:8,
              background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
              color:C.muted, textDecoration:"none", fontSize:12, transition:"all 0.18s",
            }}
            title="Etherscan"
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.white; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.muted; }}
          >↗</a>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty no-position card ──────────────────────────────── */
function EmptyStakedCard({ onAction }: { onAction: () => void }) {
  return (
    <div style={{
      position:"relative",
      background:C.card, border:`1px solid ${C.border}`,
      borderRadius:16, padding:"16px 14px 14px",
      overflow:"hidden", minWidth:168, width:168, flexShrink:0,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10,
    }}>
      <HexGrid id="hex-empty"/>
      <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
        <div style={{
          width:40, height:40, borderRadius:"50%",
          background:"rgba(255,255,255,0.05)", border:"1px dashed rgba(255,255,255,0.15)",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ fontFamily:PP, fontWeight:600, fontSize:11, color:"rgba(255,255,255,0.50)", marginBottom:4 }}>No position</div>
        <div style={{ fontFamily:PP, fontSize:10, color:C.muted, lineHeight:1.5 }}>Earn 12% APY</div>
        <button
          onClick={onAction}
          style={{
            marginTop:10, fontFamily:PP, fontWeight:700, fontSize:10, letterSpacing:"0.04em", textTransform:"uppercase",
            color:C.white, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.16)",
            borderRadius:8, padding:"7px 12px", cursor:"pointer", width:"100%",
          }}
        >Stake Now →</button>
      </div>
    </div>
  );
}

/* ─── TX badge ────────────────────────────────────────────── */
function TxBadge({ type }: { type: TxRecord["type"] }) {
  const map = {
    Stake:   { color:C.blue,   bg:"rgba(59,130,246,0.12)",  border:"rgba(59,130,246,0.25)"  },
    Unstake: { color:C.yellow, bg:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.25)"  },
    Claim:   { color:C.green,  bg:"rgba(16,185,129,0.12)",  border:"rgba(16,185,129,0.25)"  },
  }[type];
  return (
    <span style={{
      fontFamily:PP, fontWeight:700, fontSize:9.5, letterSpacing:"0.07em", textTransform:"uppercase",
      color:map.color, background:map.bg, border:`1px solid ${map.border}`,
      borderRadius:20, padding:"3px 9px", display:"inline-flex", alignItems:"center",
    }}>{type}</span>
  );
}

/* ─── TX row ──────────────────────────────────────────────── */
function TxRow({ record }: { record: TxRecord }) {
  const short = (h: string) => h ? `${h.slice(0,8)}…${h.slice(-6)}` : "—";
  const td: React.CSSProperties = {
    fontFamily:PP, fontSize:12, fontWeight:400, color:"rgba(255,255,255,0.78)",
    padding:"11px 12px", borderBottom:"1px solid rgba(255,255,255,0.04)", verticalAlign:"middle",
  };
  return (
    <tr
      style={{ transition:"background 0.15s" }}
      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
    >
      <td style={td}><TxBadge type={record.type}/></td>
      <td style={{ ...td, fontFamily:MONO, fontSize:12.5, fontWeight:700, color:C.white }}>
        {formatCycle(record.amount)}
        <span style={{ fontFamily:PP, fontSize:9.5, color:C.muted, marginLeft:4, fontWeight:400 }}>CYCLE</span>
      </td>
      <td style={{ ...td, fontFamily:MONO, fontSize:10.5, color:C.muted }}>#{record.blockNumber.toLocaleString()}</td>
      <td style={td}>
        <a href={`https://sepolia.etherscan.io/tx/${record.hash}`} target="_blank" rel="noreferrer"
          style={{ fontFamily:MONO, fontSize:10.5, color:C.blue, textDecoration:"none" }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"}
        >{short(record.hash)} ↗</a>
      </td>
    </tr>
  );
}

function TxEmpty() {
  return (
    <tr><td colSpan={4}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 20px", gap:8 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
        <div style={{ fontFamily:PP, fontWeight:600, fontSize:12.5, color:"rgba(255,255,255,0.38)" }}>No transactions yet</div>
        <div style={{ fontFamily:PP, fontSize:11, color:C.muted, textAlign:"center" }}>Your staking activity on Sepolia will appear here</div>
      </div>
    </td></tr>
  );
}

function TxSkeleton() {
  return (
    <>
      {[1,2,3].map(i => (
        <tr key={i}>
          {[70,140,90,160].map((w,j) => (
            <td key={j} style={{ padding:"11px 12px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div className="skeleton" style={{ width:w, height:13, borderRadius:6 }}/>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Connect-wallet hero ─────────────────────────────────── */
function ConnectHero() {
  return (
    <div style={{
      position:"relative",
      background:C.card, border:`1px solid ${C.border}`,
      borderRadius:18, overflow:"hidden",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"52px 24px", gap:16, flexShrink:0,
    }}>
      <CardAccent/>
      <HexGrid id="hex-hero"/>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:14, textAlign:"center" }}>
        <BclIcon size={62}/>
        <div>
          <div style={{ fontFamily:PP, fontWeight:700, fontSize:20, color:C.white, marginBottom:8 }}>Block Cycle Labs DApp</div>
          <div style={{ fontFamily:PP, fontSize:13, color:C.muted, maxWidth:320, lineHeight:1.75 }}>
            Connect your wallet to view your CYCLE balance, staking position, and start earning 12% APY on Sepolia.
          </div>
        </div>
        <div style={{
          display:"flex", gap:20, marginTop:4,
          fontFamily:PP, fontSize:11, color:C.dim, flexWrap:"wrap", justifyContent:"center",
        }}>
          {["12% Fixed APY","No Lockup Period","Sepolia Testnet"].map(f => (
            <span key={f} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ color:C.green }}>✓</span> {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Asset filter tabs ───────────────────────────────────── */
type AssetFilter = "all" | "tokens" | "nfts";

function FilterTabs({ active, onChange }: { active: AssetFilter; onChange: (f: AssetFilter) => void }) {
  const tabs: { id: AssetFilter; label: string }[] = [
    { id:"all",    label:"All"    },
    { id:"tokens", label:"Tokens" },
    { id:"nfts",   label:"NFTs"   },
  ];
  return (
    <div style={{ display:"flex", gap:4 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          fontFamily:PP, fontWeight:700, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase",
          color: active === t.id ? C.white : C.muted,
          background: active === t.id ? "rgba(255,255,255,0.12)" : "transparent",
          border: active === t.id ? `1px solid ${C.borderA}` : "1px solid transparent",
          borderRadius:20, padding:"5px 14px",
          cursor:"pointer", transition:"all 0.16s",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function Home() {
  const { isConnected, address } = useAccount();
  const { stakedBalance, pendingRewards, totalStaked, rewardPool } = useStaking();
  const { balance } = useToken();
  const { records, isLoading: txLoading, refetch: refetchTx } = useTransactionHistory();
  const { isMobile, isTablet, isDesktop } = useWindowSize();

  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [showActionPanel, setShowActionPanel] = useState(false);

  const hasStaked = stakedBalance > 0n;
  const short = (a: string) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : "";

  const focusAction = () => {
    if (isMobile) setShowActionPanel(true);
    document.getElementById("action-panel")?.scrollIntoView({ behavior:"smooth" });
  };

  /* visible asset cards based on filter */
  const showTokenCards = assetFilter === "all" || assetFilter === "tokens";
  const showNftNote    = assetFilter === "nfts";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
      <Navbar onStakeClick={focusAction}/>

      {/* ── Body ── */}
      <div style={{
        display:"flex", flex:1, overflow:"hidden",
        gap: isMobile ? 0 : 12,
        padding: isMobile ? "0 10px 10px" : isTablet ? "0 12px 12px" : "0 14px 14px",
      }}>

        {/* ══ SIDEBAR (desktop only) ══ */}
        {isDesktop && (
          <div style={{
            width:224, flexShrink:0,
            display:"flex", flexDirection:"column", gap:10,
            overflowY:"auto",
          }}>
            {/* Protocol stats */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
              <CardAccent/>
              <HexGrid id="hex-proto"/>
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ fontFamily:PP, fontSize:8.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.13em", color:C.muted, marginBottom:12 }}>Protocol</div>
                <Stat label="Fixed APY"    value="12%"                               accent={C.green} />
                <Stat label="Total Staked" value={`${formatCycle(totalStaked)} CYCLE`} accent={C.blue}  />
                <Stat label="Reward Pool"  value={`${formatCycle(rewardPool)} CYCLE`}  accent={C.purple}/>
                <Stat label="Network"      value="Sepolia"                            accent={C.blue}  />
              </div>
            </div>

            {/* Wallet */}
            {isConnected && (
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px" }}>
                <div style={{ fontFamily:PP, fontSize:8.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.13em", color:C.muted, marginBottom:10 }}>Wallet</div>
                <div style={{
                  fontFamily:MONO, fontSize:10.5, color:C.white,
                  background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
                  borderRadius:8, padding:"8px 10px",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>{short(address ?? "")}</div>
                <a href={`https://sepolia.etherscan.io/address/${address}`} target="_blank" rel="noreferrer"
                  style={{ fontFamily:PP, fontSize:10, color:C.muted, textDecoration:"none", marginTop:6, display:"block", transition:"color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.white)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                >View on Etherscan ↗</a>
              </div>
            )}

            {/* Contracts */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 18px" }}>
              <div style={{ fontFamily:PP, fontSize:8.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.13em", color:C.muted, marginBottom:12 }}>Contracts</div>
              {[
                { label:"CYCLE Token", addr:CYCLE_TOKEN_ADDRESS   },
                { label:"Staking",     addr:CYCLE_STAKING_ADDRESS },
              ].map(c => (
                <div key={c.label} style={{ marginBottom:11 }}>
                  <div style={{ fontFamily:PP, fontSize:8.5, color:C.dim, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:3 }}>{c.label}</div>
                  <a href={etherscanAddress(c.addr)} target="_blank" rel="noreferrer"
                    style={{ fontFamily:MONO, fontSize:9.5, color:C.blue, textDecoration:"none", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", transition:"opacity 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >{c.addr.slice(0,12)}…{c.addr.slice(-6)} ↗</a>
                </div>
              ))}
            </div>

            <div style={{ marginTop:"auto", padding:"4px 2px" }}>
              <div style={{ fontFamily:PP, fontSize:9.5, color:C.dim, textAlign:"center" }}>© 2026 Block Cycle Labs</div>
            </div>
          </div>
        )}

        {/* ══ MAIN CENTER ══ */}
        <div style={{
          flex:1, display:"flex", flexDirection:"column", gap:12,
          overflow:"hidden", minWidth:0,
        }}>

          {/* Portfolio header */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0,
            paddingTop: isMobile ? 8 : 0,
          }}>
            <div>
              <div style={{ fontFamily:PP, fontWeight:700, fontSize: isMobile ? 16 : 18, color:C.white, letterSpacing:"-0.01em" }}>
                My Portfolio
              </div>
              {isConnected && (
                <div style={{ fontFamily:MONO, fontSize: isMobile ? 9.5 : 10.5, color:C.muted, marginTop:2 }}>
                  {isMobile ? short(address ?? "") : address}
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {/* Protocol stats pill on mobile/tablet */}
              {!isDesktop && (
                <div style={{
                  display:"flex", gap:12, alignItems:"center",
                  background:C.card, border:`1px solid ${C.border}`,
                  borderRadius:20, padding:"6px 14px",
                  fontFamily:PP, fontSize:10.5, fontWeight:700,
                }}>
                  <span style={{ color:C.green }}>APY 12%</span>
                  <span style={{ color:C.dim }}>|</span>
                  <span style={{ color:C.muted }}>Sepolia</span>
                </div>
              )}
              {isConnected && (
                <button
                  onClick={() => refetchTx()}
                  style={{
                    fontFamily:PP, fontWeight:600, fontSize:11, color:C.muted,
                    background:"rgba(255,255,255,0.07)", border:`1px solid ${C.border}`,
                    borderRadius:8, padding:"7px 12px", cursor:"pointer", transition:"all 0.18s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.white; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.11)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                >↻ Refresh</button>
              )}
            </div>
          </div>

          {/* Asset section */}
          {!isConnected ? (
            <ConnectHero/>
          ) : (
            <div style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:18, padding:"16px 18px", flexShrink:0,
              position:"relative", overflow:"hidden",
            }}>
              <CardAccent/>
              {/* Filter tabs + balance header */}
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <FilterTabs active={assetFilter} onChange={setAssetFilter}/>
                  <div style={{
                    fontFamily:MONO, fontWeight:800, fontSize: isMobile ? 14 : 16,
                    color:C.white, letterSpacing:"-0.01em",
                  }}>
                    {formatCycle(balance + stakedBalance)}
                    <span style={{ fontFamily:PP, fontSize:10, color:C.muted, marginLeft:6, fontWeight:400 }}>CYCLE total</span>
                  </div>
                </div>

                {/* Horizontal scrollable card grid */}
                <div style={{
                  display:"flex", gap:12, overflowX:"auto", paddingBottom:8,
                  scrollbarWidth:"thin",
                }}>
                  {showNftNote ? (
                    <div style={{
                      display:"flex", alignItems:"center", justifyContent:"center",
                      width:"100%", padding:"24px 0",
                      fontFamily:PP, fontSize:12, color:C.muted,
                    }}>
                      No NFTs in this wallet on Sepolia
                    </div>
                  ) : (
                    <>
                      {showTokenCards && (
                        <AssetCard
                          variant="available"
                          balance={balance}
                          stakedBalance={stakedBalance}
                          pendingRewards={pendingRewards}
                          onAction={focusAction}
                        />
                      )}
                      {showTokenCards && (
                        hasStaked
                          ? <AssetCard
                              variant="staked"
                              balance={balance}
                              stakedBalance={stakedBalance}
                              pendingRewards={pendingRewards}
                              onAction={focusAction}
                            />
                          : <EmptyStakedCard onAction={focusAction}/>
                      )}
                      {/* Placeholder future asset slots */}
                      {showTokenCards && assetFilter === "all" && (
                        <div style={{
                          minWidth:168, width:168, flexShrink:0,
                          background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.10)",
                          borderRadius:16, display:"flex", flexDirection:"column",
                          alignItems:"center", justifyContent:"center", gap:8, padding:16,
                        }}>
                          <div style={{
                            width:36, height:36, borderRadius:"50%",
                            background:"rgba(255,255,255,0.05)", border:"1px dashed rgba(255,255,255,0.12)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:18, color:"rgba(255,255,255,0.20)",
                          }}>+</div>
                          <div style={{ fontFamily:PP, fontSize:10, color:"rgba(255,255,255,0.25)", textAlign:"center" }}>More assets coming soon</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile ActionPanel — inline below assets */}
          {isMobile && (
            <div id="action-panel" style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:18, overflow:"hidden", flexShrink:0,
              position:"relative",
            }}>
              <CardAccent color={`linear-gradient(90deg,${C.green} 0%,${C.blue} 50%,transparent 100%)`}/>
              <ActionPanel/>
            </div>
          )}

          {/* Transaction history */}
          <div style={{
            background:C.card, border:`1px solid ${C.border}`,
            borderRadius:18, flex:1,
            display:"flex", flexDirection:"column", overflow:"hidden",
          }}>
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 18px 12px",
              borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:PP, fontWeight:700, fontSize:14, color:C.white }}>Transaction History</span>
                {txLoading && (
                  <div style={{ fontFamily:PP, fontSize:10, color:C.muted, background:"rgba(255,255,255,0.06)", borderRadius:20, padding:"2px 9px" }}>Loading…</div>
                )}
              </div>
              {records.length > 0 && (
                <div style={{ fontFamily:PP, fontSize:10, color:C.muted }}>
                  {records.length} tx{records.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div style={{ overflowY:"auto", flex:1 }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead style={{ position:"sticky", top:0, background:"rgba(4,9,30,0.98)", zIndex:1 }}>
                  <tr>
                    {["Type","Amount","Block","Transaction"].map(h => (
                      <th key={h} style={{
                        fontFamily:PP, fontWeight:600, fontSize:9.5, letterSpacing:"0.09em",
                        textTransform:"uppercase", color:C.muted, textAlign:"left",
                        padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,0.07)", whiteSpace:"nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txLoading
                    ? <TxSkeleton/>
                    : records.length === 0
                      ? <TxEmpty/>
                      : records.map((r,i) => <TxRow key={i} record={r}/>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL (desktop + tablet) ══ */}
        {!isMobile && (
          <div id="action-panel" style={{
            width: isTablet ? 280 : 308, flexShrink:0,
            display:"flex", flexDirection:"column", gap:10, overflow:"hidden",
          }}>
            {/* Balance pill */}
            <div style={{
              display:"flex", alignItems:"center",
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:12, overflow:"hidden", flexShrink:0,
            }}>
              <div style={{
                flex:1, fontFamily:PP, fontWeight:800, fontSize:16, color:C.white,
                padding:"12px 16px", letterSpacing:"-0.01em",
              }}>
                {isConnected ? `${formatCycle(balance)} CYCLE` : "— CYCLE"}
              </div>
              <div style={{
                background:"rgba(255,255,255,0.07)", borderLeft:`1px solid ${C.border}`,
                padding:"12px 14px", fontFamily:PP, fontWeight:600, fontSize:9.5,
                letterSpacing:"0.10em", textTransform:"uppercase", color:C.muted,
              }}>Balance</div>
            </div>

            {/* Action panel card */}
            <div style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:18, flex:1,
              display:"flex", flexDirection:"column", overflow:"hidden", position:"relative",
            }}>
              <CardAccent color={`linear-gradient(90deg,${C.green} 0%,${C.blue} 50%,transparent 100%)`}/>
              <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
                <ActionPanel/>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.30} }
      `}</style>
    </div>
  );
}
