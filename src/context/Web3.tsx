"use client"

import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useBalance, useReadContract, usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type GetContractReturnType } from 'viem';
import { SCEngineABI } from "@/lib/abi.json";

// WETH ABI and addresses
export const WETH_ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "deposit",
    outputs: [],
    payable: true,
    type: "function",
  },
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }

] as const;

export const WETH_ADDRESSES = {
  11155111: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Sepolia
  59140: "0x2C1b868d6596a18e32E61B901E4060C872647b6C", // Linea Sepolia
} as const;

// SC Engine address
export const SC_ENGINE_ADDRESS = "0x28083fa0d374a254d107da7db026cd8c3bd97b28" as const;

// 0x28083fa0d374a254d107da7db026cd8c3bd97b28 OLD SC_ENGINE ADDRESS
// 0xaA2f65893d09e932EFE099CD6B029240E88B2240 New SC_ENGINE ADDRESS
// Define the contract type using GetContractReturnType
type SCEngineContract = GetContractReturnType<typeof SCEngineABI>;

type Web3ContextType = {
  wethBalance: bigint | undefined;
  ethBalance: bigint | undefined;
  isConnected: boolean;
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  wethContract: ReturnType<typeof getContract> | null;
  contract: SCEngineContract | null;
};

const Web3Context = createContext<Web3ContextType>({
  wethBalance: undefined,
  ethBalance: undefined,
  isConnected: false,
  address: undefined,
  chainId: undefined,
  wethContract: null,
  contract: null,
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Get WETH balance
  const { data: wethBalance } = useReadContract({
    abi: WETH_ABI,
    address: chainId ? WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES] : undefined,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!chainId && !!WETH_ADDRESSES[chainId as keyof typeof WETH_ADDRESSES],
    }
  });

  // Initialize SC Engine contract
  const contract = publicClient && walletClient ? 
    getContract({
      address: SC_ENGINE_ADDRESS,
      abi: SCEngineABI,
      client: publicClient,
    }) as SCEngineContract : null;

  const wethContract = publicClient && walletClient ?
    getContract({
      address: WETH_ADDRESSES[11155111],
      abi: WETH_ABI,
      client: publicClient,
    }) : null;

  return (
    <Web3Context.Provider 
      value={{
        wethBalance: wethBalance as bigint | undefined,
        ethBalance: ethBalance?.value,
        isConnected,
        address,
        chainId,
        wethContract,
        contract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);


// 90000000000000000, 52850000000000000000