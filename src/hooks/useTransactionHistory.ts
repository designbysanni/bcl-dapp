"use client";

import { usePublicClient, useAccount } from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { CYCLE_STAKING_ADDRESS } from "@/lib/contracts";

export type TxType = "Stake" | "Unstake" | "Claim";

export interface TxRecord {
  hash: string;
  type: TxType;
  amount: bigint;
  blockNumber: bigint;
}

const STAKED_EVENT = {
  type: "event" as const,
  name: "Staked",
  inputs: [
    { name: "user",   type: "address" as const, indexed: true  as const },
    { name: "amount", type: "uint256" as const, indexed: false as const },
  ],
};

const UNSTAKED_EVENT = {
  type: "event" as const,
  name: "Unstaked",
  inputs: [
    { name: "user",    type: "address" as const, indexed: true  as const },
    { name: "amount",  type: "uint256" as const, indexed: false as const },
    { name: "rewards", type: "uint256" as const, indexed: false as const },
  ],
};

const CLAIMED_EVENT = {
  type: "event" as const,
  name: "RewardsClaimed",
  inputs: [
    { name: "user",    type: "address" as const, indexed: true  as const },
    { name: "rewards", type: "uint256" as const, indexed: false as const },
  ],
};

const SCAN_RANGE = 50_000n; // ~7 days of Sepolia blocks

export function useTransactionHistory() {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();
  const [records, setRecords]   = useState<TxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!address || !isConnected || !client) { setRecords([]); return; }
    setIsLoading(true);

    try {
      const latest    = await client.getBlockNumber();
      const fromBlock = latest > SCAN_RANGE ? latest - SCAN_RANGE : 0n;
      const addr      = CYCLE_STAKING_ADDRESS as `0x${string}`;

      const [staked, unstaked, claimed] = await Promise.allSettled([
        client.getLogs({ address: addr, event: STAKED_EVENT   as any, args: { user: address }, fromBlock, toBlock: "latest" }),
        client.getLogs({ address: addr, event: UNSTAKED_EVENT as any, args: { user: address }, fromBlock, toBlock: "latest" }),
        client.getLogs({ address: addr, event: CLAIMED_EVENT  as any, args: { user: address }, fromBlock, toBlock: "latest" }),
      ]);

      const rows: TxRecord[] = [
        ...(staked.status   === "fulfilled" ? staked.value.map(l   => ({ hash: l.transactionHash ?? "", type: "Stake"   as TxType, amount: ((l as any).args?.amount  ?? 0n) as bigint, blockNumber: l.blockNumber ?? 0n })) : []),
        ...(unstaked.status === "fulfilled" ? unstaked.value.map(l => ({ hash: l.transactionHash ?? "", type: "Unstake" as TxType, amount: ((l as any).args?.amount  ?? 0n) as bigint, blockNumber: l.blockNumber ?? 0n })) : []),
        ...(claimed.status  === "fulfilled" ? claimed.value.map(l  => ({ hash: l.transactionHash ?? "", type: "Claim"   as TxType, amount: ((l as any).args?.rewards ?? 0n) as bigint, blockNumber: l.blockNumber ?? 0n })) : []),
      ].sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1));

      setRecords(rows);
    } catch (err) {
      console.error("[useTransactionHistory]", err);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, client]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { records, isLoading, refetch: fetchHistory };
}
