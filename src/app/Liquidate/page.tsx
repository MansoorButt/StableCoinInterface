"use client";

// src/components/LiquidationDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { toast } from "react-hot-toast";
import { SCEngineABI as engineAbi } from "@/lib/abi.json";
import { useContractWrite } from "@/lib/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  BarChart2,
  Coins,
  Wallet,
  ArrowUpRight,
  Shield,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Zap,
} from "lucide-react";

interface PriceFeed {
  token: string;
  priceInUsd: string;
  timestamp: string;
}

interface LiquidationDetail {
  token: string;
  debtToCover: string;
  collateralToReceive: string;
  profitEstimate: string;
  profitableToLiquidate: boolean;
}

interface LiquidationOpportunity {
  address: string;
  healthFactor: string;
  healthFactorFormatted: string;
  collateralValueInUsd: string;
  dscMinted: string;
  liquidatable: boolean;
  lastUpdated: string;
  liquidationDetails: LiquidationDetail[];
}

interface DepositEvent {
  blockNumber: number;
  transactionHash: string;
  user: string;
  amount: string;
  token: string;
  timestamp: string;
}

interface ProtocolMetrics {
  totalDscMinted: string;
  totalCollateralValueInUsd: string;
  collateralizationRatio: string;
  accounts: number;
  liquidationOpportunities: number;
}

// Known token addresses for display
const tokenAddressMap: Record<string, { symbol: string; name: string }> = {
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9": {
    symbol: "WETH",
    name: "Wrapped Ether",
  },
  // Add other token addresses here
};

// Format address for display
const formatAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Format numbers for display
const formatNumber = (value: string, decimals = 6): string => {
  try {
    // If it's a BigNumber-compatible string
    return parseFloat(formatEther(value)).toFixed(decimals);
  } catch (e) {
    // If it's already a decimal string
    return parseFloat(value).toFixed(decimals);
  }
};

// Format USD values
const formatUsd = (value: string): string => {
  try {
    const valueInEther = formatEther(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(valueInEther));
  } catch (e) {
    return "$0.00";
  }
};

// Get token info
const getTokenInfo = (address: string) => {
  if (tokenAddressMap[address]) {
    return tokenAddressMap[address];
  }
  return { symbol: "Unknown", name: "Unknown Token" };
};

const SC_ENGINE_ADDRESS = "0x28083fa0d374a254d107da7db026cd8c3bd97b28";

const LiquidationDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();

  const [liquidationOpportunities, setLiquidationOpportunities] = useState<
    LiquidationOpportunity[]
  >([]);
  const [depositEvents, setDepositEvents] = useState<DepositEvent[]>([]);
  const [priceFeeds, setPriceFeeds] = useState<PriceFeed[]>([]);
  const [metrics, setMetrics] = useState<ProtocolMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<LiquidationOpportunity | null>(null);
  const [selectedDetail, setSelectedDetail] =
    useState<LiquidationDetail | null>(null);
  const [isLiquidating, setIsLiquidating] = useState<boolean>(false);

  // Contract write hook for liquidation
  const { liquidate } = useContractWrite();

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch liquidation opportunities
      const liquidationsRes = await fetch(
        "https://stablecoinsvc.onrender.com/api/liquidations"
      );
      const liquidationsData = await liquidationsRes.json();
      setLiquidationOpportunities(liquidationsData);

      // Fetch deposit events
      const eventsRes = await fetch("https://stablecoinsvc.onrender.com/api/events");
      const eventsData = await eventsRes.json();

      setDepositEvents(eventsData.events || []);

      // Fetch price feeds
      const pricesRes = await fetch("https://stablecoinsvc.onrender.com/api/prices");
      const pricesData = await pricesRes.json();
      console.log(pricesData);
      setPriceFeeds(pricesData);

      // Fetch protocol metrics
      const metricsRes = await fetch("https://stablecoinsvc.onrender.com/api/metrics");
      const metricsData = await metricsRes.json();

      setMetrics(metricsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Execute liquidation function
  const handleLiquidate = async () => {
    if (!selectedOpportunity || !selectedDetail || !isConnected) {
      toast.error("Please select a valid liquidation opportunity");
      return;
    }

    setIsLiquidating(true);
    try {
      // Convert the debtToCover string into a bigint as required by the contract
      const txHash = await liquidate(
        selectedDetail.token as `0x${string}`,
        selectedOpportunity.address,
        BigInt(selectedDetail.debtToCover)
      );
      toast.success(`Liquidation transaction sent: ${txHash}`);
      // Optionally wait or poll for confirmation here if needed
      fetchData(); // Refresh dashboard data
    } catch (error) {
      console.error("Error executing liquidation:", error);
      toast.error("Failed to execute liquidation");
    } finally {
      setIsLiquidating(false);
    }
  };

  // Effect for initial data load
  useEffect(() => {
    fetchData();

    // Setup polling interval
    // const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 text-white">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-[#00ff9d] via-[#00ff9d] to-[#9fff00] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,157,0.3)]">
          Liquidation Dashboard
        </h1>
        <p className="mt-4 text-gray-400 text-lg">
          Monitor and execute liquidations for under-collateralized positions
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-[#0c1628]/40 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                <CardHeader className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 p-6 border-b border-cyan-800/30">
                  <CardTitle className="text-2xl font-display text-cyan-400 flex items-center">
                    <BarChart2 className="w-6 h-6 mr-2" />
                    Protocol Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <MetricCard
                      icon={<Coins className="w-8 h-8 text-cyan-400" />}
                      title="Total DSC Minted"
                      value={formatUsd(metrics.totalDscMinted)}
                    />
                    <MetricCard
                      icon={<Wallet className="w-8 h-8 text-lime-400" />}
                      title="Total Collateral Value"
                      value={formatUsd(metrics.totalCollateralValueInUsd)}
                    />
                    <MetricCard
                      icon={<Shield className="w-8 h-8 text-green-400" />}
                      title="Collateralization Ratio"
                      value={`${(
                        Number.parseFloat(
                          formatEther(metrics.collateralizationRatio)
                        ) * 100
                      ).toFixed(2)}%`}
                    />
                    {priceFeeds && priceFeeds.length > 0 && (
                      <MetricCard
                        icon={
                          <ArrowUpRight className="w-8 h-8 text-yellow-400" />
                        }
                        title="WETH/USD"
                        value={formatUsd(priceFeeds[0].priceInUsd)}
                      />
                    )}
                    <MetricCard
                      icon={<ArrowUpRight className="w-8 h-8 text-blue-400" />}
                      title="Total Accounts"
                      value={metrics.accounts.toString()}
                    />
                    <MetricCard
                      icon={<AlertTriangle className="w-8 h-8 text-red-400" />}
                      title="Liquidation Opportunities"
                      value={metrics.liquidationOpportunities.toString()}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-[#0c1628]/40 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <CardHeader className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 p-6 border-b border-cyan-800/30">
                <CardTitle className="text-2xl font-display text-cyan-400 flex items-center">
                  {/* You can add an icon here if desired */}
                  Deposit Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border border-gray-800 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Block</TableHead>
                        <TableHead className="text-gray-400">
                          Txn Hash
                        </TableHead>
                        <TableHead className="text-gray-400">Amount</TableHead>
                        <TableHead className="text-gray-400">Token</TableHead>
                        <TableHead className="text-gray-400">User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depositEvents.map((event) => (
                        <TableRow
                          key={event.transactionHash}
                          className="border-gray-800 hover:bg-gray-800/50"
                        >
                          <TableCell className="text-gray-300">
                            {event.blockNumber}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <a
                              href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline"
                            >
                              {event.transactionHash}
                            </a>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatUsd(event.amount)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {getTokenInfo(event.token).symbol}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatAddress(event.user)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-[#0c1628]/40 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <CardHeader className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 p-6 border-b border-cyan-800/30">
                <CardTitle className="text-2xl font-display text-cyan-400 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Liquidation Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-md border border-gray-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Account</TableHead>
                        <TableHead className="text-gray-400">
                          Health Factor
                        </TableHead>
                        <TableHead className="text-gray-400">
                          Collateral Value
                        </TableHead>
                        <TableHead className="text-gray-400">
                          DSC Minted
                        </TableHead>
                        <TableHead className="text-gray-400">
                          Last Updated
                        </TableHead>
                        <TableHead className="text-right text-gray-400">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liquidationOpportunities.map((opportunity) => (
                        <TableRow
                          key={opportunity.address}
                          className="border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => setSelectedOpportunity(opportunity)}
                        >
                          <TableCell className="font-medium text-gray-300">
                            {formatAddress(opportunity.address)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                                Number.parseFloat(
                                  opportunity.healthFactorFormatted
                                ) < 1
                                  ? "bg-red-900/20 text-red-400"
                                  : "bg-green-900/20 text-green-400"
                              }`}
                            >
                              {Number.parseFloat(
                                opportunity.healthFactorFormatted
                              ).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatUsd(opportunity.collateralValueInUsd)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatUsd(opportunity.dscMinted)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(opportunity.lastUpdated).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOpportunity(opportunity);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {selectedOpportunity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-[#0c1628]/40 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                <CardHeader className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 p-6 border-b border-cyan-800/30">
                  <CardTitle className="text-2xl font-display text-cyan-400 flex items-center">
                    <Zap className="w-6 h-6 mr-2" />
                    Liquidation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Account: {formatAddress(selectedOpportunity.address)}
                    </h3>
                    <p className="text-gray-400">
                      Health Factor: {selectedOpportunity.healthFactorFormatted}
                    </p>
                  </div>

                  <div className="rounded-md border border-gray-800">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-800/50">
                          <TableHead className="text-gray-400">Token</TableHead>
                          <TableHead className="text-gray-400">
                            Debt to Cover
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Collateral to Receive
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Profit Estimate
                          </TableHead>
                          <TableHead className="text-right text-gray-400">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOpportunity.liquidationDetails.map(
                          (detail, index) => (
                            <TableRow
                              key={index}
                              className="border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                              onClick={() => setSelectedDetail(detail)}
                            >
                              <TableCell className="font-medium text-gray-300">
                                {detail.token}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {formatUsd(detail.debtToCover)}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {formatUsd(detail.collateralToReceive)}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {formatUsd(detail.profitEstimate)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDetail(detail);
                                  }}
                                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                                >
                                  Select
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedDetail && (
                    <div className="mt-6">
                      <Button
                        onClick={handleLiquidate}
                        disabled={isLiquidating}
                        className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white font-semibold py-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                      >
                        {isLiquidating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Liquidating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Execute Liquidation
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

const MetricCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-700/50">
    <div className="flex items-center justify-between mb-2">
      <div className="bg-gray-700/50 p-2 rounded-full">{icon}</div>
    </div>
    <p className="text-gray-400 text-sm">{title}</p>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);

export default LiquidationDashboard;
