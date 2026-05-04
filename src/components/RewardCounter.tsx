"use client";

import { useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
import { calcRewardPerSecond } from "@/lib/format";

interface RewardCounterProps {
  baseRewards: bigint;
  stakedBalance: bigint;
}

export function RewardCounter({ baseRewards, stakedBalance }: RewardCounterProps) {
  const [display, setDisplay] = useState(0);
  const startTimeRef = useRef(Date.now());
  const baseRef = useRef(0);
  const rateRef = useRef(0);

  useEffect(() => {
    baseRef.current = parseFloat(formatUnits(baseRewards, 18));
    rateRef.current = calcRewardPerSecond(stakedBalance);
    startTimeRef.current = Date.now();
  }, [baseRewards, stakedBalance]);

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const current = baseRef.current + rateRef.current * elapsed;
      setDisplay(current);
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="reward-counter font-mono text-accent-green">
      {display.toFixed(6)}
    </span>
  );
}
