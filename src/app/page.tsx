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

/* ─── Figma-exact color palette ─────────────────────────── */
const C = {
  pageBg:    '#1565D8',
  navyDeep:  '#0a1540',
  navyCard:  '#0d1b4b',
  navyMid:   '#112060',
  navyLight: '#1a2d7a',
  border:    'rgba(255,255,255,0.11)',
  borderMid: 'rgba(255,255,255,0.07)',
  white:     '#ffffff',
  muted:     'rgba(255,255,255,0.45)',
  dim:       'rgba(255,255,255,0.22)',
  green:     '#22c55e',
  cyan:      '#06b6d4',
  purple:    '#a78bfa',
  yellow:    '#facc15',
};

/* ─── Asset card gradient presets (Figma vibe) ──────────── */
const CARD_GRADIENTS = [
  'linear-gradient(145deg, #1a0a40 0%, #3b1a8a 100%)',   // purple
  'linear-gradient(145deg, #0a1a40 0%, #1a3a8a 100%)',   // blue
  'linear-gradient(145deg, #1a0a20 0%, #6b1a5a 100%)',   // magenta
  'linear-gradient(145deg, #0a1a10 0%, #1a4a2a 100%)',   // dark green
  'linear-gradient(145deg, #1a1a0a 0%, #4a3a0a 100%)',   // amber
];

/* ─── Cycle ring SVG ────────────────────────────────────── */
function CycleRing({ color = '#06b6d4', size = 64 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Outer ring */}
      <circle cx="32" cy="32" r="28" stroke={color} strokeWidth="2" opacity="0.50"/>
      {/* Mid ring */}
      <circle cx="32" cy="32" r="19" stroke={color} strokeWidth="1.5" opacity="0.35"/>
      {/* Core */}
      <circle cx="32" cy="32" r="8" fill={color} opacity="0.25"/>
      <circle cx="32" cy="32" r="4.5" fill={color} opacity="0.75"/>
      {/* Directional arrows */}
      <path d="M32 6 L36 13 L28 13 Z" fill={color} opacity="0.80"/>
      <path d="M32 58 L28 51 L36 51 Z" fill={color} opacity="0.80"/>
      <path d="M6 32 L13 28 L13 36 Z" fill={color} opacity="0.80"/>
      <path d="M58 32 L51 36 L51 28 Z" fill={color} opacity="0.80"/>
    </svg>
  );
}

/* ─── Asset card ────────────────────────────────────────── */
function AssetCard({
  gradient, name, tokenId, value,
  staked, isNft, onStake, onUnstake,
}: {
  gradient: string; name: string; tokenId: string; value: string;
  staked: boolean; isNft?: boolean;
  onStake?: () => void; onUnstake?: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.navyCard,
        border: `1px solid ${staked ? 'rgba(34,197,94,0.30)' : C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.55)' : '0 2px 8px rgba(0,0,0,0.30)',
        cursor: 'default',
        flexShrink: 0,
        width: 148,
      }}
    >
      {/* Image area */}
      <div style={{
        width: '100%', height: 130,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {isNft
          ? <div style={{ fontSize: 52 }}>🦧</div>
          : <CycleRing color={staked ? C.green : C.cyan} size={68} />
        }
        {staked && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 9, height: 9, borderRadius: '50%',
            background: C.green,
            boxShadow: `0 0 8px ${C.green}`,
            animation: 'livePulse 2s ease-in-out infinite',
          }}/>
        )}
        {/* Token ID top-left */}
        <div style={{
          position: 'absolute', top: 5, left: 7,
          fontFamily: "'Space Mono', monospace",
          fontSize: 8, color: 'rgba(255,255,255,0.38)',
        }}>{tokenId}</div>
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{
          fontFamily: "'Exo 2', sans-serif",
          fontWeight: 700, fontSize: 12,
          color: '#ffffff', lineHeight: 1.3, marginBottom: 2,
        }}>{name}</div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, color: C.muted, marginBottom: 8,
        }}>≈{value}</div>

        {staked && (
          <div style={{
            display: 'inline-block',
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 700, fontSize: 8,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: C.green,
            background: 'rgba(34,197,94,0.13)',
            border: '1px solid rgba(34,197,94,0.30)',
            borderRadius: 4, padding: '2px 6px', marginBottom: 8,
          }}>Staked</div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={onStake} style={{
            flex: 1,
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 800, fontSize: 8,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            color: '#0a1540', background: '#ffffff',
            border: 'none', borderRadius: 5, padding: '5px 2px',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
          >{staked ? 'Edit Stake' : 'Stake'}</button>

          <button onClick={onUnstake} style={{
            flex: 1,
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 800, fontSize: 8,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            color: '#ffffff', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.32)',
            borderRadius: 5, padding: '5px 2px',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.32)'; }}
          >Unstake</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TX row ────────────────────────────────────────────── */
function TxRow({ date, id, type, asset, amount, status, address }: {
  date: string; id: string; type: string; asset: string;
  amount: string; status: 'Completed' | 'Pending' | 'Failed'; address: string;
}) {
  const statusColor = status === 'Completed' ? C.green : status === 'Pending' ? C.yellow : '#f87171';
  const td: React.CSSProperties = {
    fontFamily: "'Exo 2', sans-serif", fontSize: 12,
    color: 'rgba(255,255,255,0.75)', padding: '10px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  };
  return (
    <tr>
      <td style={td}>{date}</td>
      <td style={{ ...td, fontFamily: "'Space Mono',monospace", fontSize: 10, color: C.muted }}>{id}</td>
      <td style={td}>{type}</td>
      <td style={td}>{asset}</td>
      <td style={td}>{amount}</td>
      <td style={{ ...td, fontWeight: 700, color: statusColor }}>{status}</td>
      <td style={{ ...td, fontFamily: "'Space Mono',monospace", fontSize: 10, color: C.muted }}>{address}</td>
    </tr>
  );
}

/* ─── Sidebar stat row ──────────────────────────────────── */
function StatRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: `1px solid ${C.borderMid}`,
    }}>
      <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: C.muted }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: accent || '#fff' }}>
        {value}
      </span>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function Home() {
  const { isConnected, address } = useAccount();
  const { stakedBalance, pendingRewards, totalStaked, rewardPool } = useStaking();
  const { balance } = useToken();

  const [filter, setFilter]   = useState<Filter>("all");
  const [sideTab, setSideTab] = useState<SideTab>("stake");

  const short = (a: string) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
  const hasStaked = stakedBalance > 0n;

  const scrollToStake = () => setSideTab("stake");

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Body: sidebar + main ── */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        gap: 12,
        padding: '0 14px 14px',
      }}>

        {/* ══════════════════════════════════════
            SIDEBAR (left)
        ══════════════════════════════════════ */}
        <div style={{
          width: 260,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflowY: 'auto',
          paddingRight: 2,
        }}>

          {/* Logo / brand card */}
          <div style={{
            background: C.navyDeep,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: '16px',
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
              <div style={{ fontFamily: "'Exo 2',sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>BCL DApp</div>
              <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: C.muted, marginTop: 1 }}>Block Cycle Labs</div>
            </div>
            {/* Live dot */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: 'livePulse 2s ease-in-out infinite' }}/>
              <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
            </div>
          </div>

          {/* Wallet info */}
          {isConnected && (
            <div style={{
              background: C.navyDeep,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: '14px 16px',
            }}>
              <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted, marginBottom: 8 }}>Connected Wallet</div>
              <div style={{
                fontFamily: "'Space Mono',monospace", fontSize: 11,
                color: '#fff', background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 10px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{short(address || '')}</div>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank" rel="noreferrer"
                style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: C.muted, textDecoration: 'none', marginTop: 6, display: 'block' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >View on Etherscan ↗</a>
            </div>
          )}

          {/* Protocol stats */}
          <div style={{
            background: C.navyDeep,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted, marginBottom: 10 }}>Protocol</div>
            <StatRow label="Fixed APY"     value="12%"                         accent={C.green}  />
            <StatRow label="Reward Type"   value="Fixed"                       />
            <StatRow label="Total Staked"  value={`${formatCycle(totalStaked)}`} accent="#60a5fa" />
            <StatRow label="Reward Pool"   value={`${formatCycle(rewardPool)}`}  accent={C.purple} />
            <div style={{ borderBottom: 'none', paddingTop: 4 }}>
              <StatRow label="Network" value="Sepolia" accent="#60a5fa" />
            </div>
          </div>

          {/* Contracts */}
          <div style={{
            background: C.navyDeep,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted, marginBottom: 10 }}>Contracts</div>
            {[
              { label: 'CYCLE Token', addr: CYCLE_TOKEN_ADDRESS },
              { label: 'Staking',     addr: CYCLE_STAKING_ADDRESS },
            ].map(c => (
              <div key={c.label} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 3 }}>{c.label}</div>
                <a
                  href={etherscanAddress(c.addr)}
                  target="_blank" rel="noreferrer"
                  style={{
                    fontFamily: "'Space Mono',monospace", fontSize: 10,
                    color: '#60a5fa', textDecoration: 'none',
                    display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >{c.addr.slice(0, 12)}…{c.addr.slice(-6)} ↗</a>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 4px', marginTop: 'auto' }}>
            <div style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: C.dim, textAlign: 'center' }}>
              © 2026 Block Cycle Labs
            </div>
            <a href="https://bcl.sannisanni.com" target="_blank" rel="noreferrer"
              style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 10, color: C.muted, textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 2 }}>
              bcl.sannisanni.com ↗
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════
            MAIN CONTENT (center)
        ══════════════════════════════════════ */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflow: 'hidden',
          minWidth: 0,
        }}>

          {/* ── Asset grid card ── */}
          <div style={{
            background: C.navyDeep,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          }}>
            {/* Filter tabs */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${C.border}`,
              padding: '0 8px',
              flexShrink: 0,
            }}>
              {(['all','tokens','nfts'] as Filter[]).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontFamily: "'Exo 2',sans-serif",
                  fontWeight: filter === f ? 700 : 600,
                  fontSize: 13,
                  color: filter === f ? '#fff' : C.muted,
                  padding: '13px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${filter === f ? '#fff' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  textTransform: 'capitalize',
                }}>
                  {f === 'all' ? 'All' : f === 'tokens' ? 'Tokens' : 'NFTs'}
                </button>
              ))}
            </div>

            {/* Scrollable asset area */}
            <div style={{
              display: 'flex',
              gap: 12,
              padding: '16px',
              overflowX: 'auto',
              flexShrink: 0,
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
              {filter === 'nfts' && (
                <div style={{ padding: '30px 20px', color: C.muted, fontFamily: "'Exo 2',sans-serif", fontSize: 13 }}>
                  No NFTs found in this wallet
                </div>
              )}
              {!isConnected && filter !== 'nfts' && (
                <div style={{ padding: '30px 20px', color: C.muted, fontFamily: "'Exo 2',sans-serif", fontSize: 13 }}>
                  Connect your wallet to view assets
                </div>
              )}
            </div>

            {/* Transaction history — fills remaining space */}
            <div style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '0 16px 16px',
              minHeight: 0,
            }}>
              <div style={{
                fontFamily: "'Exo 2',sans-serif", fontWeight: 700, fontSize: 14,
                color: '#fff', padding: '12px 0 10px',
                borderTop: `1px solid ${C.border}`, flexShrink: 0,
              }}>Transaction History</div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: C.navyDeep, zIndex: 1 }}>
                    <tr>
                      {['Date','ID','Type','Asset','Amount','Status','Wallet Address'].map(h => (
                        <th key={h} style={{
                          fontFamily: "'Exo 2',sans-serif", fontWeight: 700, fontSize: 10,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: C.muted, textAlign: 'left',
                          padding: '6px 10px',
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
                      <tr><td colSpan={7} style={{ padding: '24px 10px', textAlign: 'center', fontFamily: "'Exo 2',sans-serif", fontSize: 12, color: C.muted }}>
                        No transactions yet
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT PANEL (stake/swap)
        ══════════════════════════════════════ */}
        <div style={{
          width: 320,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          overflow: 'hidden',
        }}>

          {/* Balance strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: C.navyDeep,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.30)',
          }}>
            <div style={{
              flex: 1,
              fontFamily: "'Exo 2',sans-serif", fontWeight: 800, fontSize: 17,
              color: '#fff', padding: '12px 16px', letterSpacing: '-0.01em',
            }}>
              {isConnected ? `${formatCycle(balance)} CYCLE` : '— CYCLE'}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderLeft: `1px solid ${C.border}`,
              padding: '12px 16px',
              fontFamily: "'Exo 2',sans-serif", fontWeight: 800, fontSize: 11,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.60)',
            }}>Balance</div>
          </div>

          {/* Panel card — fills rest */}
          <div style={{
            background: C.navyDeep,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          }}>

            {/* Tab bar: Swap | Send | Pool */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${C.border}`,
              padding: '0 4px',
              flexShrink: 0,
            }}>
              {['Stake','Send','Pool'].map((t, i) => (
                <button key={t} style={{
                  fontFamily: "'Exo 2',sans-serif",
                  fontWeight: i === 0 ? 700 : 600,
                  fontSize: 13,
                  color: i === 0 ? '#fff' : C.muted,
                  padding: '13px 18px',
                  background: 'transparent', border: 'none',
                  borderBottom: i === 0 ? '2px solid #fff' : '2px solid transparent',
                  cursor: i === 0 ? 'default' : 'not-allowed',
                  opacity: i === 0 ? 1 : 0.45,
                  transition: 'all 0.18s',
                }} title={i !== 0 ? 'Coming soon' : undefined}>{t}</button>
              ))}
            </div>

            {/* Scrollable staking content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <StakingPanel />
              <div style={{ height: 1, background: C.borderMid, margin: '0 16px' }} />
              <UserPosition />
            </div>
          </div>
        </div>

      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; box-shadow:0 0 6px #22c55e; }
          50%      { opacity:0.35; box-shadow:0 0 2px #22c55e; }
        }
      `}</style>
    </div>
  );
}
