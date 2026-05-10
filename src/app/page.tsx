"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { StakingPanel } from "@/components/StakingPanel";
import { UserPosition } from "@/components/UserPosition";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { formatCycle } from "@/lib/format";
import {
  etherscanAddress,
  CYCLE_TOKEN_ADDRESS,
  CYCLE_STAKING_ADDRESS,
} from "@/lib/contracts";

type Filter  = "all" | "tokens" | "nfts";
type SideTab = "stake" | "swap";

const PP = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";

const C = {
  pageBg:    '#1565D8',
  navyDeep:  '#0a1540',
  navyCard:  '#0d1b4b',
  navyMid:   '#112060',
  border:    'rgba(255,255,255,0.13)',
  borderMid: 'rgba(255,255,255,0.07)',
  white:     '#ffffff',
  muted:     'rgba(255,255,255,0.55)',
  dim:       'rgba(255,255,255,0.32)',
  green:     '#22c55e',
  cyan:      '#06b6d4',
  purple:    '#a78bfa',
  yellow:    '#facc15',
  blue:      '#60a5fa',
};

/* gradient presets that match Figma vibe */
const CARD_GRADIENTS = [
  'linear-gradient(145deg, #1a0a40 0%, #3b1a8a 100%)',
  'linear-gradient(145deg, #0a1a40 0%, #1a3a8a 100%)',
  'linear-gradient(145deg, #321015 0%, #6b1a3a 100%)',
  'linear-gradient(145deg, #0a1030 0%, #1a2060 100%)',
  'linear-gradient(145deg, #1a1505 0%, #4a3510 100%)',
];

/* ─── BCL Cycle ring ───────────────────────────────────────── */
function CycleRing({ color = '#06b6d4', size = 68 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" stroke={color} strokeWidth="2.5" opacity="0.45"/>
      <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="1.5" opacity="0.30"/>
      <circle cx="32" cy="32" r="9"  fill={color} opacity="0.22"/>
      <circle cx="32" cy="32" r="5"  fill={color} opacity="0.85"/>
      <path d="M32 5 L36.5 13 L27.5 13 Z"  fill={color} opacity="0.85"/>
      <path d="M32 59 L27.5 51 L36.5 51 Z" fill={color} opacity="0.85"/>
      <path d="M5 32 L13 27.5 L13 36.5 Z"  fill={color} opacity="0.85"/>
      <path d="M59 32 L51 36.5 L51 27.5 Z" fill={color} opacity="0.85"/>
    </svg>
  );
}

/* ─── NFT Ape art ──────────────────────────────────────────── */
function NftApe({ warm = true }: { warm?: boolean }) {
  const fur   = warm ? '#8B5A2B' : '#4a4a6a';
  const face  = warm ? '#C4956A' : '#7a7a9a';
  const bg1   = warm ? '#3b1a0a' : '#1a1a3a';
  const bg2   = warm ? '#8b4513' : '#3a3a6a';
  return (
    <svg viewBox="0 0 100 100" width={72} height={72}>
      <defs>
        <radialGradient id={`bg-${warm}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={bg2} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={bg1}/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#bg-${warm})`}/>
      {/* body */}
      <ellipse cx="50" cy="82" rx="32" ry="24" fill={fur}/>
      {/* head */}
      <ellipse cx="50" cy="46" rx="30" ry="28" fill={fur}/>
      {/* face area */}
      <ellipse cx="50" cy="52" rx="21" ry="19" fill={face}/>
      {/* ears */}
      <ellipse cx="20" cy="44" rx="9" ry="11" fill={fur}/>
      <ellipse cx="80" cy="44" rx="9" ry="11" fill={fur}/>
      <ellipse cx="20" cy="44" rx="5" ry="7"  fill={face} opacity="0.5"/>
      <ellipse cx="80" cy="44" rx="5" ry="7"  fill={face} opacity="0.5"/>
      {/* eyes */}
      <circle cx="38" cy="43" r="6" fill="#1a0a0a"/>
      <circle cx="62" cy="43" r="6" fill="#1a0a0a"/>
      <circle cx="40" cy="41" r="2.5" fill="white"/>
      <circle cx="64" cy="41" r="2.5" fill="white"/>
      <circle cx="40" cy="41" r="1.2" fill="#1a0a0a"/>
      <circle cx="64" cy="41" r="1.2" fill="#1a0a0a"/>
      {/* nostrils */}
      <ellipse cx="45" cy="53" rx="3.5" ry="2.5" fill={fur} opacity="0.7"/>
      <ellipse cx="55" cy="53" rx="3.5" ry="2.5" fill={fur} opacity="0.7"/>
      {/* mouth */}
      <path d="M 38 61 Q 50 67 62 61" stroke={fur} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* golden halo */}
      <ellipse cx="50" cy="18" rx="27" ry="7" fill="none" stroke="#FFD700" strokeWidth="3.5" opacity="0.92"/>
    </svg>
  );
}

/* ─── Asset card ───────────────────────────────────────────── */
function AssetCard({
  gradient, name, tokenId, value, staked, isNft, warm,
  onStake, onUnstake,
}: {
  gradient: string; name: string; tokenId: string; value: string;
  staked: boolean; isNft?: boolean; warm?: boolean;
  onStake?: () => void; onUnstake?: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.navyCard,
        border: `1px solid ${staked ? 'rgba(34,197,94,0.35)' : C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-5px)' : 'none',
        boxShadow: hov
          ? `0 16px 36px rgba(0,0,0,0.60), 0 0 0 1px ${staked ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}`
          : '0 2px 10px rgba(0,0,0,0.32)',
        cursor: 'default',
        flexShrink: 0,
        width: 150,
      }}
    >
      {/* Image area */}
      <div style={{
        width: '100%', height: 136,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {isNft
          ? <NftApe warm={warm ?? true} />
          : <CycleRing color={staked ? C.green : C.cyan} size={72} />
        }

        {/* Staked live dot */}
        {staked && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 9, height: 9, borderRadius: '50%',
            background: C.green,
            boxShadow: `0 0 8px ${C.green}`,
            animation: 'livePulse 2s ease-in-out infinite',
          }}/>
        )}

        {/* Token ID */}
        <div style={{
          position: 'absolute', top: 6, left: 8,
          fontFamily: MONO, fontSize: 7.5,
          color: 'rgba(255,255,255,0.42)',
          letterSpacing: '0.02em',
        }}>{tokenId}</div>
      </div>

      {/* Info */}
      <div style={{ padding: '9px 10px 11px' }}>
        <div style={{
          fontFamily: PP, fontWeight: 700, fontSize: 11.5,
          color: '#ffffff', lineHeight: 1.25, marginBottom: 2,
        }}>{name}</div>

        <div style={{
          fontFamily: MONO, fontSize: 10,
          color: C.muted, marginBottom: staked ? 7 : 9,
        }}>≈{value}</div>

        {/* Staked badge */}
        {staked && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: PP, fontWeight: 700, fontSize: 8.5,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            color: C.green,
            background: 'rgba(34,197,94,0.14)',
            border: '1px solid rgba(34,197,94,0.32)',
            borderRadius: 5, padding: '2px 7px', marginBottom: 8,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block' }}/>
            Staked
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={onStake}
            style={{
              flex: 1,
              fontFamily: PP, fontWeight: 700, fontSize: 8,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: staked ? C.green : '#0a1540',
              background: staked ? 'rgba(34,197,94,0.14)' : '#ffffff',
              border: staked ? '1px solid rgba(34,197,94,0.42)' : 'none',
              borderRadius: 6, padding: '5px 3px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = staked ? 'rgba(34,197,94,0.24)' : '#dbeafe';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = staked ? 'rgba(34,197,94,0.14)' : '#ffffff';
            }}
          >{staked ? 'Staked' : 'Edit Stake'}</button>

          <button
            onClick={onUnstake}
            style={{
              flex: 1,
              fontFamily: PP, fontWeight: 700, fontSize: 8,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#ffffff', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 6, padding: '5px 3px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.65)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
            }}
          >Unstake</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TX row ───────────────────────────────────────────────── */
function TxRow({ date, id, type, asset, amount, status, address }: {
  date: string; id: string; type: string; asset: string;
  amount: string; status: 'Completed' | 'Pending' | 'Failed'; address: string;
}) {
  const statusColor = status === 'Completed' ? C.green : status === 'Pending' ? C.yellow : '#f87171';
  const td: React.CSSProperties = {
    fontFamily: PP, fontSize: 12, fontWeight: 500,
    color: 'rgba(255,255,255,0.80)', padding: '11px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  };
  return (
    <tr>
      <td style={td}>{date}</td>
      <td style={{ ...td, fontFamily: MONO, fontSize: 10, color: C.muted }}>{id}</td>
      <td style={td}>{type}</td>
      <td style={{ ...td, fontWeight: 600 }}>{asset}</td>
      <td style={{ ...td, fontFamily: MONO, fontSize: 11 }}>{amount}</td>
      <td style={{ ...td, fontWeight: 700, color: statusColor }}>{status}</td>
      <td style={{ ...td, fontFamily: MONO, fontSize: 10, color: C.muted }}>{address}</td>
    </tr>
  );
}

/* ─── Sidebar stat row ─────────────────────────────────────── */
function StatRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: `1px solid ${C.borderMid}`,
    }}>
      <span style={{ fontFamily: PP, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: C.muted }}>
        {label}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: accent || '#fff' }}>
        {value}
      </span>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────── */
export default function Home() {
  const { isConnected, address } = useAccount();
  const { stakedBalance, pendingRewards, totalStaked, rewardPool } = useStaking();
  const { balance } = useToken();

  const [filter, setFilter]   = useState<Filter>("all");
  const [sideTab, setSideTab] = useState<SideTab>("stake");

  const short    = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
  const hasStaked = stakedBalance > 0n;
  const scrollToStake = () => setSideTab("stake");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />

      {/* Body */}
      <div style={{
        display: 'flex', flex: 1, overflow: 'hidden',
        gap: 12, padding: '0 14px 14px',
      }}>

        {/* ══ SIDEBAR ══ */}
        <div style={{
          width: 256, flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 10,
          overflowY: 'auto', paddingRight: 2,
        }}>
          {/* Brand card */}
          <div style={{
            background: C.navyDeep, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3faf, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 2px rgba(6,182,212,0.35)',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="9" cy="9" r="2.5" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: PP, fontWeight: 800, fontSize: 13.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>BCL DApp</div>
              <div style={{ fontFamily: PP, fontSize: 10, color: C.muted, marginTop: 1 }}>Block Cycle Labs</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: 'livePulse 2s ease-in-out infinite' }}/>
              <span style={{ fontFamily: PP, fontSize: 9, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
            </div>
          </div>

          {/* Wallet info */}
          {isConnected && (
            <div style={{
              background: C.navyDeep, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{ fontFamily: PP, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted, marginBottom: 8 }}>Connected Wallet</div>
              <div style={{
                fontFamily: MONO, fontSize: 11, color: '#fff',
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '8px 10px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{short(address || '')}</div>
              <a href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank" rel="noreferrer"
                style={{ fontFamily: PP, fontSize: 10, color: C.muted, textDecoration: 'none', marginTop: 6, display: 'block' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >View on Etherscan ↗</a>
            </div>
          )}

          {/* Protocol stats */}
          <div style={{
            background: C.navyDeep, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontFamily: PP, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted, marginBottom: 10 }}>Protocol</div>
            <StatRow label="Fixed APY"    value="12%"                          accent={C.green} />
            <StatRow label="Reward Type"  value="Fixed"                        />
            <StatRow label="Total Staked" value={formatCycle(totalStaked)}      accent={C.blue}  />
            <StatRow label="Reward Pool"  value={formatCycle(rewardPool)}       accent={C.purple} />
            <StatRow label="Network"      value="Sepolia"                       accent={C.blue}  />
          </div>

          {/* Contracts */}
          <div style={{
            background: C.navyDeep, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontFamily: PP, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted, marginBottom: 10 }}>Contracts</div>
            {[
              { label: 'CYCLE Token', addr: CYCLE_TOKEN_ADDRESS },
              { label: 'Staking',     addr: CYCLE_STAKING_ADDRESS },
            ].map(c => (
              <div key={c.label} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: PP, fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{c.label}</div>
                <a href={etherscanAddress(c.addr)} target="_blank" rel="noreferrer"
                  style={{ fontFamily: MONO, fontSize: 10, color: C.blue, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >{c.addr.slice(0, 12)}…{c.addr.slice(-6)} ↗</a>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 4px', marginTop: 'auto' }}>
            <div style={{ fontFamily: PP, fontSize: 10, color: C.dim, textAlign: 'center' }}>© 2026 Block Cycle Labs</div>
            <a href="https://bcl.sannisanni.com" target="_blank" rel="noreferrer"
              style={{ fontFamily: PP, fontSize: 10, color: C.muted, textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 2 }}>
              bcl.sannisanni.com ↗
            </a>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
          overflow: 'hidden', minWidth: 0,
        }}>

          {/* Asset grid panel */}
          <div style={{
            background: C.navyDeep, border: `1px solid ${C.border}`,
            borderRadius: 16, flex: 1,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.38)',
          }}>
            {/* Filter tabs */}
            <div style={{
              display: 'flex', borderBottom: `1px solid ${C.border}`,
              padding: '0 8px', flexShrink: 0,
            }}>
              {(['all','tokens','nfts'] as Filter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontFamily: PP, fontWeight: filter === f ? 700 : 500,
                  fontSize: 13, color: filter === f ? '#fff' : C.muted,
                  padding: '13px 18px', background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${filter === f ? '#fff' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.18s', textTransform: 'capitalize',
                }}>
                  {f === 'all' ? 'All' : f === 'tokens' ? 'Tokens' : 'NFTs'}
                </button>
              ))}
            </div>

            {/* Scrollable asset row */}
            <div style={{
              display: 'flex', gap: 12, padding: '16px',
              overflowX: 'auto', flexShrink: 0,
            }}>
              {(filter === 'all' || filter === 'tokens') && (
                <AssetCard
                  gradient={CARD_GRADIENTS[0]}
                  name="Block Cycle Token"
                  tokenId={CYCLE_TOKEN_ADDRESS.slice(0,10)+'…'}
                  value={formatCycle(balance)}
                  staked={false}
                  onStake={scrollToStake}
                  onUnstake={scrollToStake}
                />
              )}
              {hasStaked && (filter === 'all' || filter === 'tokens') && (
                <AssetCard
                  gradient={CARD_GRADIENTS[1]}
                  name="Block Cycle Token"
                  tokenId={CYCLE_STAKING_ADDRESS.slice(0,10)+'…'}
                  value={formatCycle(stakedBalance)}
                  staked={true}
                  onStake={scrollToStake}
                  onUnstake={scrollToStake}
                />
              )}
              {(filter === 'all' || filter === 'nfts') && (
                <>
                  <AssetCard
                    gradient={CARD_GRADIENTS[2]}
                    name="Block Cycle NFT"
                    tokenId="123989989"
                    value="0.228"
                    staked={true}
                    isNft warm={true}
                    onStake={scrollToStake}
                    onUnstake={scrollToStake}
                  />
                  <AssetCard
                    gradient={CARD_GRADIENTS[3]}
                    name="Block Cycle NFT"
                    tokenId="123889988"
                    value="0.878"
                    staked={true}
                    isNft warm={false}
                    onStake={scrollToStake}
                    onUnstake={scrollToStake}
                  />
                </>
              )}
              {filter === 'nfts' && !isConnected && (
                <div style={{ padding: '30px 20px', color: C.muted, fontFamily: PP, fontSize: 13 }}>
                  Connect your wallet to view NFTs
                </div>
              )}
              {!isConnected && filter !== 'nfts' && (
                <div style={{ padding: '30px 20px', color: C.muted, fontFamily: PP, fontSize: 13 }}>
                  Connect your wallet to view assets
                </div>
              )}
            </div>

            {/* Transaction history */}
            <div style={{
              flex: 1, overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              padding: '0 16px 16px', minHeight: 0,
            }}>
              <div style={{
                fontFamily: PP, fontWeight: 700, fontSize: 14,
                color: '#fff', padding: '12px 0 10px',
                borderTop: `1px solid ${C.border}`, flexShrink: 0,
              }}>Transaction History</div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: C.navyDeep, zIndex: 1 }}>
                    <tr>
                      {['Date','ID','Type','Asset','Amount','Status','Wallet Address'].map(h => (
                        <th key={h} style={{
                          fontFamily: PP, fontWeight: 600, fontSize: 10,
                          letterSpacing: '0.07em', textTransform: 'uppercase',
                          color: C.muted, textAlign: 'left',
                          padding: '7px 12px',
                          borderBottom: `1px solid ${C.border}`,
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isConnected ? (
                      <>
                        <TxRow date="05-12-24" id="19993799" type="Token" asset="BCL" amount="5806" status="Completed" address={short(address||'')} />
                        <TxRow date="05-12-24" id="5956899"  type="NFT"   asset="BCL" amount="3"    status="Completed" address={short(address||'')} />
                      </>
                    ) : (
                      <tr><td colSpan={7} style={{
                        padding: '28px 12px', textAlign: 'center',
                        fontFamily: PP, fontSize: 13, color: C.muted,
                      }}>No transactions yet — connect your wallet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{
          width: 320, flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
        }}>

          {/* Balance strip */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: C.navyDeep, border: `1px solid ${C.border}`,
            borderRadius: 10, overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.30)',
          }}>
            <div style={{
              flex: 1, fontFamily: PP, fontWeight: 800, fontSize: 17,
              color: '#fff', padding: '12px 16px', letterSpacing: '-0.01em',
            }}>
              {isConnected ? `${formatCycle(balance)} CYCLE` : '— CYCLE'}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderLeft: `1px solid ${C.border}`,
              padding: '12px 16px',
              fontFamily: PP, fontWeight: 700, fontSize: 10,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: C.muted,
            }}>Balance</div>
          </div>

          {/* Panel card */}
          <div style={{
            background: C.navyDeep, border: `1px solid ${C.border}`,
            borderRadius: 16, flex: 1,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.38)',
          }}>
            {/* Tab bar */}
            <div style={{
              display: 'flex', borderBottom: `1px solid ${C.border}`,
              padding: '0 4px', flexShrink: 0,
            }}>
              {['Stake','Send','Pool'].map((t, i) => (
                <button key={t} style={{
                  fontFamily: PP, fontWeight: i === 0 ? 700 : 500,
                  fontSize: 13, color: i === 0 ? '#fff' : C.muted,
                  padding: '13px 18px', background: 'transparent', border: 'none',
                  borderBottom: i === 0 ? '2px solid #fff' : '2px solid transparent',
                  cursor: i === 0 ? 'default' : 'not-allowed',
                  opacity: i === 0 ? 1 : 0.42,
                  transition: 'all 0.18s',
                }} title={i !== 0 ? 'Coming soon' : undefined}>{t}</button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <StakingPanel />
              <div style={{ height: 1, background: C.borderMid, margin: '0 16px' }} />
              <UserPosition />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; box-shadow:0 0 6px #22c55e; }
          50%      { opacity:0.35; box-shadow:0 0 2px #22c55e; }
        }
      `}</style>
    </div>
  );
}
