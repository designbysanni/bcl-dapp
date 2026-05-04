"use client";

import { useStaking } from "@/hooks/useStaking";
import { formatCycle } from "@/lib/format";

export function Hero() {
  const { totalStaked, rewardPool } = useStaking();

  return (
    <section className="relative overflow-hidden bg-bg-deep grid-pattern">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-purple/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-sm font-medium animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          Live on Sepolia Testnet
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-text-primary mb-4 leading-tight animate-slide-up">
          Stake.{" "}
          <span className="gradient-text">Earn.</span>
          <br />
          Cycle.
        </h1>

        <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto mb-10 animate-fade-in">
          Deposit <span className="text-accent-cyan font-semibold">$CYCLE</span> and earn{" "}
          <span className="text-accent-green font-semibold">12% APY</span> — fixed, on-chain, transparent.
        </p>

        {/* Protocol stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up">
          <StatPill label="APY" value="12%" accent="green" />
          <StatPill label="Type" value="Fixed" accent="cyan" />
          <StatPill label="Total Staked" value={`${formatCycle(totalStaked)} CYCLE`} accent="cyan" />
          <StatPill label="Reward Pool" value={`${formatCycle(rewardPool)} CYCLE`} accent="purple" />
        </div>
      </div>
    </section>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "green" | "purple";
}) {
  const colorMap = {
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    purple: "text-accent-purple",
  };

  return (
    <div className="bg-bg-surface/60 backdrop-blur-sm rounded-2xl border border-[rgba(0,198,255,0.12)] px-4 py-4 text-center">
      <p className="stat-label mb-1">{label}</p>
      <p className={`font-display font-bold text-xl ${colorMap[accent]}`}>{value}</p>
    </div>
  );
}
