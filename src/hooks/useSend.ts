"use client";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import { CYCLE_TOKEN_ADDRESS, CYCLE_TOKEN_ABI } from "@/lib/contracts";

export function useSend() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  async function send(to: string, amount: bigint) {
    if (!isAddress(to)) throw new Error("Invalid address");
    await writeContractAsync({
      address: CYCLE_TOKEN_ADDRESS as `0x${string}`,
      abi: CYCLE_TOKEN_ABI,
      functionName: "transfer",
      args: [to as `0x${string}`, amount],
    });
  }

  return { send, hash, isPending, isConfirming, isSuccess };
}
