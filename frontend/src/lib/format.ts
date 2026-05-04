import { formatUnits } from "viem";

export function formatCycle(
  value: bigint,
  decimals = 18,
  maxDecimals = 4
): string {
  const formatted = formatUnits(value, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return "0.000000";
  if (num < 0.000001) return "< 0.000001";
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(maxDecimals);
  if (num < 1_000_000) return `${(num / 1000).toFixed(2)}K`;
  return `${(num / 1_000_000).toFixed(2)}M`;
}

export function formatCycleRaw(value: bigint, decimals = 18): string {
  return parseFloat(formatUnits(value, decimals)).toFixed(6);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function calcAnnualRewards(stakedAmount: bigint): bigint {
  return (stakedAmount * 12n) / 100n;
}

export function calcRewardPerSecond(stakedAmount: bigint): number {
  const staked = parseFloat(formatUnits(stakedAmount, 18));
  return (staked * 0.12) / (365 * 86400);
}
