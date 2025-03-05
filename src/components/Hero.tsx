"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight ,Info } from "lucide-react";

const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className="relative z-50" // Ensure button is above background
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-black font-semibold animate-shimmer"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size="lg"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex gap-3">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="lg"
                    className="text-lime-400 border-lime-400 hover:bg-lime-400/10 bg-transparent"
                  >
                    {chain.name}
                  </Button>
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    size="lg"
                    className="text-lime-400 border-lime-400 hover:bg-lime-400/10 bg-transparent"
                  >
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default function Hero() {
  const { isConnected } = useAccount();

  return (
    <div className="relative isolate flex flex-col min-h-screen">
      <div className="flex-grow flex items-center">
        <div className="mx-auto max-w-2xl px-6 py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="font-orbitron text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-lime-300 to-green-500 animate-pulse">
              Decentralized Stable Coin Protocol
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Experience the future of stable digital currency with our
              algorithmic, exogenous, USD-pegged stablecoin.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isConnected ? (
                <Link href="/dashboard">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-black font-semibold animate-shimmer"
                  >
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <CustomConnectButton />
              )}
              <Link href="/dsc-info">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lime-400 border-lime-400 hover:bg-lime-400 hover:text-black bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
               <Link href="/how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black bg-transparent"
                >
                  How It Works
                  <Info className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <footer className="relative z-10 w-full py-4 bg-gray-900/80 backdrop-blur-sm border-t border-lime-800">
        <p className="text-center text-sm text-gray-400">
          © 2025 DSC Protocol. All rights reserved.
        </p>
      </footer>
    </div>
  );
}