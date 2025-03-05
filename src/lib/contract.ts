"use client";

import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { SC_ENGINE_ADDRESS, WETH_ADDRESSES , useWeb3 ,WETH_ABI } from "@/context/Web3"; // Ensure correct import path
import { SCEngineABI } from "@/lib/abi.json";

interface AccountInformation {
  totalDscMinted: bigint;
  collateralValueInUsd: bigint;
}

export function useContractRead() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  
  async function getTotalDscMinted(): Promise<bigint> {
    if (!publicClient) throw new Error("Public client is not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getTotalDscMinted",
    })) as bigint;
  }

  async function getTotalCollateralValueInUsd(): Promise<bigint> {
    if (!publicClient) throw new Error("Public client is not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getTotalCollateralValueInUsd",
    })) as bigint;
  }

  // New function to fetch the DSC contract address
  async function getDsc(): Promise<string> {
    if (!publicClient) throw new Error("Public client is not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getDsc",
    })) as string;
  }

  // New functions
  async function getUserCollateralBalance(): Promise<bigint> {
    if (!publicClient || !address)
      throw new Error("Client or user address not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getCollateralBalanceofUser",
      args: [address, WETH_ADDRESSES[11155111]],
    })) as bigint;
  }

  async function getCollateralUsdValue(amount: bigint): Promise<bigint> {
    if (!publicClient) throw new Error("Public client is not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getUsdValue",
      args: [WETH_ADDRESSES[11155111], amount],
    })) as bigint;
  }

  async function getUserDscMinted(): Promise<bigint> {
    if (!publicClient || !address)
      throw new Error("Client or user address not available");
  
    // readContract returns a tuple [BigInt, BigInt]
    const [dscMinted, collateralValueInUsd] = await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "_getAccountInformation",
      args: [address],
    }) as [bigint, bigint];
  
    // Now dscMinted is the first element of that tuple
    return dscMinted;
  }

  async function getUserHealthFactor(): Promise<bigint> {
    if (!publicClient || !address) throw new Error("Client or user address not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getHealthFactor",
      args: [address],
    })) as bigint;
  }

  async function getTokenAmountFromUsd(token: string, amountInWie: bigint): Promise<bigint> {
    if (!publicClient) throw new Error("Public client is not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getTokenAmountFromUsd",
      args: [token, amountInWie],
    })) as bigint;
  }

  async function getCollateralTokens(): Promise<string[]> {
    if (!publicClient) throw new Error("Public client is not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getCollateralTokens",
    })) as string[];
  }



  // NEW: Returns the USD value for a given token amount.
  async function getUsdValue(token: string, amount: bigint): Promise<bigint> {
    if (!publicClient) throw new Error("Public client is not available");
    return (await publicClient.readContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      functionName: "getUsdValue",
      args: [token, amount],
    })) as bigint;
  }


  return {
    getTotalDscMinted,
    getTotalCollateralValueInUsd,
    getDsc,
    getUserCollateralBalance,
    getCollateralUsdValue,
    getUserDscMinted,
    getUserHealthFactor,
    getTokenAmountFromUsd,
    getCollateralTokens,
    getUsdValue
  };
}

export function useContractWrite() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient(); // Add this for transaction confirmation
  const { address } = useAccount();

  const depositCollateralAndMintDsc = async (
    tokenAddress: `0x${string}`,
    collateralAmount: bigint,
    dscAmount: bigint
  ) => {
    if (!walletClient) throw new Error("Wallet client is not available");

    try {
      // Step 1: Approve WETH Spending
      const wethAddress = WETH_ADDRESSES[11155111];
      console.log("Approving WETH...");

      const approvalTxHash = await walletClient.writeContract({
        address: wethAddress,
        abi: WETH_ABI,
        functionName: "approve",
        args: [SC_ENGINE_ADDRESS, collateralAmount],
      });
      console.log("Approval Tx Hash:", approvalTxHash);

      // Wait for the approval transaction to be confirmed
      if (!publicClient) throw new Error("Public client is not available");
      const approvalReceipt = await publicClient.waitForTransactionReceipt({
        hash: approvalTxHash,
      });
      console.log("Approval confirmed!", approvalReceipt);

      // Step 2: Deposit collateral and mint DSC
      console.log("Depositing collateral and minting DSC...");
      const txHash = await walletClient.writeContract({
        address: SC_ENGINE_ADDRESS,
        abi: SCEngineABI,
        functionName: "depositCollateralAndMintDsc",
        args: [tokenAddress, collateralAmount, dscAmount],
      });
      console.log("Transaction Hash:", txHash);
      return txHash;
    } catch (error) {
      console.error("Error depositing collateral and minting DSC:", error);
      throw error;
    }
  };

  const redeemCollateralDsc = async (
    tokenCollateralAddress: `0x${string}`,
    amountCollateral: bigint,
    amountDscToBurn: bigint
  ) => {
    if (!walletClient) throw new Error("Wallet client is not available");
    try {
      const txHash = await walletClient.writeContract({
        address: SC_ENGINE_ADDRESS,
        abi: SCEngineABI,
        functionName: "redeemCollateralDsc",
        args: [tokenCollateralAddress, amountCollateral, amountDscToBurn],
      });
      console.log("Redeem Collateral Tx Hash:", txHash);
      return txHash;
    } catch (error) {
      console.error("Error redeeming collateral:", error);
      throw error;
    }
  };

   // NEW: Liquidate function integration
   const liquidate = async (
    collateral: `0x${string}`,
    user: string,
    debtToCover: bigint
  ) => {
    if (!walletClient) throw new Error("Wallet client is not available");
    try {
      // Step 1: Approve DSC Spending
      const dscAddress = "0xa3312db03FA6f1CAf9c0afb4E52670C8E1638e18";
      console.log("Approving DSC spending...");
  
      const approvalTxHash = await walletClient.writeContract({
        address: dscAddress,
        abi: [
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "approve",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: "approve",
        args: [SC_ENGINE_ADDRESS, debtToCover],
      });
      console.log("DSC Approval Tx Hash:", approvalTxHash);
  
      // Wait for the approval transaction to be confirmed
      if (!publicClient) throw new Error("Public client is not available");
      const approvalReceipt = await publicClient.waitForTransactionReceipt({
        hash: approvalTxHash,
      });
      console.log("DSC Approval confirmed!", approvalReceipt);
  
      // Step 2: Call the liquidate function on the SC_ENGINE contract
      const txHash = await walletClient.writeContract({
        address: SC_ENGINE_ADDRESS,
        abi: SCEngineABI,
        functionName: "liquidate",
        args: [collateral, user, debtToCover],
      });
      console.log("Liquidate Tx Hash:", txHash);
      return txHash;
    } catch (error) {
      console.error("Error liquidating:", error);
      throw error;
    }
  };
  

  return { depositCollateralAndMintDsc, redeemCollateralDsc,liquidate };
}

