"use client";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/config/wagmi";
import { Toaster } from "react-hot-toast";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const bclTheme = darkTheme({
  accentColor: "#00C6FF",
  accentColorForeground: "#040D1A",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={bclTheme} modalSize="compact">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: "#0A1929",
                color: "#F1F5F9",
                border: "1px solid rgba(0,198,255,0.2)",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
              },
              success: {
                iconTheme: { primary: "#00FF94", secondary: "#040D1A" },
              },
              error: {
                iconTheme: { primary: "#F87171", secondary: "#040D1A" },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
