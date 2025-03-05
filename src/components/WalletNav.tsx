"use client"

import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useWeb3 } from "@/context/Web3"
import { formatEther } from "viem"
import { Home, BarChart2, Plus } from "lucide-react"
import { toast } from "react-hot-toast"

const WalletNav = () => {
  const { wethBalance, ethBalance, isConnected, address, chainId } = useWeb3()

  // Function to add DSC token to MetaMask
  const addDscToWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          "method": "wallet_watchAsset",
          "params": {
            type: "ERC20",
            options: {
              address: "0xa3312db03FA6f1CAf9c0afb4E52670C8E1638e18",
              symbol: "DSC",
              decimals: 18,
              image: "https://foo.io/token-image.svg"
            }
          },
        });
        toast.success("DSC token added to your wallet!");
      } catch (error) {
        console.error("Error adding token to wallet:", error);
        toast.error("Failed to add DSC token to wallet");
      }
    } else {
      toast.error("MetaMask is not installed");
    }
  }

  return (
    <div className="sticky top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-lime-400 hover:text-lime-300 transition-colors duration-200 font-medium text-md"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            href="/Liquidate"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors duration-200 font-medium text-md"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Liquidation & Stats</span>
          </Link>
        </div>

        {/* Wallet Connection - Right aligned */}
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={addDscToWallet}
              className="px-2 py-1.5 rounded-md bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-orange-400 border border-orange-400/50 font-medium transition-all duration-200 flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-3 h-3" />
              Add DSC Token
            </button>
          )}
          
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const unmountedProps = {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                } as const,
              }

              return (
                <div {...(!mounted ? unmountedProps : {})}>
                  {(() => {
                    if (!mounted || !account || !chain) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="px-3 py-1.5 rounded-md bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-black font-semibold transition-all duration-200 text-md"
                        >
                          Connect Wallet
                        </button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 text-sm"
                        >
                          Wrong network
                        </button>
                      )
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openChainModal}
                          className="px-2 py-1 rounded-md bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-lime-400 border border-lime-400/50 font-medium transition-all duration-200 flex items-center gap-1 text-sm"
                        >
                          {chain.hasIcon && (
                            <div className="w-4 h-4">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl || "/placeholder.svg"}
                                  className="w-4 h-4"
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        {/* Combined Balance Display */}
                        <div className="px-2 py-1 rounded-md bg-gray-800/80 backdrop-blur-sm text-lime-400 border border-lime-400/50 font-medium text-xs">
                          <span>ETH: {ethBalance ? Number(formatEther(ethBalance)).toFixed(3) : "0.000"}</span>
                          {wethBalance !== undefined && (
                            <span className="ml-2 border-l border-lime-400/30 pl-2">
                              WETH: {wethBalance ? Number(formatEther(wethBalance)).toFixed(3) : "0.000"}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={openAccountModal}
                          className="px-2 py-1 rounded-md bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-lime-400 border border-lime-400/50 font-medium transition-all duration-200 flex items-center gap-1 text-xs"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  )
}

export default WalletNav