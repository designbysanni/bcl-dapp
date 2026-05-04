"use client";

import { useState, useEffect } from "react";
import { parseEther, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { formatCycle, calcAnnualRewards } from "@/lib/format";
import { etherscanTx } from "@/lib/contracts";
import toast from "react-hot-toast";
import clsx from "clsx";

type Tab = "stake" | "unstake";

export function StakingPanel() {
  const [tab, setTab] = useState<Tab>("stake");
  const [inputValue, setInputValue] = useState("");
  const [isApprovalStep, setIsApprovalStep] = useState(false);

  const { isConnected } = useAccount();
  const { balance, allowance, hasEnoughAllowance, approve, isApproving, approveSuccess, refetch: refetchToken } = useToken();
  const { stakedBalance, stake, unstake, txHash, isLoading, txSuccess, reset, refetchAll } = useStaking();

  const parsedAmount = (() => {
    try {
      return inputValue ? parseEther(inputValue) : 0n;
    } catch {
      return 0n;
    }
  })();

  const maxBalance = tab === "stake" ? balance : stakedBalance;
  const isOverBalance = parsedAmount > maxBalance && parsedAmount > 0n;
  const isZero = parsedAmount === 0n;
  const needsApproval = tab === "stake" && !hasEnoughAllowance(parsedAmount) && parsedAmount > 0n;

  const annualEstimate = parsedAmount > 0n
    ? formatCycle(calcAnnualRewards(parsedAmount))
    : null;

  // Handle approval success → proceed to stake
  useEffect(() => {
    if (approveSuccess && isApprovalStep) {
      setIsApprovalStep(false);
      toast.success("Approval confirmed — now staking...");
      stake(parsedAmount);
      refetchToken();
    }
  }, [approveSuccess]);

  // Handle TX success
  useEffect(() => {
    if (txSuccess) {
      const msg = tab === "stake"
        ? `Successfully staked ${inputValue} CYCLE`
        : `Unstaked ${inputValue} CYCLE (+ rewards claimed)`;
      toast.success(msg, {
        icon: "✅",
        duration: 6000,
      });
      setInputValue("");
      reset();
      refetchAll();
      refetchToken();
    }
  }, [txSuccess]);

  function handleMax() {
    setInputValue(formatUnits(maxBalance, 18));
  }

  function handleAction() {
    if (!isConnected) return;

    if (tab === "stake") {
      if (needsApproval) {
        setIsApprovalStep(true);
        toast("Approving CYCLE spend...", { icon: "⏳" });
        approve(parsedAmount);
      } else {
        toast("Staking CYCLE...", { icon: "⏳" });
        stake(parsedAmount);
      }
    } else {
      toast("Unstaking CYCLE...", { icon: "⏳" });
      unstake(parsedAmount);
    }
  }

  function getButtonLabel() {
    if (!isConnected) return "Connect Wallet";
    if (isApproving) return "Approving...";
    if (isLoading && tab === "stake" && needsApproval) return "Approving...";
    if (isLoading) return tab === "stake" ? "Staking..." : "Unstaking...";
    if (needsApproval && tab === "stake") return "Approve & Stake";
    return tab === "stake" ? "Stake CYCLE" : "Unstake CYCLE";
  }

  const isProcessing = isApproving || isLoading || isApprovalStep;
  const isDisabled = !isConnected || isZero || isOverBalance || isProcessing;

  return (
    <div id="stake" className="card-glow flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-elevated rounded-xl">
        {(["stake", "unstake"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setInputValue(""); reset(); }}
            className={clsx(
              "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize",
              tab === t
                ? "bg-accent-cyan text-bg-deep shadow-glow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Balance display */}
      <div className="flex justify-between text-sm">
        <span className="text-text-muted">
          {tab === "stake" ? "Available" : "Staked"}
        </span>
        <span className="text-text-secondary font-mono">
          {formatCycle(maxBalance)}{" "}
          <span className="text-accent-cyan font-semibold">CYCLE</span>
        </span>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="number"
          placeholder="0.0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={clsx(
            "input-base pr-28",
            isOverBalance && "border-status-error/50 focus:ring-status-error/30"
          )}
          min="0"
          step="any"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={handleMax}
            className="text-xs font-bold text-accent-cyan hover:text-accent-cyan/80 transition-colors bg-accent-cyan/10 hover:bg-accent-cyan/20 px-2.5 py-1 rounded-lg"
          >
            MAX
          </button>
          <span className="text-text-muted font-semibold text-sm">CYCLE</span>
        </div>
      </div>

      {/* Validation error */}
      {isOverBalance && (
        <p className="text-status-error text-sm -mt-4 flex items-center gap-1">
          <span>⚠</span>{" "}
          {tab === "stake" ? "Insufficient CYCLE balance" : "Insufficient staked balance"}
        </p>
      )}

      {/* Annual rewards estimate */}
      {annualEstimate && !isOverBalance && tab === "stake" && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-accent-green/5 border border-accent-green/15 text-sm -mt-2">
          <span className="text-text-muted">Estimated annual rewards</span>
          <span className="text-accent-green font-mono font-semibold">
            +{annualEstimate} CYCLE
          </span>
        </div>
      )}

      {/* Unstake notice */}
      {tab === "unstake" && parsedAmount > 0n && !isOverBalance && (
        <p className="text-text-muted text-xs -mt-2 text-center">
          Unstaking will automatically claim your pending rewards.
        </p>
      )}

      {/* Approval step indicator */}
      {needsApproval && tab === "stake" && parsedAmount > 0n && (
        <div className="flex items-center gap-3 text-sm -mt-2">
          <StepDot active={isApprovalStep || isApproving} done={approveSuccess} label="1. Approve" />
          <div className="flex-1 h-px bg-border-subtle" />
          <StepDot active={!needsApproval && isLoading} done={txSuccess} label="2. Stake" />
        </div>
      )}

      {/* Main CTA */}
      <button
        onClick={handleAction}
        disabled={isDisabled}
        className={clsx(
          "btn-primary w-full text-base font-bold",
          !isDisabled && "animate-pulse-glow"
        )}
      >
        {isProcessing && <Spinner />}
        {getButtonLabel()}
      </button>

      {/* TX link */}
      {txHash && (
        <a
          href={etherscanTx(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs text-accent-cyan hover:underline"
        >
          View transaction on Etherscan ↗
        </a>
      )}
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className={clsx("flex items-center gap-1.5 text-xs font-medium",
      done ? "text-accent-green" : active ? "text-accent-cyan" : "text-text-muted"
    )}>
      <span className={clsx(
        "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold",
        done ? "bg-accent-green/20 border-accent-green text-accent-green" :
          active ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan" :
            "border-border-subtle text-text-muted"
      )}>
        {done ? "✓" : label[0]}
      </span>
      {label}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
