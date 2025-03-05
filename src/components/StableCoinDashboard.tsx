"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Coins,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Shield,
  Loader2,
} from "lucide-react";
import { SC_ENGINE_ADDRESS, useWeb3 } from "@/context/Web3";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { WETH_ADDRESSES, WETH_ABI } from "@/context/Web3";
import { formatEther, parseEther } from "viem";
import { useContractRead, useContractWrite } from "@/lib/contract";

const StableCoinDashboard = () => {
  const { wethBalance, ethBalance, isConnected, chainId, address } = useWeb3();
  const [userStats, setUserStats] = useState({
    collateralValue: 0,
    dscMinted: 0,
    healthFactor: 0,
  });
  const [hasCollateral, setHasCollateral] = useState(false);

  const {
    getUserCollateralBalance,
    getCollateralUsdValue,
    getUserDscMinted,
    getUserHealthFactor,
  } = useContractRead();

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isConnected || !address) return;

      try {
        // Get user's collateral balance
        const collateralBalance = await getUserCollateralBalance();
        console.log("collateralBalance:", collateralBalance);
        const hasUserCollateral = collateralBalance > BigInt(0);
        setHasCollateral(hasUserCollateral);

        if (hasUserCollateral) {
          // Get USD value of collateral
          const collateralValue = await getCollateralUsdValue(
            collateralBalance
          );
          console.log("collateralValue:", collateralValue);

          // Get DSC minted
          const dscMinted = await getUserDscMinted();
          console.log("dscMinted:", dscMinted);

          // Get health factor
          const healthFactor = await getUserHealthFactor();
          const displayedHealthFactor = Number(healthFactor) / 1e18;
          console.log("healthFactor:", displayedHealthFactor);

          // Check if any returned value is undefined or null
          if (
            collateralValue === undefined ||
            dscMinted === undefined ||
            healthFactor === undefined
          ) {
            console.error("One or more stats values are undefined:", {
              collateralValue,
              dscMinted,
              healthFactor,
            });
            return;
          }

          setUserStats({
            collateralValue: Number(formatEther(collateralValue)),
            dscMinted: Number(formatEther(dscMinted)),
            healthFactor: Number(displayedHealthFactor.toFixed(2)),
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, [isConnected, address]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-lime-300 to-green-500 mb-2 font-display">
          Your DSC Dashboard
        </h2>
        <p className="text-gray-400 text-lg">
          Manage your decentralized stablecoin portfolio
        </p>
      </div>

      {hasCollateral && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Coins className="w-10 h-10 text-cyan-400" />}
            title="Total Collateral Value"
            value={`$${userStats.collateralValue.toFixed(2)}`}
            trend="up"
          />
          <StatCard
            icon={<Wallet className="w-10 h-10 text-lime-400" />}
            title="DSC Minted"
            value={`${userStats.dscMinted.toFixed(2)}`}
            trend="down"
          />
          <StatCard
            icon={<BarChart3 className="w-10 h-10 text-green-400" />}
            title="Health Factor"
            value={`${userStats.healthFactor.toFixed(2)}`}
            trend="up"
          />
        </div>
      )}

      <Card className="bg-gray-800/90 text-white border-cyan-800 backdrop-blur-md shadow-lg shadow-cyan-900/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-cyan-900/50 to-green-900/50 p-6">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-lime-300 to-green-500 flex items-center gap-2">
            <Zap className="w-8 h-8" />
            DSC Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="mint" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-gray-700/50 rounded-none">
              <TabsTrigger
                value="mint"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 transition-all duration-300 py-4"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Mint DSC
              </TabsTrigger>
              {hasCollateral && (
                <>
                  <TabsTrigger
                    value="redeem"
                    className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400 transition-all duration-300 py-4"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Redeem Collateral
                  </TabsTrigger>
                </>
              )}
            </TabsList>
            <div className="p-6">
              <TabsContent value="mint">
                <MintTab hasCollateral={hasCollateral} />
              </TabsContent>
              {hasCollateral && (
                <>
                  <TabsContent value="redeem">
                    <RedeemTab />
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: "up" | "down";
}

const StatCard = ({ icon, title, value, trend }: StatCardProps) => (
  <Card className="bg-gray-800/90 text-white border-cyan-800 backdrop-blur-md shadow-lg shadow-cyan-900/20 transition-all duration-300 hover:scale-105">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="bg-gray-700/50 p-3 rounded-full">{icon}</div>
        {trend === "up" ? (
          <ArrowUpRight className="w-6 h-6 text-green-400" />
        ) : (
          <ArrowDownRight className="w-6 h-6 text-red-400" />
        )}
      </div>
      <div className="mt-4">
        <p className="text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-gray-900 p-6 rounded shadow-lg relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-white">
        X
      </button>
      {children}
    </div>
  </div>
);

interface PreviewData {
  collateralUsd: string; // e.g. "272.95"
  targetDsc: string; // DSC for HF=2.0
  maxDsc: string; // DSC for HF=1.0
}

const MintTab = ({ hasCollateral }: { hasCollateral: boolean }) => {
  const { wethBalance, ethBalance, isConnected, chainId } = useWeb3();

  const [ethAmount, setEthAmount] = useState("");
  const [wethAmount, setWethAmount] = useState("");
  const [dscAmount, setDscAmount] = useState("");
  const [healthFactor, setHealthFactor] = useState(0); // store HF as a number
  const [isCalculating, setIsCalculating] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData>({
    collateralUsd: "0.00",
    targetDsc: "0.00",
    maxDsc: "0.00",
  });

  const { depositCollateralAndMintDsc } = useContractWrite();
  const { getCollateralUsdValue } = useContractRead();

  // WETH deposit transaction
  const { data: wethHash, writeContract: depositWeth } = useWriteContract();
  const { isLoading: isWethDepositing } = useWaitForTransactionReceipt({
    hash: wethHash,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Convert ETH to WETH
  // ─────────────────────────────────────────────────────────────────────────────
  const handleEthToWeth = async () => {
    if (!chainId) return;
    const wethAddress = WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES];

    depositWeth({
      abi: WETH_ABI,
      address: wethAddress,
      functionName: "deposit",
      value: parseEther(ethAmount),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: fetch collateral USD + compute target DSC (HF=2) & max DSC (HF=1)
  // ─────────────────────────────────────────────────────────────────────────────
  async function computePreviewData(
    collateralEth: string
  ): Promise<PreviewData> {
    if (!collateralEth || isNaN(parseFloat(collateralEth))) {
      return { collateralUsd: "0.00", targetDsc: "0.00", maxDsc: "0.00" };
    }
    setIsCalculating(true);
    try {
      const collateralWei = parseEther(collateralEth);
      const collateralUsdBigInt = await getCollateralUsdValue(collateralWei);
      const collateralUsdNum = Number(formatEther(collateralUsdBigInt));

      // 50% of collateral => HF=1
      const maxDscNum = collateralUsdNum * 0.5;

      // 25% of collateral => HF=2
      const targetDscNum = collateralUsdNum * 0.25;

      return {
        collateralUsd: collateralUsdNum.toFixed(2),
        maxDsc: maxDscNum.toFixed(2),
        targetDsc: targetDscNum.toFixed(2),
      };
    } catch (error) {
      console.error("Error computing preview data:", error);
      return { collateralUsd: "0.00", targetDsc: "0.00", maxDsc: "0.00" };
    } finally {
      setIsCalculating(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: compute HF from (collateralUsd/2) / dscMinted
  // ─────────────────────────────────────────────────────────────────────────────
  function calculateHealthFactor(
    collateralUsd: string,
    mintedDsc: string
  ): number {
    const colUsd = parseFloat(collateralUsd);
    const minted = parseFloat(mintedDsc);
    if (colUsd <= 0 || minted <= 0) return 0;
    return colUsd / 2 / minted; // HF
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // handleWethAmountChange: auto-set DSC for HF=2, update HF
  // ─────────────────────────────────────────────────────────────────────────────
  const handleWethAmountChange = async (value: string) => {
    setWethAmount(value);
    const data = await computePreviewData(value);
    setPreviewData(data);

    // automatically set DSC to target DSC => yields HF=2
    setDscAmount(data.targetDsc);

    // compute HF with the newly set DSC
    const hf = calculateHealthFactor(data.collateralUsd, data.targetDsc);
    setHealthFactor(hf);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // openPreview: show the modal with maxDsc, targetDsc, etc.
  // ─────────────────────────────────────────────────────────────────────────────
  const openPreview = async () => {
    if (!wethAmount) return;
    const data = await computePreviewData(wethAmount);
    setPreviewData(data);

    // re-calc HF based on data.targetDsc
    const hf = calculateHealthFactor(data.collateralUsd, data.targetDsc);
    setHealthFactor(hf);

    setShowPreview(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // handleMintDsc: require HF >= 2
  // ─────────────────────────────────────────────────────────────────────────────
  const handleMintDsc = async () => {
    if (!chainId || !wethAmount || !dscAmount) return;

    // double-check HF
    if (healthFactor < 2) {
      console.error("Cannot mint: Health Factor < 2.00");
      return;
    }

    const wethAddress = WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES];

    try {
      const collateralAmountParsed = parseEther(wethAmount);
      const dscAmountParsed = parseEther(dscAmount);

      console.log("Parsed Transaction Parameters:", {
        wethAddress,
        collateralAmountInWei: collateralAmountParsed.toString(),
        dscAmountInWei: dscAmountParsed.toString(),
        ratio: (Number(wethAmount) / Number(dscAmount)).toFixed(2),
      });

      if (wethBalance && BigInt(collateralAmountParsed) > wethBalance) {
        console.error("Transaction would fail: Insufficient WETH balance", {
          requiredAmount: collateralAmountParsed.toString(),
          currentBalance: wethBalance.toString(),
        });
        return;
      }

      const tx = await depositCollateralAndMintDsc(
        wethAddress,
        collateralAmountParsed,
        dscAmountParsed
      );
      console.log("Transaction submitted:", tx);
    } catch (error) {
      console.error("Transaction failed with error:", error);
      // handle errors...
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <Alert className="bg-gray-700/50 border-cyan-500 text-cyan-300">
        <AlertDescription>
          Please connect your wallet to mint DSC.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-cyan-400 mb-4">
        {hasCollateral ? "Mint Additional DSC" : "Mint Your First DSC"}
      </h3>

      {/* Convert ETH to WETH */}
      <Card className="bg-gray-800/50 border-cyan-800">
        <CardContent className="p-4">
          <h4 className="text-lg font-medium text-cyan-300 mb-4">
            Convert Sepolia-ETH to WETH
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                ETH Amount (Balance:{" "}
                {ethBalance ? formatEther(ethBalance) : "0"} ETH)
              </label>
              <Input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                className="bg-gray-700/50 border-gray-600"
                placeholder="Enter ETH amount"
                max={ethBalance ? formatEther(ethBalance) : "0"}
              />
            </div>
            <Button
              onClick={handleEthToWeth}
              disabled={
                isWethDepositing ||
                !ethAmount ||
                parseFloat(ethAmount) <= 0 ||
                !ethBalance ||
                (ethBalance !== undefined &&
                  BigInt(parseEther(ethAmount)) > ethBalance)
              }
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {isWethDepositing ? "Converting..." : "Convert Sepolia ETH to WETH"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mint DSC with WETH */}
      <Card className="bg-gray-800/50 border-cyan-800">
        <CardContent className="p-4">
          <h4 className="text-lg font-medium text-cyan-300 mb-4">
            Mint DSC with WETH
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                WETH Amount (Balance:{" "}
                {wethBalance ? formatEther(wethBalance) : "0"} WETH)
              </label>
              <Input
                type="number"
                value={wethAmount}
                onChange={(e) => handleWethAmountChange(e.target.value)}
                className="bg-gray-700/50 border-gray-600"
                placeholder="Enter WETH amount"
                max={wethBalance ? formatEther(wethBalance) : "0"}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                DSC Amount to Mint (auto-set for HF=2)
              </label>
              <Input
                type="number"
                value={dscAmount}
                readOnly
                className="bg-gray-700/50 border-gray-600"
                placeholder="Calculated DSC amount"
              />
              {isCalculating && (
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                </div>
              )}
            </div>

            {/* Info about current HF */}
            <p className="text-sm text-gray-400">
              Current Health Factor: <strong>{healthFactor.toFixed(2)}</strong>
            </p>

            <div className="flex space-x-4">
              <Button
                onClick={openPreview}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500"
              >
                Preview Health Factor
              </Button>
              <Button
                onClick={handleMintDsc}
                disabled={
                  !wethAmount ||
                  !dscAmount ||
                  parseFloat(wethAmount) <= 0 ||
                  !wethBalance ||
                  BigInt(parseEther(wethAmount)) > wethBalance ||
                  healthFactor < 1.9999 // <--- Only enable if HF >= 2
                }
                className="w-full bg-gradient-to-r from-cyan-500 to-green-500"
              >
                Mint DSC
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Preview */}
      {showPreview && (
        <Modal onClose={() => setShowPreview(false)}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Deposit Preview</h2>
            <p>
              You are depositing <strong>{wethAmount} WETH</strong>, which is
              valued at <strong>${previewData.collateralUsd}</strong>.
            </p>
            <p>
              If you mint the <em>maximum DSC</em> (50% of collateral USD), you
              would mint <strong>${previewData.maxDsc}</strong> DSC, yielding a
              health factor of <strong>1.00</strong>.
            </p>
            <p>
              To achieve a <strong>2.00 Health Factor</strong>, you should mint
              only <strong>${previewData.targetDsc}</strong> DSC.
            </p>
            <p className="text-sm text-gray-400">
              (Your current DSC: {dscAmount} {">"} HF={healthFactor.toFixed(2)})
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  // Set DSC amount to the target for a 2.00 health factor
                  setDscAmount(previewData.targetDsc);
                  const hf = calculateHealthFactor(
                    previewData.collateralUsd,
                    previewData.targetDsc
                  );
                  setHealthFactor(hf);
                  setShowPreview(false);
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-700"
              >
                Use DSC for 2.00 HF
              </Button>
              <Button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-gray-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const RedeemTab = () => {
  const { isConnected, chainId, wethBalance } = useWeb3();
  const { getUserDscMinted, getUserCollateralBalance, getTokenAmountFromUsd } =
    useContractRead();
  const { redeemCollateralDsc } = useContractWrite();

  const [userDscBalance, setUserDscBalance] = useState("0");
  const [userCollateralWeth, setUserCollateralWeth] = useState("0");
  const [dscToBurn, setDscToBurn] = useState("");
  const [collateralToRedeem, setCollateralToRedeem] = useState("0");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch user balances on mount
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const dscMinted = await getUserDscMinted();
        setUserDscBalance(formatEther(dscMinted));
        const collateral = await getUserCollateralBalance();
        setUserCollateralWeth(formatEther(collateral));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };
    if (isConnected) fetchBalances();
  }, [isConnected, getUserDscMinted, getUserCollateralBalance]);

  // Dynamically update "Collateral to Redeem" based on the DSC amount to burn.
  useEffect(() => {
    const updateCollateral = async () => {
      if (dscToBurn && chainId) {
        try {
          const dscToBurnWei = parseEther(dscToBurn);
          const collateralWei = await getTokenAmountFromUsd(
            WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES],
            dscToBurnWei
          );
          setCollateralToRedeem(formatEther(collateralWei));
        } catch (error) {
          console.error("Error updating collateral to redeem:", error);
          setCollateralToRedeem("0");
        }
      } else {
        setCollateralToRedeem("0");
      }
    };
    updateCollateral();
  }, [dscToBurn, chainId, getTokenAmountFromUsd]);

  const handleRedeem = async () => {
    setErrorMessage("");
    if (!chainId) return;

    const dscToBurnWei = parseEther(dscToBurn);
    const collateralToRedeemWei = parseEther(collateralToRedeem);

    if (BigInt(dscToBurnWei) > parseEther(userDscBalance)) {
      setErrorMessage("Insufficient DSC balance to burn.");
      return;
    }
    if (BigInt(collateralToRedeemWei) > parseEther(userCollateralWeth)) {
      setErrorMessage("Insufficient collateral balance.");
      return;
    }

    try {
      const tokenCollateralAddress = chainId
        ? WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES]
        : "";
      if (!tokenCollateralAddress)
        throw new Error("Invalid chainId or token address");

      const tx = await redeemCollateralDsc(
        tokenCollateralAddress,
        collateralToRedeemWei,
        dscToBurnWei
      );
      console.log("Redeem transaction submitted:", tx);
    } catch (error) {
      console.error("Redeem transaction failed:", error);
      setErrorMessage("Redeem transaction failed. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <Alert className="bg-gray-700/50 border-cyan-500 text-cyan-300">
        <AlertDescription>
          Please connect your wallet to redeem collateral.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-lime-400 mb-4">
        Redeem Collateral
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Collateral to Redeem (read-only, dynamically calculated) */}
        <div>
          <label
            htmlFor="redeemCollateral"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            Collateral to Redeem (WETH)
          </label>
          <Input
            id="redeemCollateral"
            type="text"
            value={collateralToRedeem}
            readOnly
            className="bg-gray-700/50 border-gray-600 text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            This is the calculated WETH amount corresponding to your DSC to
            burn.
          </p>
        </div>

        {/* DSC to Burn Input */}
        <div>
          <label
            htmlFor="burnDSC"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            DSC to Burn
          </label>
          <Input
            id="burnDSC"
            type="number"
            placeholder="Enter DSC amount to burn"
            value={dscToBurn}
            onChange={(e) => setDscToBurn(e.target.value)}
            className="bg-gray-700/50 border-gray-600 text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            Your current DSC balance: {userDscBalance} DSC
          </p>
        </div>
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <Button
        onClick={handleRedeem}
        disabled={
          !dscToBurn ||
          parseFloat(dscToBurn) <= 0 ||
          parseFloat(collateralToRedeem) <= 0 ||
          parseEther(dscToBurn) > parseEther(userDscBalance)
        }
        className="w-full bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-lime-500 focus:ring-opacity-50"
      >
        Redeem Collateral
      </Button>
    </div>
  );
};

export default StableCoinDashboard;
