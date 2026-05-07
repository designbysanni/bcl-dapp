"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { StakingPanel } from "@/components/StakingPanel";
import { UserPosition } from "@/components/UserPosition";
import { StatsBar } from "@/components/StatsBar";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { formatCycle } from "@/lib/format";
import { etherscanAddress, CYCLE_TOKEN_ADDRESS, CYCLE_STAKING_ADDRESS } from "@/lib/contracts";

type Filter  = "all" | "tokens" | "nfts";

/* ── Inline styles ─────────────────────────────────────────── */
const cardBase: React.CSSProperties = {
  background: 'rgba(10,20,70,0.70)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)',
  overflow: 'hidden',
};

/* ── Asset card sub-component ──────────────────────────────── */
function AssetCard({
  tokenId,
  name,
  value,
  staked,
  isNft,
  onStake,
  onUnstake,
}: {
  tokenId: string;
  name: string;
  value: string;
  staked: boolean;
  isNft?: boolean;
  onStake?: () => void;
  onUnstake?: () => void;
}) {
  return (
    <div style={{
      background: 'rgba(20,34,102,0.80)',
      border: `1px solid ${staked ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.10)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(0,0,0,0.45)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Token image area */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: isNft
          ? 'linear-gradient(135deg, #1a0a40 0%, #2d1060 100%)'
          : 'linear-gradient(135deg, #0a1840 0%, #142060 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {isNft ? (
          /* NFT placeholder — ape-style silhouette */
          <div style={{ fontSize: 40, opacity: 0.85 }}>🦧</div>
        ) : (
          /* CYCLE token ring visual */
          <CycleRingIcon staked={staked} />
        )}
        {staked && (
          <div style={{
            position: 'absolute',
            top: 6, right: 6,
            width: 8, height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 6px #22c55e',
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 9,
          color: 'rgba(255,255,255,0.35)',
          marginBottom: 3,
        }}>{tokenId}</div>
        <div style={{
          fontFamily: "'Exo 2', sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: '#ffffff',
          lineHeight: 1.3,
          marginBottom: 2,
        }}>{name}</div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: 'rgba(255,255,255,0.50)',
          marginBottom: 8,
        }}>≈{value}</div>

        {staked && (
          <div style={{
            display: 'inline-block',
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#22c55e',
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.28)',
            borderRadius: 4,
            padding: '2px 6px',
            marginBottom: 8,
          }}>Staked</div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onClick={onStake}
            style={{
              flex: 1,
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 700,
              fontSize: 9,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#0d1a52',
              background: '#ffffff',
              border: 'none',
              borderRadius: 5,
              padding: '5px 4px',
              cursor: 'pointer',
              transition: 'background 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e0e7ff')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
          >
            {staked ? 'Edit Stake' : 'Stake'}
          </button>
          <button
            onClick={onUnstake}
            style={{
              flex: 1,
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 700,
              fontSize: 9,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#ffffff',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.30)',
              borderRadius: 5,
              padding: '5px 4px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.60)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)';
            }}
          >
            Unstake
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Cycle ring SVG icon ───────────────────────────────────── */
function CycleRingIcon({ staked }: { staked: boolean }) {
  const c = staked ? '#22c55e' : '#06b6d4';
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="24" stroke={c} strokeWidth="2.5" opacity="0.55" />
      <circle cx="28" cy="28" r="15" stroke={c} strokeWidth="2" opacity="0.40" />
      <circle cx="28" cy="28" r="7"  fill={c} opacity="0.30" />
      <circle cx="28" cy="28" r="4"  fill={c} opacity="0.70" />
      {/* Arrows */}
      <path d="M28 6 L32 13 L24 13 Z" fill={c} opacity="0.75" />
      <path d="M28 50 L24 43 L32 43 Z" fill={c} opacity="0.75" />
      <path d="M6 28 L13 24 L13 32 Z" fill={c} opacity="0.75" />
      <path d="M50 28 L43 32 L43 24 Z" fill={c} opacity="0.75" />
    </svg>
  );
}

/* ── Transaction row ───────────────────────────────────────── */
function TxRow({ date, id, type, asset, amount, status, address }: {
  date: string; id: string; type: string; asset: string;
  amount: string; status: string; address: string;
}) {
  const statusColor = status === 'Completed' ? '#22c55e' : status === 'Pending' ? '#facc15' : '#f87171';
  const cell: React.CSSProperties = {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    padding: '10px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    verticalAlign: 'middle',
  };
  return (
    <tr>
      <td style={cell}>{date}</td>
      <td style={{ ...cell, fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.40)' }}>{id}</td>
      <td style={cell}>{type}</td>
      <td style={cell}>{asset}</td>
      <td style={cell}>{amount}</td>
      <td style={{ ...cell, fontWeight: 700, color: statusColor }}>{status}</td>
      <td style={{ ...cell, fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.40)' }}>{address}</td>
    </tr>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function Home() {
  const { isConnected, address } = useAccount();
  const { stakedBalance, pendingRewards, totalStaked, rewardPool } = useStaking();
  const { balance } = useToken();

  const [filter, setFilter] = useState<Filter>("all");

  // Scroll to the staking panel
  const scrollToStake = () => {
    document.getElementById('stake-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const shortAddr = (addr: string) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

  const hasStaked = stakedBalance > 0n;

  // Filter tabs
  const tabs: { key: Filter; label: string }[] = [
    { key: 'all',    label: 'All'    },
    { key: 'tokens', label: 'Tokens' },
    { key: 'nfts',   label: 'NFTs'   },
  ];

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── Live testnet badge + 4-stat strip ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 16px' }}>
        {/* Live badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 50,
            padding: '6px 16px',
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)',
          }}>
            <span style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              display: 'inline-block',
              animation: 'livePulse 2s ease-in-out infinite',
            }} />
            Live on Sepolia Testnet
          </div>
        </div>

        {/* 4 stat pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}>
          {[
            { label: 'APY',          value: '12%',                             color: '#22c55e' },
            { label: 'Type',         value: 'Fixed',                           color: '#ffffff' },
            { label: 'Total Staked', value: `${formatCycle(totalStaked)} CYCLE`, color: '#60a5fa' },
            { label: 'Reward Pool',  value: `${formatCycle(rewardPool)} CYCLE`,  color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(10,20,70,0.55)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '12px 14px',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 9, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.42)', marginBottom: 5,
              }}>{s.label}</p>
              <p style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 18, fontWeight: 800,
                color: s.color, letterSpacing: '-0.02em', lineHeight: 1,
              }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 14,
          alignItems: 'start',
        }}>

          {/* ── LEFT: Asset grid + Tx history ── */}
          <div style={cardBase}>

            {/* Filter tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.09)',
              padding: '0 6px',
              gap: 0,
            }}>
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: filter === t.key ? '#ffffff' : 'rgba(255,255,255,0.42)',
                    padding: '14px 18px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${filter === t.key ? '#ffffff' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    fontWeight: filter === t.key ? 700 : 600,
                  } as React.CSSProperties}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Asset grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
              padding: 16,
            }}>
              {/* CYCLE token — always show unless NFTs-only */}
              {(filter === 'all' || filter === 'tokens') && (
                <AssetCard
                  tokenId={CYCLE_TOKEN_ADDRESS ? `${CYCLE_TOKEN_ADDRESS.slice(0, 8)}…` : '123989989'}
                  name="Block Cycle Token"
                  value={`${formatCycle(balance)}`}
                  staked={false}
                  onStake={scrollToStake}
                  onUnstake={scrollToStake}
                />
              )}

              {/* Staked position card */}
              {hasStaked && (filter === 'all' || filter === 'tokens') && (
                <AssetCard
                  tokenId={CYCLE_STAKING_ADDRESS ? `${CYCLE_STAKING_ADDRESS.slice(0, 8)}…` : '123989989'}
                  name="Block Cycle Token"
                  value={`${formatCycle(stakedBalance)}`}
                  staked={true}
                  onStake={scrollToStake}
                  onUnstake={scrollToStake}
                />
              )}

              {/* NFTs filter empty state */}
              {filter === 'nfts' && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '40px 20px',
                  textAlign: 'center',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.30)',
                }}>
                  No NFTs found in this wallet
                </div>
              )}

              {/* Not connected */}
              {!isConnected && filter !== 'nfts' && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '40px 20px',
                  textAlign: 'center',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                }}>
                  Connect your wallet to view assets
                </div>
              )}
            </div>

            {/* ── Transaction History ── */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{
                fontFamily: "'Exo 2', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: '#ffffff',
                padding: '14px 0 12px',
                borderTop: '1px solid rgba(255,255,255,0.09)',
                marginTop: 4,
              }}>
                Transaction History
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'ID', 'Type', 'Asset', 'Amount', 'Status', 'Wallet Address'].map(h => (
                        <th key={h} style={{
                          fontFamily: "'Exo 2', sans-serif",
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.38)',
                          textAlign: 'left',
                          padding: '6px 10px',
                          borderBottom: '1px solid rgba(255,255,255,0.09)',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder rows matching the Figma exactly */}
                    {isConnected ? (
                      <>
                        <TxRow
                          date="05-12-24" id="19993799" type="Token"
                          asset="BCL" amount="5806" status="Completed"
                          address={shortAddr(address || '')}
                        />
                        <TxRow
                          date="05-12-24" id="5956899" type="NFT"
                          asset="BCL" amount="3" status="Completed"
                          address={shortAddr(address || '')}
                        />
                      </>
                    ) : (
                      <tr>
                        <td colSpan={7} style={{
                          padding: '24px 10px',
                          textAlign: 'center',
                          fontFamily: "'Exo 2', sans-serif",
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.28)',
                        }}>
                          No transactions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Balance strip + Staking panel + Position ── */}
          <div id="stake-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Balance strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(10,20,70,0.70)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              <div style={{
                flex: 1,
                fontFamily: "'Exo 2', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                color: '#ffffff',
                padding: '11px 16px',
                letterSpacing: '-0.01em',
              }}>
                {isConnected ? `${formatCycle(balance)} CYCLE` : '0.00 CYCLE'}
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                borderLeft: '1px solid rgba(255,255,255,0.10)',
                padding: '11px 16px',
                fontFamily: "'Exo 2', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.60)',
              }}>
                Balance
              </div>
            </div>

            {/* Combined Stake + Position card */}
            <div style={cardBase}>

              {/* Swap-style sub-tabs: Swap | Send | Pool */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255,255,255,0.09)',
                padding: '0 4px',
                gap: 0,
              }}>
                {['Stake', 'Send', 'Pool'].map((t, i) => (
                  <button
                    key={t}
                    style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontWeight: i === 0 ? 700 : 600,
                      fontSize: 13,
                      color: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.42)',
                      padding: '13px 18px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: i === 0 ? '2px solid #ffffff' : '2px solid transparent',
                      cursor: i === 0 ? 'default' : 'not-allowed',
                      transition: 'all 0.18s',
                      opacity: i === 0 ? 1 : 0.5,
                    } as React.CSSProperties}
                    title={i !== 0 ? 'Coming soon' : undefined}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Staking form */}
              <StakingPanel />

              {/* Divider */}
              <div style={{
                height: 1,
                background: 'rgba(255,255,255,0.07)',
                margin: '0 20px',
              }} />

              {/* Your position */}
              <UserPosition />
            </div>
          </div>

        </div>
      </div>

      {/* ── Protocol Overview + Contracts ── */}
      <StatsBar />

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '24px 16px',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 20, height: 20,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
            }}>⬡</div>
            <span style={{
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: 'rgba(255,255,255,0.65)',
            }}>BCL DApp · Block Cycle Labs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 50,
              padding: '4px 12px',
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.70)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Sepolia Testnet
            </div>
            <a
              href="https://bcl.sannisanni.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 11,
                color: 'rgba(255,255,255,0.40)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.40)')}
            >
              bcl.sannisanni.com
            </a>
          </div>
        </div>
      </footer>

      {/* Keyframes */}
      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; box-shadow: 0 0 6px #22c55e; }
          50%      { opacity:0.45; box-shadow: 0 0 2px #22c55e; }
        }
        @media (max-width: 768px) {
          /* Stack columns on mobile */
          .two-col-grid { grid-template-columns: 1fr !important; }
          .stat-grid-4  { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </main>
  );
}
