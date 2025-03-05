"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  LinkIcon,
  Coins,
  BarChart2,
  Shield,
  Calculator,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useContractRead } from "@/lib/contract";
import { formatEther } from "viem";
export default function DSCInfoPage() {
  const [mintAmount, setMintAmount] = useState("");
  const [collateralNeeded, setCollateralNeeded] = useState("");
  const [totalMinted, setTotalMinted] = useState<string>("0");
  const [totalSupply, setTotalSupply] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dscAddress, setDscAddress] = useState<string | null>(null);

  const { getTotalDscMinted, getTotalCollateralValueInUsd, getDsc } =
    useContractRead();

    const fetchContractData = async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setIsRefreshing(true);
        }
    
        const [minted, collateralValue, dscAddr] = await Promise.all([
          getTotalDscMinted(),
          getTotalCollateralValueInUsd(),
          getDsc(),
        ]);
    
        if (minted === undefined) {
          console.error("Error: getTotalDscMinted returned undefined");
          setTotalMinted("0");
        } else {
          setTotalMinted(
            Number(formatEther(minted)).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
          );
        }
    
        if (collateralValue === undefined) {
          console.error("Error: getTotalCollateralValueInUsd returned undefined");
          setTotalSupply("0");
        } else {
          setTotalSupply(
            Number(formatEther(collateralValue)).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
          );
        }
    
        if (dscAddr) {
          setDscAddress(dscAddr);
        } else {
          console.error("Error: getDsc returned undefined");
          setDscAddress("N/A");
        }
      } catch (error) {
        console.error("Error fetching contract data:", error);
      } finally {
        setIsLoading(false);
        if (showRefreshState) {
          setIsRefreshing(false);
        }
      }
    };

  useEffect(() => {
    fetchContractData();
    const interval = setInterval(() => fetchContractData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateCollateral = () => {
    const collateral = Number.parseFloat(mintAmount) * 2;
    setCollateralNeeded(collateral.toFixed(2));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Skeleton loader component for statistics
  const StatisticSkeleton = () => (
    <div className="flex items-center text-lg animate-pulse">
      <div className="w-5 h-5 mr-3 bg-cyan-400/20 rounded" />
      <div className="h-6 bg-cyan-400/20 rounded w-24" />
      <div className="ml-2 h-6 bg-cyan-400/20 rounded w-32" />
    </div>
  );

  return (
    <main className="min-h-screen text-white p-8 relative">
      {/* Content */}
      <div className="relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-6xl font-bold font-display bg-gradient-to-r from-[#00ff9d] via-[#00ff9d] to-[#9fff00] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,157,0.3)]">
            DSC Coin Information
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-[#0c1628]/40 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <CardHeader className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 p-6 rounded-t-lg border-b border-cyan-800/30">
                <CardTitle className="text-2xl font-display text-cyan-400 flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart2 className="w-6 h-6 mr-2" />
                    DSC Statistics
                  </div>
                  {isRefreshing && (
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {isLoading ? (
                  <>
                    <StatisticSkeleton />
                    <StatisticSkeleton />
                  </>
                ) : (
                  <>
                    <p className="flex items-center text-lg">
                      <LinkIcon className="w-5 h-5 mr-3 text-cyan-400" />
                      <span className="text-gray-400">Total Volume Locked:</span>
                      <span className="ml-2 text-cyan-400 font-semibold">
                       $ {totalSupply} 
                      </span>
                    </p>
                    <p className="flex items-center text-lg">
                      <ArrowRight className="w-5 h-5 mr-3 text-cyan-400" />
                      <span className="text-gray-400">Total Minted:</span>
                      <span className="ml-2 text-cyan-400 font-semibold">
                        {totalMinted} DSC
                      </span>
                    </p>
                    <p className="flex items-center text-lg">
                      <LinkIcon className="w-5 h-5 mr-3 text-cyan-400" />
                      <span className="text-gray-400">DSC Address:</span>
                      <span className="ml-2 text-cyan-400 font-semibold">
                        {dscAddress ? (
                          <a
                            href={`https://sepolia.etherscan.io/address/${dscAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            {dscAddress.slice(0, 6)}...{dscAddress.slice(-4)}
                          </a>
                        ) : (
                          "Fetching..."
                        )}
                      </span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#0c1628]/40 border-lime-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
              <CardHeader className="bg-gradient-to-r from-green-950/50 to-lime-950/50 p-6 rounded-t-lg border-b border-lime-800/30">
                <CardTitle className="text-2xl font-display text-lime-400 flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  Collateral Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <motion.div
                  className="flex items-center text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-12 h-12 rounded-full bg-lime-900/30 flex items-center justify-center mr-4">
                    <span className="text-lime-400 font-bold">200%</span>
                  </div>
                  <span className="text-lime-400">
                    Collateralization Required
                  </span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-[#0c1628]/40 border-green-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
              <CardHeader className="bg-gradient-to-r from-green-950/50 to-teal-950/50 p-6 rounded-t-lg border-b border-green-800/30">
                <CardTitle className="text-2xl font-display text-green-400 flex items-center">
                  <Coins className="w-6 h-6 mr-2" />
                  Collateral Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="relative w-12 h-12 bg-blue-900/30 rounded-full p-2 flex items-center justify-center">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ethereum-eth-logo-oMi0Xw6gdpYDutLnE0sqG28B3DaJok.svg"
                      alt="WETH Logo"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                  <span className="text-blue-400 text-lg">
                    WETH (Wrapped Ethereum)
                  </span>
                </motion.div>
                
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-[#0c1628]/40 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <CardHeader className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 p-6 rounded-t-lg border-b border-cyan-800/30">
                <CardTitle className="text-2xl font-display text-cyan-400 flex items-center">
                  <Calculator className="w-6 h-6 mr-2" />
                  Collateral Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label
                    htmlFor="mintAmount"
                    className="block text-lg font-medium text-gray-400 mb-2"
                  >
                    DSC Amount to Mint
                  </label>
                  <Input
                    id="mintAmount"
                    type="number"
                    placeholder="Enter DSC amount"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    className="bg-[#0c1628]/60 border-cyan-900/50 text-cyan-400 placeholder-cyan-900 focus:ring-cyan-500 focus:border-cyan-500 text-lg h-12"
                  />
                </div>
                <Button
                  onClick={calculateCollateral}
                  className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white font-semibold py-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 text-lg h-12"
                >
                  Calculate Collateral
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {collateralNeeded && (
                  <motion.div
                    className="mt-4 p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-center text-lg">
                      Collateral needed:{" "}
                      <strong className="text-cyan-400 text-xl">
                        {collateralNeeded} USD
                      </strong>
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
