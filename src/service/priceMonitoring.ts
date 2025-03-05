// PriceMonitoringService.ts
import { ethers } from "ethers";
import { SCEngineABI } from "@/lib/abi.json";
import { SC_ENGINE_ADDRESS } from "@/context/Web3";

// Type definition for the update callback
export type UpdateCallback = () => void;

export class PriceMonitoringService {
  
  provider: ethers.providers.Web3Provider;
  contract: ethers.Contract;
  updateCallback: UpdateCallback;
  lastPrices: Map<string, number>; // store as numbers for easier comparison
  tokens: string[];
  significantPriceChangeThreshold: number; // in percentage
  // Instead of auto-polling at a fixed interval, we expose a refresh method.
  
  constructor(provider: ethers.providers.Web3Provider, updateCallback: UpdateCallback) {
    this.provider = provider;
    this.contract = new ethers.Contract(SC_ENGINE_ADDRESS, SCEngineABI, provider);
    this.updateCallback = updateCallback;
    this.lastPrices = new Map<string, number>();
    this.tokens = [];
    this.significantPriceChangeThreshold = 0.5; // 0.5% threshold; adjust if needed
  }

  /**
   * Refresh method: updates all prices and then checks for significant changes.
   */
  async refresh(): Promise<void> {
    try {
      console.log("Refreshing price data...");
      await this.updateAllPrices();
      await this.checkPriceChanges();
      console.log("Refresh complete.");
    } catch (error) {
      console.error("Error during refresh:", error);
    }
  }

  /**
   * Updates the baseline prices for each collateral token.
   */
  async updateAllPrices(): Promise<void> {
    // Load tokens if not already loaded
    if (this.tokens.length === 0) {
      try {
        this.tokens = await this.contract.getCollateralTokens();
      } catch (error) {
        console.error("Error fetching collateral tokens:", error);
        return;
      }
    }
    for (const token of this.tokens) {
      try {
        const priceFeedAddress: string = await this.contract.getCollateralTokenPriceFeed(token);
        const priceFeedContract = new ethers.Contract(
          priceFeedAddress,
          ["function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)"],
          this.provider
        );
        const [, price] = await priceFeedContract.latestRoundData();
        // Convert price to a number (assume price feed has 8 decimals)
        const priceNum = Number(ethers.utils.formatUnits(price, 8));
        // Update baseline only if not already set.
        if (!this.lastPrices.has(token)) {
          this.lastPrices.set(token, priceNum);
        }
      } catch (error) {
        console.error(`Error fetching price for token ${token}:`, error);
      }
    }
  }

  /**
   * Checks for significant price changes.
   * If any token's price changes by more than the threshold compared to its baseline,
   * update that baseline and trigger the update callback.
   */
  async checkPriceChanges(): Promise<void> {
    let significantChange = false;
    for (const token of this.tokens) {
      try {
        const priceFeedAddress: string = await this.contract.getCollateralTokenPriceFeed(token);
        const priceFeedContract = new ethers.Contract(
          priceFeedAddress,
          ["function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)"],
          this.provider
        );
        const [, currentPriceRaw] = await priceFeedContract.latestRoundData();
        const currentPrice = Number(ethers.utils.formatUnits(currentPriceRaw, 8));
        const baselinePrice = this.lastPrices.get(token);
        if (baselinePrice !== undefined) {
          const changePercent = Math.abs((currentPrice - baselinePrice) / baselinePrice * 100);
          if (changePercent >= this.significantPriceChangeThreshold) {
            console.log(`Significant change for ${token}: ${changePercent.toFixed(2)}% (baseline: ${baselinePrice}, current: ${currentPrice})`);
            significantChange = true;
            // Update baseline price for this token
            this.lastPrices.set(token, currentPrice);
          }
        } else {
          // If baseline is not set, set it now.
          this.lastPrices.set(token, currentPrice);
        }
      } catch (error) {
        console.error(`Error checking price for token ${token}:`, error);
      }
    }
    if (significantChange && this.updateCallback) {
      this.updateCallback();
    }
  }
}

export default PriceMonitoringService;
