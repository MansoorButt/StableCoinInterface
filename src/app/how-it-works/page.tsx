"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Shield, Zap, Repeat, TrendingUp, Info, Lock, Unlock, AlertTriangle } from "lucide-react"

export default function HowItWorksPage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <main className="min-h-screen text-white p-8 relative">
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-6xl font-bold font-display bg-gradient-to-r from-[#00ff9d] via-[#00ff9d] to-[#9fff00] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,157,0.3)]">
            How It Works
          </h1>
          <p className="mt-4 text-xl text-gray-300">Dive deep into our Decentralized Stablecoin mechanism</p>
        </motion.div>

        <motion.section variants={sectionVariants} initial="hidden" animate="visible" className="mb-16">
          <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center">
            <Info className="w-8 h-8 mr-3" />
            Overview
          </h2>
          <Card className="bg-[#0c1628]/40 border-cyan-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <CardContent className="p-6">
              <p className="text-gray-300 leading-relaxed">
                Our decentralized stablecoin project introduces a novel approach to maintaining price stability in the
                volatile cryptocurrency market. By leveraging blockchain technology and decentralized price feeds, we`&apos`ve
                created a trustless and transparent system that allows users to mint, trade, and redeem stablecoins
                backed by cryptocurrency collateral.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" animate="visible" className="mb-16">
          <h2 className="text-3xl font-bold text-lime-400 mb-6 flex items-center">
            <Coins className="w-8 h-8 mr-3" />
            Key Features
          </h2>
          <div className="space-y-6">
            <Card className="bg-[#0c1628]/40 border-lime-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
              <CardHeader>
                <CardTitle className="text-xl text-lime-400">Collateral Backed by WETH (Sepolia Testnet)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Our stablecoins are backed by Wrapped Ether (WETH) on the Sepolia testnet. This ensures that every
                  stablecoin minted is supported by a valuable and liquid asset, providing stability and trust in the
                  system.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0c1628]/40 border-lime-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
              <CardHeader>
                <CardTitle className="text-xl text-lime-400">Secure and Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We utilize decentralized oracles to fetch real-time price data, ensuring that our system always has
                  accurate information about the value of the collateral. This, combined with our robust smart contract
                  architecture, provides a secure and reliable foundation for our stablecoin.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0c1628]/40 border-lime-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
              <CardHeader>
                <CardTitle className="text-xl text-lime-400">Mint and Redeem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Users can easily mint new stablecoins (DSC tokens) by depositing WETH as collateral. When they wish to
                  retrieve their collateral, they can burn their DSC tokens to redeem the equivalent value in WETH,
                  providing flexibility and liquidity.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" animate="visible" className="mb-16">
          <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center">
            <Repeat className="w-8 h-8 mr-3" />
            How It Works
          </h2>
          <Card className="bg-[#0c1628]/40 border-green-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start">
                <Lock className="w-6 h-6 mr-3 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  <strong className="text-green-400">Deposit Collateral:</strong> Users lock up WETH as collateral on
                  the Sepolia testnet. This WETH is held securely in a smart contract.
                </p>
              </div>
              <div className="flex items-start">
                <Zap className="w-6 h-6 mr-3 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  <strong className="text-green-400">Mint DSC Tokens:</strong> Based on the value of the deposited WETH,
                  users can mint DSC tokens worth up to 50% of their collateral value. This ensures a 200%
                  collateralization ratio, providing a buffer against market volatility.
                </p>
              </div>
              <div className="flex items-start">
                <Unlock className="w-6 h-6 mr-3 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  <strong className="text-green-400">Redeem Collateral:</strong> At any time, users can return their DSC
                  tokens to unlock their WETH collateral. This process ensures liquidity and allows users to exit their
                  positions when needed.
                </p>
              </div>
              <div className="flex items-start">
                <Shield className="w-6 h-6 mr-3 text-green-400 flex-shrink-0 mt-1" />
                <p className="text-gray-300">
                  <strong className="text-green-400">Maintain Stability:</strong> The system continuously monitors the
                  collateralization ratio. If the value of WETH decreases, bringing the ratio close to 200%, users are
                  incentivized to either add more collateral or reduce their DSC position to avoid liquidation.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" animate="visible" className="mb-16">
          <h2 className="text-3xl font-bold text-purple-400 mb-6 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3" />
            Example Scenario
          </h2>
          <Card className="bg-[#0c1628]/40 border-purple-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(255,0,255,0.1)]">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-400">200% Collateralization in Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Let`&apos`s walk through an example to illustrate how the 200% collateralization works:
              </p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2">
                <li>Assume the current price of WETH is $2000.</li>
                <li>A user deposits 1 WETH as collateral, which is valued at $2000.</li>
                <li>
                  With a 200% collateralization ratio, the user can mint up to $1000 worth of DSC tokens (50% of their
                  collateral value).
                </li>
                <li>The user decides to mint 800 DSC tokens (each DSC is pegged to $1).</li>
              </ol>
              <p className="text-gray-300">Now, let`&apos`s consider what happens if the price of WETH changes:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>
                  If WETH price increases to $2500, the user`&apos`s collateral ratio improves to 250%, providing an even
                  safer position.
                </li>
                <li>
                  If WETH price drops to $1600, the collateral ratio would be exactly 200% (($1600 / $800) * 100 =
                  200%).
                </li>
                <li>If WETH price falls below $1600, the position becomes at risk of liquidation.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" animate="visible" className="mb-16">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3" />
            Liquidation Process
          </h2>
          <Card className="bg-[#0c1628]/40 border-yellow-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,0,0.1)]">
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-300">
                To maintain the stability of the system, positions that fall below the 200% collateralization ratio are
                subject to liquidation:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>The system continuously monitors all positions for undercollateralization.</li>
                <li>If a position falls below 200% collateralization, it becomes eligible for liquidation.</li>
                <li>
                  Liquidators can repay a portion of the outstanding DSC and receive the equivalent amount of collateral
                  plus a liquidation bonus.
                </li>
                <li>
                  This process ensures that the system always maintains sufficient collateral to back all outstanding
                  DSC tokens.
                </li>
              </ul>
              <p className="text-gray-300">
                Users are encouraged to monitor their positions and take action (add collateral or repay DSC) if their
                collateralization ratio approaches the 200% threshold.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={sectionVariants} initial="hidden" animate="visible">
          <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center">
            <Info className="w-8 h-8 mr-3" />
            Future Enhancements
          </h2>
          <Card className="bg-[#0c1628]/40 border-blue-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,255,0.1)]">
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-300">
                We`&apos`re constantly working to improve our stablecoin system. Some planned enhancements include:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Support for multiple types of collateral, allowing users to diversify their backing assets.</li>
                <li>
                  Implementation of automated and more efficient liquidation processes to further secure the system.
                </li>
                <li>
                  Introduction of community-driven governance mechanisms to allow stakeholders to participate in shaping
                  the future of the stablecoin.
                </li>
                <li>Integration with DeFi protocols to increase utility and adoption of our stablecoin.</li>
                <li>Enhanced analytics and risk management tools for users to better manage their positions.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </main>
  )
}

