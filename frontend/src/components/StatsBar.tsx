"use client";

import { useStaking } from "@/hooks/useStaking";
import { formatCycle } from "@/lib/format";
import { etherscanAddress, CYCLE_TOKEN_ADDRESS, CYCLE_STAKING_ADDRESS } from "@/lib/contracts";

export function StatsBar() {
  const { totalStaked, rewardPool } = useStaking();

  const stats = [
    {
      label: "Fixed APY",
      value: "12%",
      sub: "Annual Percentage Yield",
      accent: "text-accent-green",
      icon: "✦",
    },
    {
      label: "Total Value Staked",
      value: `${formatCycle(totalStaked)}`,
      sub: "CYCLE tokens",
      accent: "text-accent-cyan",
      icon: "◈",
    },
    {
      label: "Reward Pool",
      value: `${formatCycle(rewardPool)}`,
      sub: "Available for rewards",
      accent: "text-accent-purple",
      icon: "⬡",
    },
    {
      label: "Reward Type",
      value: "Fixed",
      sub: "No lock-up period",
      accent: "text-accent-cyan",
      icon: "⚡",
    },
  ];

  return (
    <section className="py-16 bg-bg-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display font-bold text-2xl text-text-primary mb-8 text-center">
          Protocol Overview
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="card glow-border group cursor-default"
            >
              <div className={`text-2xl mb-3 ${stat.accent}`}>{stat.icon}</div>
              <p className="stat-label mb-1">{stat.label}</p>
              <p className={`font-display font-bold text-3xl ${stat.accent} mb-1`}>
                {stat.value}
              </p>
              <p className="text-text-muted text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Contract addresses */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ContractCard
            label="CYCLE Token"
            address={CYCLE_TOKEN_ADDRESS}
          />
          <ContractCard
            label="Staking Contract"
            address={CYCLE_STAKING_ADDRESS}
          />
        </div>
      </div>
    </section>
  );
}

function ContractCard({ label, address }: { label: string; address: string }) {
  const isPlaceholder = address === "0x0000000000000000000000000000000000000000";

  return (
    <div className="card flex items-center justify-between gap-3">
      <div>
        <p className="stat-label mb-1">{label}</p>
        <p className="font-mono text-sm text-text-secondary">
          {isPlaceholder ? "Not yet deployed" : `${address.slice(0, 10)}...${address.slice(-6)}`}
        </p>
      </div>
      {!isPlaceholder && (
        <a
          href={etherscanAddress(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-accent-cyan hover:text-accent-cyan/80 transition-colors text-sm font-medium"
        >
          Etherscan ↗
        </a>
      )}
    </div>
  );
}
