"use client";

import { useState, useEffect, useCallback } from "react";
import { parseUnits, formatUnits, isAddress } from "viem";
import { useAccount } from "wagmi";
import { StakingPanel } from "./StakingPanel";
import { UserPosition } from "./UserPosition";
import { useToken } from "@/hooks/useToken";
import { useSwap, UNI_WETH, UNI_FACTORY, FEE_TIER } from "@/hooks/useSwap";
import { useSend } from "@/hooks/useSend";
import { formatCycle } from "@/lib/format";
import { CYCLE_TOKEN_ADDRESS, CYCLE_STAKING_ADDRESS } from "@/lib/contracts";
import toast from "react-hot-toast";

const PP   = "'Poppins', var(--font-poppins), system-ui, sans-serif";
const MONO = "'Space Mono', var(--font-mono), monospace";
const LOGO = "https://i.ibb.co/XZXzy5Rt/68aee553aa779e1297fca7eb.png";

type Tab = "stake" | "swap" | "send" | "pool";

const TABS: { id: Tab; label: string }[] = [
  { id: "stake", label: "Stake" },
  { id: "swap",  label: "Swap"  },
  { id: "send",  label: "Send"  },
  { id: "pool",  label: "Pool"  },
];

/* ── Shared input style ─────────────────────────────────── */
const inputStyle = (err = false): React.CSSProperties => ({
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: `1.5px solid ${err ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.14)"}`,
  borderRadius: 10, height: 52,
  padding: "0 14px",
  color: "#fff",
  fontFamily: MONO, fontSize: 16, fontWeight: 600,
  outline: "none",
});

const labelStyle: React.CSSProperties = {
  fontFamily: PP, fontSize: 10, fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.09em",
  color: "rgba(255,255,255,0.50)", marginBottom: 6, display: "block",
};

/* ── Token pill (Swap) ──────────────────────────────────── */
function TokenPill({ symbol, logo }: { symbol: string; logo?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 20, padding: "5px 10px 5px 6px",
      fontFamily: PP, fontWeight: 700, fontSize: 12, color: "#fff",
      flexShrink: 0,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "linear-gradient(135deg,#1a3baf,#2563EB)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {logo
          ? <img src={logo} width={13} height={13} alt={symbol} style={{ objectFit: "contain" }} />
          : <span style={{ fontSize: 11 }}>Ξ</span>
        }
      </div>
      {symbol}
    </div>
  );
}

/* ── Swap form ──────────────────────────────────────────── */
function SwapForm() {
  const { isConnected } = useAccount();
  const { balance } = useToken();
  const { quote, poolExists, isQuoting, isSwapping, txHash, error, getQuote, checkPool, swap } = useSwap();

  const [input, setInput] = useState("");
  const SLIPPAGE = 0.005; // 0.5%

  const parsed = (() => { try { return input ? parseUnits(input, 18) : 0n; } catch { return 0n; } })();
  const minOut  = quote ? BigInt(Math.floor(Number(quote) * (1 - SLIPPAGE))) : 0n;
  const overBal = parsed > balance && parsed > 0n;

  useEffect(() => { checkPool(); }, [checkPool]);
  useEffect(() => {
    const t = setTimeout(() => { if (parsed > 0n) getQuote(parsed); else setInput(prev => prev); }, 500);
    return () => clearTimeout(t);
  }, [parsed, getQuote]);

  useEffect(() => {
    if (txHash) { toast.success("Swap successful!"); setInput(""); }
  }, [txHash]);

  async function handleSwap() {
    if (!isConnected || parsed === 0n || overBal || !quote) return;
    try { await swap(parsed, minOut); } catch { /* error is in state */ }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 16px" }}>

      {/* From */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={labelStyle}>You Pay</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            Bal: {formatCycle(balance)}
          </span>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 8 }}>
          <input
            type="number" min="0" step="any" placeholder="0.0"
            value={input} onChange={e => setInput(e.target.value)}
            style={{ ...inputStyle(overBal), flex: 1 }}
          />
          <TokenPill symbol="CYCLE" logo={LOGO} />
        </div>
        <button
          onClick={() => setInput(formatUnits(balance, 18))}
          style={{ fontFamily: PP, fontSize: 10, fontWeight: 700, color: "#3B82F6", background: "none", border: "none", cursor: "pointer", marginTop: 5, padding: 0 }}
        >MAX</button>
      </div>

      {/* Arrow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.55)", fontSize: 14,
        }}>↓</div>
      </div>

      {/* To */}
      <div>
        <span style={labelStyle}>You Receive (est.)</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            flex: 1, height: 52, borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
            display: "flex", alignItems: "center", padding: "0 14px",
            fontFamily: MONO, fontSize: 16, color: quote ? "#fff" : "rgba(255,255,255,0.28)",
          }}>
            {isQuoting ? "…" : quote ? formatUnits(quote, 18).slice(0, 10) : "0.0"}
          </div>
          <TokenPill symbol="WETH" />
        </div>
      </div>

      {/* Rate info */}
      {quote && parsed > 0n && !overBal && (
        <div style={{
          background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)",
          borderRadius: 10, padding: "9px 12px",
          display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: PP, fontSize: 11, color: "rgba(255,255,255,0.50)" }}>Rate</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: "#fff" }}>
            1 CYCLE = {(Number(formatUnits(quote, 18)) / Number(formatUnits(parsed, 18))).toFixed(8)} WETH
          </span>
        </div>
      )}

      {/* Pool not found */}
      {poolExists === false && (
        <div style={{
          background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.22)",
          borderRadius: 10, padding: "10px 12px",
          fontFamily: PP, fontSize: 12, color: "#F59E0B",
        }}>
          ⚠ No CYCLE/WETH liquidity pool on Sepolia yet. Swap will fail until a pool is created.
        </div>
      )}

      {error && <p style={{ fontFamily: PP, fontSize: 12, color: "#EF4444" }}>{error}</p>}
      {overBal && <p style={{ fontFamily: PP, fontSize: 12, color: "#EF4444" }}>⚠ Insufficient balance</p>}

      {/* Slippage */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: PP, fontSize: 10, color: "rgba(255,255,255,0.40)" }}>Slippage tolerance</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.55)" }}>0.5%</span>
      </div>

      <button
        onClick={handleSwap}
        disabled={!isConnected || parsed === 0n || overBal || isSwapping || isQuoting || !quote}
        className="btn-primary w-full"
        style={{ height: 50, fontSize: 13 }}
      >
        {!isConnected ? "Connect Wallet" : isSwapping ? "Swapping…" : "Swap CYCLE → WETH"}
      </button>

      {txHash && (
        <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer"
          style={{ fontFamily: PP, fontSize: 11, color: "#3B82F6", textAlign: "center", textDecoration: "none" }}>
          View transaction ↗
        </a>
      )}
    </div>
  );
}

/* ── Send form ──────────────────────────────────────────── */
function SendForm() {
  const { isConnected } = useAccount();
  const { balance } = useToken();
  const { send, isPending, isSuccess, hash } = useSend();

  const [to, setTo]         = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr]       = useState("");

  const parsed  = (() => { try { return amount ? parseUnits(amount, 18) : 0n; } catch { return 0n; } })();
  const overBal = parsed > balance && parsed > 0n;
  const badAddr = to.length > 0 && !isAddress(to);

  useEffect(() => {
    if (isSuccess) { toast.success("CYCLE sent!"); setTo(""); setAmount(""); setErr(""); }
  }, [isSuccess]);

  async function handleSend() {
    setErr("");
    try { await send(to, parsed); }
    catch (e: any) { setErr(e?.shortMessage ?? e?.message ?? "Transaction failed"); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 16px" }}>

      <div>
        <span style={labelStyle}>Recipient Address</span>
        <input
          type="text" placeholder="0x…"
          value={to} onChange={e => setTo(e.target.value)}
          style={{ ...inputStyle(badAddr), fontSize: 13 }}
        />
        {badAddr && <p style={{ fontFamily: PP, fontSize: 11, color: "#EF4444", marginTop: 4 }}>Invalid address</p>}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={labelStyle}>Amount</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            Bal: {formatCycle(balance)} CYCLE
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number" min="0" step="any" placeholder="0.0"
            value={amount} onChange={e => setAmount(e.target.value)}
            style={{ ...inputStyle(overBal), flex: 1 }}
          />
          <TokenPill symbol="CYCLE" logo={LOGO} />
        </div>
        <button
          onClick={() => setAmount(formatUnits(balance, 18))}
          style={{ fontFamily: PP, fontSize: 10, fontWeight: 700, color: "#3B82F6", background: "none", border: "none", cursor: "pointer", marginTop: 5, padding: 0 }}
        >MAX</button>
      </div>

      {overBal && <p style={{ fontFamily: PP, fontSize: 12, color: "#EF4444" }}>⚠ Insufficient balance</p>}
      {err     && <p style={{ fontFamily: PP, fontSize: 12, color: "#EF4444" }}>{err}</p>}

      <button
        onClick={handleSend}
        disabled={!isConnected || parsed === 0n || overBal || badAddr || !isAddress(to) || isPending}
        className="btn-primary w-full"
        style={{ height: 50, fontSize: 13 }}
      >
        {!isConnected ? "Connect Wallet" : isPending ? "Sending…" : "Send CYCLE"}
      </button>

      {hash && (
        <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer"
          style={{ fontFamily: PP, fontSize: 11, color: "#3B82F6", textAlign: "center", textDecoration: "none" }}>
          View transaction ↗
        </a>
      )}
    </div>
  );
}

/* ── Pool panel ─────────────────────────────────────────── */
function PoolPanel() {
  const { checkPool, poolExists } = useSwap();
  useEffect(() => { checkPool(); }, [checkPool]);

  const uniswapPoolUrl = `https://app.uniswap.org/explore/pools/ethereum_sepolia`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 16px" }}>

      {/* Pool info card */}
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 12, padding: "14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#1a3baf,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={LOGO} width={16} height={16} alt="CYCLE" style={{ objectFit: "contain" }} />
            </div>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -8 }}>
              <span style={{ fontSize: 14 }}>Ξ</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: PP, fontWeight: 700, fontSize: 14, color: "#fff" }}>CYCLE / WETH</div>
            <div style={{ fontFamily: PP, fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Uniswap V3 · 0.3% fee · Sepolia</div>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
          borderRadius: 8,
          background: poolExists === true
            ? "rgba(16,185,129,0.10)" : poolExists === false
            ? "rgba(245,158,11,0.10)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${poolExists === true ? "rgba(16,185,129,0.25)" : poolExists === false ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.10)"}`,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: poolExists === true ? "#10B981" : poolExists === false ? "#F59E0B" : "rgba(255,255,255,0.35)",
          }} />
          <span style={{ fontFamily: PP, fontSize: 12, color: poolExists === true ? "#10B981" : poolExists === false ? "#F59E0B" : "rgba(255,255,255,0.55)" }}>
            {poolExists === null ? "Checking pool…" : poolExists ? "Pool exists on Sepolia" : "No pool yet — be the first to add liquidity"}
          </span>
        </div>
      </div>

      {/* Contract info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "CYCLE Token", addr: CYCLE_TOKEN_ADDRESS },
          { label: "WETH",        addr: UNI_WETH },
          { label: "Uniswap V3 Router", addr: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48" },
        ].map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: PP, fontSize: 10, color: "rgba(255,255,255,0.40)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{r.label}</span>
            <a href={`https://sepolia.etherscan.io/address/${r.addr}`} target="_blank" rel="noreferrer"
              style={{ fontFamily: MONO, fontSize: 10, color: "#3B82F6", textDecoration: "none" }}>
              {r.addr.slice(0, 8)}…{r.addr.slice(-5)} ↗
            </a>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <a href={uniswapPoolUrl} target="_blank" rel="noreferrer"
        className="btn-primary w-full"
        style={{ height: 46, fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {poolExists ? "Manage Liquidity on Uniswap ↗" : "Create Pool on Uniswap ↗"}
      </a>

      <p style={{ fontFamily: PP, fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 1.6 }}>
        Liquidity provision is handled directly on Uniswap V3. Your LP tokens remain in your wallet.
      </p>
    </div>
  );
}

/* ── Action Panel (main export) ─────────────────────────── */
export function ActionPanel({ forcedTab }: { forcedTab?: Tab | null }) {
  const [tab, setTab] = useState<Tab>("stake");

  useEffect(() => {
    if (forcedTab) setTab(forcedTab);
  }, [forcedTab]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 4px", flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: PP, fontWeight: tab === t.id ? 700 : 500,
            fontSize: 12.5, letterSpacing: "0.03em",
            color: tab === t.id ? "#fff" : "rgba(255,255,255,0.45)",
            padding: "13px 15px",
            background: "transparent", border: "none",
            borderBottom: `2px solid ${tab === t.id ? "#fff" : "transparent"}`,
            cursor: "pointer", transition: "all 0.18s", textTransform: "uppercase",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "stake" && (
          <>
            <StakingPanel />
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />
            <UserPosition />
          </>
        )}
        {tab === "swap" && <SwapForm />}
        {tab === "send" && <SendForm />}
        {tab === "pool" && <PoolPanel />}
      </div>
    </div>
  );
}
