"use client";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { useState, useCallback } from "react";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { CYCLE_TOKEN_ADDRESS, CYCLE_TOKEN_ABI } from "@/lib/contracts";

/* ── Sepolia Uniswap V3 deployment addresses ────────────── */
export const UNI_WETH        = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" as const;
export const UNI_QUOTER_V2   = "0xEd1f6473345F45b75833fd55D191EBE6d520cF8F" as const;
export const UNI_ROUTER      = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48" as const;
export const UNI_FACTORY     = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c" as const;
export const FEE_TIER        = 3000; // 0.3 %

const QUOTER_ABI = [
  {
    name: "quoteExactInputSingle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{
      name: "params", type: "tuple",
      components: [
        { name: "tokenIn",            type: "address" },
        { name: "tokenOut",           type: "address" },
        { name: "amountIn",           type: "uint256" },
        { name: "fee",                type: "uint24"  },
        { name: "sqrtPriceLimitX96",  type: "uint160" },
      ],
    }],
    outputs: [
      { name: "amountOut",                 type: "uint256" },
      { name: "sqrtPriceX96After",         type: "uint160" },
      { name: "initializedTicksCrossed",   type: "uint32"  },
      { name: "gasEstimate",               type: "uint256" },
    ],
  },
] as const;

const ROUTER_ABI = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [{
      name: "params", type: "tuple",
      components: [
        { name: "tokenIn",           type: "address" },
        { name: "tokenOut",          type: "address" },
        { name: "fee",               type: "uint24"  },
        { name: "recipient",         type: "address" },
        { name: "amountIn",          type: "uint256" },
        { name: "amountOutMinimum",  type: "uint256" },
        { name: "sqrtPriceLimitX96", type: "uint160" },
      ],
    }],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

const FACTORY_ABI = [
  {
    name: "getPool",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee",    type: "uint24"  },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const;

export function useSwap() {
  const { address } = useAccount();
  const client       = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [quote,      setQuote]      = useState<bigint | null>(null);
  const [poolExists, setPoolExists] = useState<boolean | null>(null);
  const [isQuoting,  setIsQuoting]  = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash,     setTxHash]     = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  /* ── Check if pool exists ─────────────────────────────── */
  const checkPool = useCallback(async () => {
    if (!client) return;
    try {
      const pool = await client.readContract({
        address: UNI_FACTORY,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [CYCLE_TOKEN_ADDRESS as `0x${string}`, UNI_WETH, FEE_TIER],
      });
      setPoolExists(pool !== "0x0000000000000000000000000000000000000000");
    } catch { setPoolExists(false); }
  }, [client]);

  /* ── Get price quote ──────────────────────────────────── */
  const getQuote = useCallback(async (amountIn: bigint) => {
    if (!client || amountIn === 0n) { setQuote(null); return; }
    setIsQuoting(true);
    setError(null);
    try {
      const { result } = await client.simulateContract({
        address: UNI_QUOTER_V2,
        abi: QUOTER_ABI,
        functionName: "quoteExactInputSingle",
        args: [{
          tokenIn:           CYCLE_TOKEN_ADDRESS as `0x${string}`,
          tokenOut:          UNI_WETH,
          amountIn,
          fee:               FEE_TIER,
          sqrtPriceLimitX96: 0n,
        }],
      });
      setQuote(result[0]);
    } catch {
      setQuote(null);
      setError("No liquidity pool found for CYCLE/WETH on Sepolia");
    } finally { setIsQuoting(false); }
  }, [client]);

  /* ── Execute swap ─────────────────────────────────────── */
  const swap = useCallback(async (amountIn: bigint, minAmountOut: bigint) => {
    if (!address || !walletClient || !client) return;
    setIsSwapping(true);
    setError(null);
    setTxHash(null);
    try {
      // 1. Approve router if needed
      const allowance = await client.readContract({
        address: CYCLE_TOKEN_ADDRESS as `0x${string}`,
        abi: CYCLE_TOKEN_ABI,
        functionName: "allowance",
        args: [address, UNI_ROUTER],
      }) as bigint;

      if (allowance < amountIn) {
        const approveTx = await walletClient.writeContract({
          address: CYCLE_TOKEN_ADDRESS as `0x${string}`,
          abi: CYCLE_TOKEN_ABI,
          functionName: "approve",
          args: [UNI_ROUTER, maxUint256],
        });
        await client.waitForTransactionReceipt({ hash: approveTx });
      }

      // 2. Execute swap
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min
      const hash = await walletClient.writeContract({
        address: UNI_ROUTER,
        abi: ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [{
          tokenIn:           CYCLE_TOKEN_ADDRESS as `0x${string}`,
          tokenOut:          UNI_WETH,
          fee:               FEE_TIER,
          recipient:         address,
          amountIn,
          amountOutMinimum:  minAmountOut,
          sqrtPriceLimitX96: 0n,
        }],
      });
      setTxHash(hash);
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? "Swap failed");
    } finally { setIsSwapping(false); }
  }, [address, walletClient, client]);

  return { quote, poolExists, isQuoting, isSwapping, txHash, error, getQuote, checkPool, swap };
}
