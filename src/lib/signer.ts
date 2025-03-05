import { ethers } from "ethers";

// Declare ethereum object with the defined interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default async function getSigner() {
  if (!window.ethereum) {
    throw new Error(
      "No Ethereum provider found. Please ensure MetaMask or a compatible provider is installed."
    );
  }

  
  const provider2 = new ethers.providers.Web3Provider(window.ethereum, "any");
  

  return provider2;
}