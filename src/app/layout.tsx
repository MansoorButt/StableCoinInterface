import type React from "react";
import "./globals.css";
import { Inter, Orbitron } from "next/font/google";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Providers } from "@/components/Provider";
import WalletNav from "@/components/WalletNav";
import { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: 'Decentralized Stable Coin',
  description: 'Inspired by Patrick-Collins Cyfrin Module , This is a decentralized stable coin project built on the Sepolia blockchain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="font-sans bg-gray-900 relative min-h-screen">
        <Providers>
          <AnimatedBackground />
          <WalletNav />
          <div className="relative z-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}