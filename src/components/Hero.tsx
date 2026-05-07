"use client";

import { useStaking } from "@/hooks/useStaking";
import { formatCycle } from "@/lib/format";

// The Figma design has no separate hero section —
// the protocol stats are shown inline in the main grid.
// This component renders the 4-stat strip at the very top
// of the content area, matching the Figma exactly.

export function Hero() {
  const { totalStaked, rewardPool } = useStaking();

  const stats = [
    { label: "APY",           value: "12%",                          color: "#22c55e"  },
    { label: "Type",          value: "Fixed",                        color: "#ffffff"  },
    { label: "Total Staked",  value: `${formatCycle(totalStaked)} CYCLE`, color: "#60a5fa"  },
    { label: "Reward Pool",   value: `${formatCycle(rewardPool)} CYCLE`,  color: "#a78bfa"  },
  ];

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 16px 20px',
    }}>
      {/* Live badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
      }}>
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
            animation: 'pulse 2s ease-in-out infinite',
            display: 'inline-block',
          }} />
          Live on Sepolia Testnet
        </div>
      </div>

      {/* 4-stat grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'rgba(10,20,70,0.60)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 12,
            padding: '14px 16px',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.42)',
              marginBottom: 6,
            }}>{s.label}</p>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: s.color,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>{s.value}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.45; }
        }
      `}</style>
    </div>
  );
}
