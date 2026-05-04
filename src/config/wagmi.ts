import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "bcl-dapp-local-dev";

export const wagmiConfig = getDefaultConfig({
  appName: "BCL DApp",
  projectId,
  chains: [sepolia],
  ssr: true,
});
