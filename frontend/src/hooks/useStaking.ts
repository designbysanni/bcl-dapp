"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CYCLE_STAKING_ADDRESS, CYCLE_STAKING_ABI } from "@/lib/contracts";

export type StakingAction = "stake" | "unstake" | "claim" | null;

export function useStaking() {
  const { address } = useAccount();

  // ── Read state ──────────────────────────────────────────
  const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
    address: CYCLE_STAKING_ADDRESS,
    abi: CYCLE_STAKING_ABI,
    functionName: "stakedBalance",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: CYCLE_STAKING_ADDRESS,
    abi: CYCLE_STAKING_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const { data: totalStaked, refetch: refetchTotal } = useReadContract({
    address: CYCLE_STAKING_ADDRESS,
    abi: CYCLE_STAKING_ABI,
    functionName: "totalStaked",
    query: { refetchInterval: 15_000 },
  });

  const { data: rewardPool, refetch: refetchPool } = useReadContract({
    address: CYCLE_STAKING_ADDRESS,
    abi: CYCLE_STAKING_ABI,
    functionName: "rewardPool",
    query: { refetchInterval: 30_000 },
  });

  // ── Write state ─────────────────────────────────────────
  const {
    writeContract,
    data: txHash,
    isPending: isSending,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ── Actions ─────────────────────────────────────────────
  function stake(amount: bigint) {
    writeContract({
      address: CYCLE_STAKING_ADDRESS,
      abi: CYCLE_STAKING_ABI,
      functionName: "stake",
      args: [amount],
    });
  }

  function unstake(amount: bigint) {
    writeContract({
      address: CYCLE_STAKING_ADDRESS,
      abi: CYCLE_STAKING_ABI,
      functionName: "unstake",
      args: [amount],
    });
  }

  function claimRewards() {
    writeContract({
      address: CYCLE_STAKING_ADDRESS,
      abi: CYCLE_STAKING_ABI,
      functionName: "claimRewards",
    });
  }

  function refetchAll() {
    refetchStaked();
    refetchRewards();
    refetchTotal();
    refetchPool();
  }

  return {
    stakedBalance: stakedBalance ?? 0n,
    pendingRewards: pendingRewards ?? 0n,
    totalStaked: totalStaked ?? 0n,
    rewardPool: rewardPool ?? 0n,
    stake,
    unstake,
    claimRewards,
    txHash,
    isLoading: isSending || isConfirming,
    txSuccess,
    reset,
    refetchAll,
  };
}
