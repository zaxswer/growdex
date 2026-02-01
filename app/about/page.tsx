"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface TokenData {
  symbol: string;
  apy: number;
  tvl: string;
  status: string;
  decision: string;
  risk: "low" | "medium" | "high";
}

export default function AboutPage() {
  const [tokenData, setTokenData] = useState<TokenData[]>([
    {
      symbol: "USDT",
      apy: 4.2,
      tvl: "$12.5B",
      status: "Active",
      decision: "Recommended for stable yields",
      risk: "low",
    },
    {
      symbol: "USDC",
      apy: 3.8,
      tvl: "$8.9B",
      status: "Active",
      decision: "Ideal for low-risk strategies",
      risk: "low",
    },
    {
      symbol: "USDe",
      apy: 15.3,
      tvl: "$2.1B",
      status: "Active",
      decision: "High yield opportunity - Monitor closely",
      risk: "medium",
    },
    {
      symbol: "crvUSD",
      apy: 8.7,
      tvl: "$1.8B",
      status: "Active",
      decision: "Balanced risk-reward profile",
      risk: "medium",
    },
  ]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setTokenData((prev) =>
        prev.map((token) => ({
          ...token,
          apy: +(token.apy + (Math.random() - 0.5) * 0.5).toFixed(2),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTokenLogo = (symbol: string) => {
    const logos: Record<string, string> = {
      USDT: "https://cryptologos.cc/logos/tether-usdt-logo.svg",
      USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg",
      USDe: "https://assets.coingecko.com/coins/images/33613/small/USDE.png",
      crvUSD: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg",
    };
    return logos[symbol] || "";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "high":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#fe1f70]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Live Data Feed Active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-[#fe1f70] via-[#ff3d87] to-[#fe1f70] bg-clip-text text-transparent">
              Growdex
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Empowering traders with real-time Aave protocol data to make
            informed decisions in the DeFi ecosystem
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                What We Do
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Growdex is a cutting-edge platform that bridges the gap between
                complex DeFi protocols and actionable trading insights. We
                continuously monitor Aave smart contracts to provide you with
                real-time analytics and decision support.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our platform tracks key stablecoins including USDT, USDC, USDe,
                and crvUSD, analyzing their performance metrics to help you
                optimize your yield farming strategies and minimize risks.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#fe1f70]/20 to-transparent rounded-2xl blur-2xl"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#fe1f70] mb-2">
                      24/7
                    </div>
                    <div className="text-gray-400 text-sm">Monitoring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#fe1f70] mb-2">
                      4+
                    </div>
                    <div className="text-gray-400 text-sm">Tracked Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#fe1f70] mb-2">
                      Real-time
                    </div>
                    <div className="text-gray-400 text-sm">Data Updates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#fe1f70] mb-2">
                      Smart
                    </div>
                    <div className="text-gray-400 text-sm">Decisions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Data Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Real-Time Market Intelligence
            </h2>
            <p className="text-gray-300 text-lg">
              Live data from Aave protocol with actionable insights
            </p>
          </div>

          <div className="grid gap-6">
            {tokenData.map((token) => (
              <div
                key={token.symbol}
                className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-[#fe1f70]/50 group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Token Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-white rounded-full p-3 flex items-center justify-center">
                      <img
                        src={getTokenLogo(token.symbol)}
                        alt={token.symbol}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{token.symbol}</h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full border ${getRiskColor(
                          token.risk
                        )}`}
                      >
                        {token.risk.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>



                  {/* Decision */}
                  <div className="flex-1">
                    <div className="bg-[#fe1f70]/10 border border-[#fe1f70]/30 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">
                        Recommendation
                      </div>
                      <div className="text-sm font-medium">{token.decision}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              Data updates every 5 seconds from Aave Protocol
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#fe1f70]/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-[#fe1f70] via-[#ff3d87] to-[#fe1f70] bg-clip-text text-transparent">
                Growdex?
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed for modern DeFi traders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-[#fe1f70]/50 hover:scale-105 hover:shadow-2xl hover:shadow-[#fe1f70]/20">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fe1f70]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#fe1f70] to-[#ff3d87] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#fe1f70]/30 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-9 h-9"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#fe1f70] transition-colors">
                  Real-Time Analytics
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Get instant updates on APY, TVL, and market conditions directly
                  from Aave smart contracts.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-[#fe1f70]/50 hover:scale-105 hover:shadow-2xl hover:shadow-[#fe1f70]/20">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fe1f70]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#fe1f70] to-[#ff3d87] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#fe1f70]/30 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-9 h-9"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#fe1f70] transition-colors">
                  Risk Assessment
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  AI-powered risk analysis helps you understand the safety profile
                  of each investment opportunity.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-[#fe1f70]/50 hover:scale-105 hover:shadow-2xl hover:shadow-[#fe1f70]/20">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fe1f70]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#fe1f70] to-[#ff3d87] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#fe1f70]/30 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-9 h-9"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#fe1f70] transition-colors">
                  Smart Recommendations
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Receive intelligent trading suggestions based on comprehensive
                  market analysis and historical data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white/5 to-transparent relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It{" "}
              <span className="bg-gradient-to-r from-[#fe1f70] via-[#ff3d87] to-[#fe1f70] bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started in four simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connecting line - hidden on mobile */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#fe1f70]/30 to-transparent"></div>

            <div className="grid md:grid-cols-4 gap-8 md:gap-6 relative">
              {[
                {
                  step: "01",
                  title: "Connect",
                  desc: "Link your wallet to access real-time protocol data",
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Monitor",
                  desc: "Track live metrics from Aave smart contracts",
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Analyze",
                  desc: "Get AI-powered insights and recommendations",
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                },
                {
                  step: "04",
                  title: "Trade",
                  desc: "Execute informed decisions with confidence",
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ),
                },
              ].map((item, index) => (
                <div key={item.step} className="relative group">
                  {/* Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:border-[#fe1f70]/50 hover:scale-105 hover:shadow-xl hover:shadow-[#fe1f70]/10">
                    {/* Step number badge */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#fe1f70] to-[#ff3d87] rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative w-full h-full bg-gradient-to-br from-[#fe1f70] to-[#ff3d87] rounded-full flex items-center justify-center shadow-lg shadow-[#fe1f70]/30">
                        <span className="text-3xl font-bold">{item.step}</span>
                      </div>
                      {/* Icon overlay */}
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black border-2 border-[#fe1f70] rounded-full flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-center group-hover:text-[#fe1f70] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-center text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Arrow - hidden on mobile and last item */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-12 -right-4 text-[#fe1f70]/30">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
