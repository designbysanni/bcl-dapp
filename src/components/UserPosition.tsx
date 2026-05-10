"use client";

import { useAccount } from "wagmi";
import { useStaking } from "@/hooks/useStaking";
import { useToken } from "@/hooks/useToken";
import { formatCycle } from "@/lib/format";
import { RewardCounter } from "./RewardCounter";
import { etherscanAddress, CYCLE_STAKING_ADDRESS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { useEffect } from "react";

const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";

const S: Record<string, React.CSSProperties> = {
  panel: { display: 'flex', flexDirection: 'column', gap: 0 },
  body:  { padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  titleRow: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 },
  title: {
    fontFamily: PP, fontWeight: 700, fontSize: 15,
    color: '#ffffff', letterSpacing: '-0.01em',
  },
  ethLink: {
    fontFamily: PP, fontSize: 10,
    color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
    letterSpacing: '0.03em', transition: 'color 0.15s',
  },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  rowKey: {
    fontFamily: PP, fontSize: 10, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.09em',
    color: 'rgba(255,255,255,0.50)',
  },
  rowVal: {
    fontFamily: MONO, fontSize: 13, fontWeight: 700, color: '#ffffff',
  },
  apyBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)',
    borderRadius: 10, padding: '10px 14px',
  },
  apyDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#22c55e', flexShrink: 0,
    boxShadow: '0 0 6px rgba(34,197,94,0.6)',
  },
  apyText: {
    fontFamily: PP, fontWeight: 700, fontSize: 13, color: '#22c55e',
  },
  apySub: {
    fontFamily: PP, fontWeight: 400, fontSize: 11,
    color: 'rgba(255,255,255,0.42)', marginTop: 2,
  },
  emptyState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px', gap: 12, textAlign: 'center',
  },
};

export function UserPosition() {
  const { isConnected } = useAccount();
  const {
    stakedBalance, pendingRewards,
    claimRewards, txSuccess, isLoading, refetchAll,
  } = useStaking();
  const { balance, refetch: refetchToken } = useToken();

  useEffect(() => {
    if (txSuccess) {
      toast.success("Rewards claimed! ✓");
      refetchAll();
      refetchToken();
    }
  }, [txSuccess]);

  const hasStaked  = stakedBalance  > 0n;
  const hasRewards = pendingRewards > 0n;

  return (
    <div style={S.panel}>
      <div style={S.body}>

        {!isConnected ? (
          <div style={S.emptyState}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🔒</div>
            <div>
              <p style={{ fontFamily: PP, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.72)' }}>
                Connect your wallet
              </p>
              <p style={{ fontFamily: PP, fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>
                to view your position
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={S.titleRow}>
              <span style={S.title}>Your Position</span>
              <a
                href={etherscanAddress(CYCLE_STAKING_ADDRESS)}
                target="_blank" rel="noopener noreferrer"
                style={S.ethLink}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.65)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.38)'}
              >View contract on Etherscan ↗</a>
            </div>

            <div>
              <div style={S.row}>
                <span style={S.rowKey}>Wallet Balance</span>
                <span style={S.rowVal}>{formatCycle(balance)} CYCLE</span>
              </div>
              <div style={S.row}>
                <span style={S.rowKey}>Staked Amount</span>
                <span style={{ ...S.rowVal, color: hasStaked ? '#60a5fa' : '#ffffff' }}>
                  {formatCycle(stakedBalance)} CYCLE
                </span>
              </div>
              <div style={{ ...S.row, borderBottom: 'none' }}>
                <span style={S.rowKey}>Pending Rewards</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <RewardCounter baseRewards={pendingRewards} stakedBalance={stakedBalance} />
                  <span style={{ fontFamily: PP, fontSize: 11, color: 'rgba(255,255,255,0.48)' }}>CYCLE</span>
                </span>
              </div>
            </div>

            <div style={S.apyBox}>
              <div style={S.apyDot} />
              <div>
                <div style={S.apyText}>12% APY — Fixed</div>
                <div style={S.apySub}>Rewards accrue every second</div>
              </div>
            </div>

            <button
              onClick={claimRewards}
              disabled={!hasRewards || isLoading}
              className="btn-secondary w-full"
              style={{ height: 48 }}
            >
              {isLoading ? (<><Spinner /> Claiming…</>) : (<>⚡ Claim Rewards</>)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" style={{ width: 15, height: 15, marginRight: 4 }} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
