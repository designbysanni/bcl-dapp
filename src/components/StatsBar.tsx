"use client";

import { useStaking } from "@/hooks/useStaking";
import { formatCycle } from "@/lib/format";
import { etherscanAddress, CYCLE_TOKEN_ADDRESS, CYCLE_STAKING_ADDRESS } from "@/lib/contracts";

export function StatsBar() {
  const { totalStaked, rewardPool } = useStaking();

  const stats = [
    { label: "Fixed APY",         value: "12%",                        sub: "Annual Percentage Yield",   color: "#22c55e", icon: "✦" },
    { label: "Total Value Staked", value: formatCycle(totalStaked),     sub: "CYCLE tokens",              color: "#60a5fa", icon: "◈" },
    { label: "Reward Pool",        value: formatCycle(rewardPool),      sub: "Available for rewards",     color: "#a78bfa", icon: "⬡" },
    { label: "Reward Type",        value: "Fixed",                      sub: "No lock-up period",         color: "#60a5fa", icon: "⚡" },
  ];

  return (
    <section style={{ padding: '24px 16px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Section title */}
      <h2 style={{
        fontFamily: "'Exo 2', sans-serif",
        fontWeight: 800,
        fontSize: 18,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: '-0.01em',
      }}>
        Protocol Overview
      </h2>

      {/* 4-stat grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        marginBottom: 12,
      }}
        className="sm:grid-cols-4"
      >
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'rgba(10,20,70,0.60)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 14,
            padding: '18px 16px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            className="glow-border"
          >
            <div style={{ fontSize: 20, marginBottom: 8, color: s.color }}>{s.icon}</div>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.42)',
              marginBottom: 4,
            }}>{s.label}</p>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 800, fontSize: 26,
              color: s.color, letterSpacing: '-0.02em',
              lineHeight: 1.1, marginBottom: 4,
            }}>{s.value}</p>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 11, color: 'rgba(255,255,255,0.38)',
            }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Contract cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ContractCard label="CYCLE Token"      address={CYCLE_TOKEN_ADDRESS} />
        <ContractCard label="Staking Contract" address={CYCLE_STAKING_ADDRESS} />
      </div>
    </section>
  );
}

function ContractCard({ label, address }: { label: string; address: string }) {
  const isPlaceholder = address === "0x0000000000000000000000000000000000000000";
  return (
    <div style={{
      background: 'rgba(10,20,70,0.60)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <div>
        <p style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.42)',
          marginBottom: 4,
        }}>{label}</p>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11, color: 'rgba(255,255,255,0.60)',
        }}>
          {isPlaceholder ? "Not deployed" : `${address.slice(0, 10)}…${address.slice(-6)}`}
        </p>
      </div>
      {!isPlaceholder && (
        <a
          href={etherscanAddress(address)}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: 11, fontWeight: 700,
            color: '#60a5fa',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Etherscan ↗
        </a>
      )}
    </div>
  );
}
