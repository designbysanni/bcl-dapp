"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, maxUint256 } from "viem";
import { CYCLE_TOKEN_ADDRESS, CYCLE_STAKING_ADDRESS, CYCLE_TOKEN_ABI } from "@/lib/contracts";

export function useToken() {
  const { address } = useAccount();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CYCLE_TOKEN_ADDRESS,
    abi: CYCLE_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CYCLE_TOKEN_ADDRESS,
    abi: CYCLE_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, CYCLE_STAKING_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: approveTxHash, isPending: isApproving } = useWriteContract();

  const { isLoading: isWaitingApproval, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  function approve(amount: bigint) {
    writeContract({
      address: CYCLE_TOKEN_ADDRESS,
      abi: CYCLE_TOKEN_ABI,
      functionName: "approve",
      args: [CYCLE_STAKING_ADDRESS, amount],
    });
  }

  function approveMax() {
    writeContract({
      address: CYCLE_TOKEN_ADDRESS,
      abi: CYCLE_TOKEN_ABI,
      functionName: "approve",
      args: [CYCLE_STAKING_ADDRESS, maxUint256],
    });
  }

  function refetch() {
    refetchBalance();
    refetchAllowance();
  }

  function hasEnoughAllowance(amount: bigint): boolean {
    return (allowance ?? 0n) >= amount;
  }

  return {
    balance: balance ?? 0n,
    allowance: allowance ?? 0n,
    hasEnoughAllowance,
    approve,
    approveMax,
    approveTxHash,
    isApproving: isApproving || isWaitingApproval,
    approveSuccess,
    refetch,
  };
}
