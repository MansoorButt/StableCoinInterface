"use client";

import { useState, useEffect } from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { sepolia, lineaSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { Web3Provider } from "@/context/Web3";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "DSC Protocol",
  projectId: "9db2098022f162c4f0e6cad18c5981c9",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [metaMaskWallet],
    },
  ],
  chains: [
    lineaSepolia,
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [sepolia, lineaSepolia]
      : []),
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          coolMode
          theme={darkTheme({
            accentColor: "#84cc16", // lime-500 to match your design
            accentColorForeground: "black",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <Web3Provider>{mounted && children}</Web3Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
