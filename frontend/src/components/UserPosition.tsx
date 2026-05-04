"use client";

import { useAccount } from "wagmi";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { formatCycle } from "@/lib/format";
import { RewardCounter } from "./RewardCounter";
import { etherscanAddress, CYCLE_STAKING_ADDRESS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { useEffect } from "react";

export function UserPosition() {
  const { isConnected } = useAccount();
  const { stakedBalance, pendingRewards, claimRewards, txSuccess, isLoading, refetchAll } =
    useStaking();
  const { balance, refetch: refetchToken } = useToken();

  useEffect(() => {
    if (txSuccess) {
      toast.success("Rewards claimed successfully!");
      refetchAll();
      refetchToken();
    }
  }, [txSuccess]);

  if (!isConnected) {
    return (
      <div className="card-glow h-full flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-text-muted">
            <path
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-text-secondary font-medium">Connect your wallet</p>
          <p className="text-text-muted text-sm mt-1">to view your position</p>
        </div>
      </div>
    );
  }

  const hasStaked = stakedBalance > 0n;
  const hasRewards = pendingRewards > 0n;

  return (
    <div className="card-glow flex flex-col gap-6">
      <div>
        <h3 className="font-display font-semibold text-text-primary text-lg mb-1">
          Your Position
        </h3>
        <a
          href={etherscanAddress(CYCLE_STAKING_ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-muted hover:text-accent-cyan transition-colors"
        >
          View contract on Etherscan ↗
        </a>
      </div>

      {/* Balance rows */}
      <div className="space-y-3">
        <PositionRow
          label="Wallet Balance"
          value={`${formatCycle(balance)} CYCLE`}
          color="text-text-primary"
        />
        <div className="h-px bg-[rgba(0,198,255,0.08)]" />
        <PositionRow
          label="Staked Amount"
          value={`${formatCycle(stakedBalance)} CYCLE`}
          color="text-accent-cyan"
          highlight={hasStaked}
        />
        <PositionRow
          label="Pending Rewards"
          value={
            <span className="flex items-center gap-1">
              <RewardCounter
                baseRewards={pendingRewards}
                stakedBalance={stakedBalance}
              />{" "}
              <span className="text-text-secondary text-sm">CYCLE</span>
            </span>
          }
          color="text-accent-green"
          highlight={hasRewards}
        />
      </div>

      {/* APY badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-green/5 border border-accent-green/15">
        <span className="text-accent-green text-lg">✦</span>
        <div>
          <p className="text-accent-green font-semibold text-sm">12% APY — Fixed</p>
          <p className="text-text-muted text-xs">Rewards accrue every second</p>
        </div>
      </div>

      {/* Claim button */}
      <button
        onClick={claimRewards}
        disabled={!hasRewards || isLoading}
        className="btn-secondary w-full"
      >
        {isLoading ? (
          <>
            <Spinner />
            Claiming...
          </>
        ) : (
          <>
            <span>⚡</span>
            Claim Rewards
          </>
        )}
      </button>
    </div>
  );
}

function PositionRow({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="stat-label">{label}</span>
      <span className={`font-mono font-semibold text-sm ${color} ${highlight ? "drop-shadow-sm" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
