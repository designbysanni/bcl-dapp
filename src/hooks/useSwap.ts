"use client";
import { usePublicClient, useWalletClient, useAccount, useBalance } from "wagmi";
import { useState, useCallback } from "react";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { CYCLE_TOKEN_ADDRESS, CYCLE_TOKEN_ABI } from "@/lib/contracts";

/* ── Sepolia Uniswap V3 addresses ───────────────────────────── */
export const UNI_WETH      = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" as const;
export const UNI_QUOTER_V2 = "0xEd1f6473345F45b75833fd55D191EBE6d520cF8F" as const;
export const UNI_ROUTER    = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48" as const;
export const UNI_FACTORY   = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c" as const;
export const FEE_TIER      = 3000;

export type SwapDirection = "CYCLE_TO_WETH" | "WETH_TO_CYCLE";

const WETH_ABI = [
  { name: "approve",   type: "function", stateMutability: "nonpayable", inputs: [{ name: "guy", type: "address" }, { name: "wad", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { name: "allowance", type: "function", stateMutability: "view",       inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

const QUOTER_ABI = [
  {
    name: "quoteExactInputSingle", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "params", type: "tuple", components: [
      { name: "tokenIn",           type: "address" },
      { name: "tokenOut",          type: "address" },
      { name: "amountIn",          type: "uint256" },
      { name: "fee",               type: "uint24"  },
      { name: "sqrtPriceLimitX96", type: "uint160" },
    ]}],
    outputs: [
      { name: "amountOut",               type: "uint256" },
      { name: "sqrtPriceX96After",       type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32"  },
      { name: "gasEstimate",             type: "uint256" },
    ],
  },
] as const;

const ROUTER_ABI = [
  {
    name: "exactInputSingle", type: "function", stateMutability: "payable",
    inputs: [{ name: "params", type: "tuple", components: [
      { name: "tokenIn",           type: "address" },
      { name: "tokenOut",          type: "address" },
      { name: "fee",               type: "uint24"  },
      { name: "recipient",         type: "address" },
      { name: "amountIn",          type: "uint256" },
      { name: "amountOutMinimum",  type: "uint256" },
      { name: "sqrtPriceLimitX96", type: "uint160" },
    ]}],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

const FACTORY_ABI = [
  {
    name: "getPool", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }, { name: "fee", type: "uint24" }],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const;

export function useSwap() {
  const { address }            = useAccount();
  const client                 = usePublicClient();
  const { data: walletClient } = useWalletClient();

  /* WETH balance for buy direction */
  const { data: wethBalData, refetch: refetchWeth } = useBalance({ address, token: UNI_WETH });
  const wethBalance: bigint = wethBalData?.value ?? 0n;

  const [quote,      setQuote]      = useState<bigint | null>(null);
  const [poolExists, setPoolExists] = useState<boolean | null>(null);
  const [isQuoting,  setIsQuoting]  = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash,     setTxHash]     = useState<string | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  /* ── Check pool ──────────────────────────────────────────── */
  const checkPool = useCallback(async () => {
    if (!client) return;
    try {
      const pool = await client.readContract({
        address: UNI_FACTORY, abi: FACTORY_ABI, functionName: "getPool",
        args: [CYCLE_TOKEN_ADDRESS as `0x${string}`, UNI_WETH, FEE_TIER],
      });
      setPoolExists(pool !== "0x0000000000000000000000000000000000000000");
    } catch { setPoolExists(false); }
  }, [client]);

  /* ── Quote (bidirectional) ───────────────────────────────── */
  const getQuote = useCallback(async (amountIn: bigint, direction: SwapDirection = "CYCLE_TO_WETH") => {
    if (!client || amountIn === 0n) { setQuote(null); return; }
    setIsQuoting(true);
    setError(null);
    const tokenIn  = direction === "CYCLE_TO_WETH" ? CYCLE_TOKEN_ADDRESS as `0x${string}` : UNI_WETH;
    const tokenOut = direction === "CYCLE_TO_WETH" ? UNI_WETH : CYCLE_TOKEN_ADDRESS as `0x${string}`;
    try {
      const { result } = await client.simulateContract({
        address: UNI_QUOTER_V2, abi: QUOTER_ABI, functionName: "quoteExactInputSingle",
        args: [{ tokenIn, tokenOut, amountIn, fee: FEE_TIER, sqrtPriceLimitX96: 0n }],
      });
      setQuote(result[0]);
    } catch {
      setQuote(null);
      setError("No liquidity pool found for CYCLE/WETH on Sepolia. Create the pool first.");
    } finally { setIsQuoting(false); }
  }, [client]);

  /* ── Swap (bidirectional) ────────────────────────────────── */
  const swap = useCallback(async (amountIn: bigint, minAmountOut: bigint, direction: SwapDirection = "CYCLE_TO_WETH") => {
    if (!address || !walletClient || !client) return;
    setIsSwapping(true);
    setError(null);
    setTxHash(null);

    const tokenIn  = direction === "CYCLE_TO_WETH" ? CYCLE_TOKEN_ADDRESS as `0x${string}` : UNI_WETH;
    const tokenOut = direction === "CYCLE_TO_WETH" ? UNI_WETH : CYCLE_TOKEN_ADDRESS as `0x${string}`;
    const approveTarget = direction === "CYCLE_TO_WETH"
      ? { address: CYCLE_TOKEN_ADDRESS as `0x${string}`, abi: CYCLE_TOKEN_ABI }
      : { address: UNI_WETH,                             abi: WETH_ABI       };

    try {
      const allowance = await client.readContract({
        ...approveTarget, functionName: "allowance", args: [address, UNI_ROUTER],
      } as any) as bigint;

      if (allowance < amountIn) {
        const approveTx = await walletClient.writeContract({
          ...approveTarget, functionName: "approve", args: [UNI_ROUTER, maxUint256],
        } as any);
        await client.waitForTransactionReceipt({ hash: approveTx });
      }

      const hash = await walletClient.writeContract({
        address: UNI_ROUTER, abi: ROUTER_ABI, functionName: "exactInputSingle",
        args: [{ tokenIn, tokenOut, fee: FEE_TIER, recipient: address, amountIn, amountOutMinimum: minAmountOut, sqrtPriceLimitX96: 0n }],
      });
      setTxHash(hash);
      refetchWeth();
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? "Swap failed");
    } finally { setIsSwapping(false); }
  }, [address, walletClient, client, refetchWeth]);

  return { quote, poolExists, wethBalance, isQuoting, isSwapping, txHash, error, getQuote, checkPool, swap };
}
