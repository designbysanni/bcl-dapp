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

const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";

const S: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.10)',
    padding: '0 4px',
    gap: 0,
  },
  tab: {
    fontFamily: PP,
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.50)',
    padding: '14px 18px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  tabActive: {
    color: '#ffffff',
    borderBottomColor: '#ffffff',
    fontWeight: 700,
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
  },
  label: {
    fontFamily: PP,
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.09em',
    color: 'rgba(255,255,255,0.50)',
    marginBottom: 6,
  },
  inputWrap: {
    position: 'relative' as const,
  },
  maxTag: {
    position: 'absolute' as const,
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: PP,
    fontSize: 10,
    fontWeight: 700,
    color: '#60a5fa',
    background: 'rgba(96,165,250,0.12)',
    border: '1px solid rgba(96,165,250,0.25)',
    borderRadius: 5,
    padding: '3px 7px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
  },
  balanceLabel: {
    fontFamily: PP,
    fontSize: 11,
    color: 'rgba(255,255,255,0.52)',
    fontWeight: 500,
  },
  balanceValue: {
    fontFamily: MONO,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 600,
  },
  estimateBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(34,197,94,0.07)',
    border: '1px solid rgba(34,197,94,0.20)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
  },
  errorText: {
    fontFamily: PP,
    fontSize: 12,
    color: '#f87171',
    fontWeight: 600,
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    background: 'rgba(255,255,255,0.10)',
  },
  txLink: {
    textAlign: 'center' as const,
    fontFamily: PP,
    fontSize: 11,
    color: '#60a5fa',
    textDecoration: 'none',
  },
  unstakeNote: {
    textAlign: 'center' as const,
    fontFamily: PP,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
};

export function StakingPanel() {
  const [tab, setTab]               = useState<Tab>("stake");
  const [inputValue, setInputValue] = useState("");
  const [isApprovalStep, setIsApprovalStep] = useState(false);

  const { isConnected } = useAccount();
  const {
    balance, allowance, hasEnoughAllowance,
    approve, isApproving, approveSuccess, refetch: refetchToken,
  } = useToken();
  const {
    stakedBalance, stake, unstake,
    txHash, isLoading, txSuccess, reset, refetchAll,
  } = useStaking();

  const parsedAmount = (() => {
    try { return inputValue ? parseEther(inputValue) : 0n; }
    catch { return 0n; }
  })();

  const maxBalance    = tab === "stake" ? balance : stakedBalance;
  const isOverBalance = parsedAmount > maxBalance && parsedAmount > 0n;
  const isZero        = parsedAmount === 0n;
  const needsApproval = tab === "stake" && !hasEnoughAllowance(parsedAmount) && parsedAmount > 0n;
  const annualEst     = parsedAmount > 0n ? formatCycle(calcAnnualRewards(parsedAmount)) : null;

  useEffect(() => {
    if (approveSuccess && isApprovalStep) {
      setIsApprovalStep(false);
      toast.success("Approval confirmed — staking now…");
      stake(parsedAmount);
      refetchToken();
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (txSuccess) {
      toast.success(
        tab === "stake"
          ? `Staked ${inputValue} CYCLE ✓`
          : `Unstaked ${inputValue} CYCLE ✓`,
        { icon: "✅", duration: 6000 }
      );
      setInputValue(""); reset(); refetchAll(); refetchToken();
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
        toast("Approving CYCLE spend…", { icon: "⏳" });
        approve(parsedAmount);
      } else {
        toast("Staking CYCLE…", { icon: "⏳" });
        stake(parsedAmount);
      }
    } else {
      toast("Unstaking CYCLE…", { icon: "⏳" });
      unstake(parsedAmount);
    }
  }

  function getButtonLabel() {
    if (!isConnected)                              return "Connect Wallet";
    if (isApproving)                               return "Approving…";
    if (isLoading && tab === "stake" && needsApproval) return "Approving…";
    if (isLoading)    return tab === "stake" ? "Staking…" : "Unstaking…";
    if (needsApproval && tab === "stake")          return "Approve & Stake";
    return tab === "stake" ? "Stake CYCLE" : "Unstake CYCLE";
  }

  const isProcessing = isApproving || isLoading || isApprovalStep;
  const isDisabled   = !isConnected || isZero || isOverBalance || isProcessing;

  return (
    <div style={S.panel} id="stake">

      {/* Tab bar — Stake / Unstake */}
      <div style={S.tabBar}>
        {(["stake", "unstake"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setInputValue(""); reset(); }}
            style={{
              ...S.tab,
              ...(tab === t ? S.tabActive : {}),
            }}
          >
            {t === "stake" ? "Stake" : "Unstake"}
          </button>
        ))}
      </div>

      <div style={S.body}>

        {/* Available balance */}
        <div style={S.balanceRow}>
          <span style={S.balanceLabel}>{tab === "stake" ? "Available" : "Staked"}</span>
          <span style={S.balanceValue}>
            {formatCycle(maxBalance)}{" "}
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>CYCLE</span>
          </span>
        </div>

        {/* Amount input */}
        <div style={S.inputWrap}>
          <input
            type="number"
            placeholder="0.0"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className={clsx("input-base", isOverBalance && "border-status-error/50")}
            style={{ paddingRight: 64 }}
            min="0"
            step="any"
          />
          <button style={S.maxTag} onClick={handleMax}>MAX</button>
        </div>

        {/* Validation error */}
        {isOverBalance && (
          <p style={S.errorText}>
            ⚠ {tab === "stake" ? "Insufficient CYCLE balance" : "Insufficient staked balance"}
          </p>
        )}

        {/* Annual estimate */}
        {annualEst && !isOverBalance && tab === "stake" && (
          <div style={S.estimateBox}>
            <span style={{ fontFamily: PP, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              Estimated annual rewards
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: '#22c55e', fontWeight: 700 }}>
              +{annualEst} CYCLE
            </span>
          </div>
        )}

        {/* Unstake note */}
        {tab === "unstake" && parsedAmount > 0n && !isOverBalance && (
          <p style={S.unstakeNote}>
            Unstaking will automatically claim your pending rewards.
          </p>
        )}

        {/* Approve → Stake step indicator */}
        {needsApproval && tab === "stake" && parsedAmount > 0n && (
          <div style={S.stepRow}>
            <StepDot active={isApprovalStep || isApproving} done={approveSuccess} label="1. Approve" />
            <div style={S.divider} />
            <StepDot active={!needsApproval && isLoading} done={txSuccess ?? false} label="2. Stake" />
          </div>
        )}

        {/* Main CTA */}
        <button
          onClick={handleAction}
          disabled={isDisabled}
          className="btn-primary w-full"
          style={{ height: 50, fontSize: 14, marginTop: 4 }}
        >
          {isProcessing && <Spinner />}
          {getButtonLabel()}
        </button>

        {/* Etherscan tx link */}
        {txHash && (
          <a
            href={etherscanTx(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            style={S.txLink}
          >
            View transaction on Etherscan ↗
          </a>
        )}

      </div>
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  const color = done ? '#22c55e' : active ? '#60a5fa' : 'rgba(255,255,255,0.35)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: PP, fontWeight: 600, color }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%',
        border: `1px solid ${color}`,
        background: done ? 'rgba(34,197,94,0.15)' : active ? 'rgba(96,165,250,0.15)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color,
        flexShrink: 0,
      }}>
        {done ? "✓" : label[0]}
      </span>
      {label}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" style={{ width: 16, height: 16, marginRight: 4 }} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
