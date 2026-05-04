import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StakingPanel } from "@/components/StakingPanel";
import { UserPosition } from "@/components/UserPosition";
import { StatsBar } from "@/components/StatsBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-deep">
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Main staking interface */}
      <section className="py-16 bg-bg-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <StakingPanel />
            <UserPosition />
          </div>
        </div>
      </section>

      {/* Protocol stats */}
      <StatsBar />

      {/* Footer */}
      <footer className="border-t border-[rgba(0,198,255,0.1)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-accent-cyan to-accent-purple" />
            <span className="font-display font-semibold text-text-secondary">BCL DApp</span>
            <span>·</span>
            <span>Block Cycle Labs</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="badge-network text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
              Sepolia Testnet
            </span>
            <a
              href="https://bcl.sannisanni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors"
            >
              bcl.sannisanni.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
