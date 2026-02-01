"use client";

import Image from "next/image";
import Link from "next/link";
import { useWebSocket } from "./hooks/useWebSocket";

export default function Home() {
  const { apyData, isConnected } = useWebSocket();

  const tokens = [
    {
      name: "USDT",
      logo: "https://cryptologos.cc/logos/tether-usdt-logo.svg",
    },
    {
      name: "USDC",
      logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg",
    },
    {
      name: "USDe",
      logo: "https://assets.coingecko.com/coins/images/33613/small/USDE.png",
    },
    {
      name: "crvUSD",
      logo: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(254, 31, 112, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(254, 31, 112, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          ></div>

          {/* Glow Effects */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#fe1f70]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-[#fe1f70]/5 rounded-full blur-[100px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/dark_logo.png"
              alt="Growdex"
              width={80}
              height={80}
              priority
              className="h-20 w-20"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">
              Powered by Aave Protocol
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-[#fe1f70] via-[#ff3d87] to-[#fe1f70] bg-clip-text text-transparent">
              Real-Time DeFi
            </span>
            <br />
            Intelligence Hub
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Monitor live APY rates, track market dynamics, and make informed
            decisions with blockchain-powered analytics
          </p>

          {/* Tracked Tokens */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <span className="text-sm text-gray-400 uppercase tracking-wider">
              Tracking Leading Stablecoins
            </span>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {tokens.map((token) => (
                <div
                  key={token.name}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-[#fe1f70]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-[#fe1f70]/50 hover:scale-110">
                    <img
                      src={token.logo}
                      alt={token.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {token.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live APY Preview */}
          <div className="max-w-5xl mx-auto mt-16 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">Live APY Rates</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-400 animate-pulse" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-300">
                    {isConnected ? "Live" : "Offline"}
                  </span>
                </div>
              </div>
              <Link
                href="/apy"
                className="px-4 py-2 bg-[#fe1f70] hover:bg-[#fe1f70]/80 text-white rounded-full text-sm font-medium transition-colors"
              >
                View Dashboard →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tokens.map((token) => (
                <div
                  key={token.name}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={token.logo}
                      alt={token.name}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-white font-semibold">{token.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Supply APY</div>
                      <div className="text-lg font-bold text-green-400">
                        {apyData[token.name]?.supply
                          ? `${apyData[token.name].supply.toFixed(5)}%`
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Borrow APY</div>
                      <div className="text-lg font-bold text-orange-400">
                        {apyData[token.name]?.borrow
                          ? `${apyData[token.name].borrow.toFixed(5)}%`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-[#fe1f70]/50">
              <div className="text-3xl font-bold text-[#fe1f70] mb-2">24/7</div>
              <div className="text-sm text-gray-400">Live Monitoring</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-[#fe1f70]/50">
              <div className="text-3xl font-bold text-[#fe1f70] mb-2">
                Real-time
              </div>
              <div className="text-sm text-gray-400">Data Updates</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-[#fe1f70]/50">
              <div className="text-3xl font-bold text-[#fe1f70] mb-2">4+</div>
              <div className="text-sm text-gray-400">Tracked Assets</div>
            </div>
          </div>
        </div>

        {/* Floating Hexagons */}
        <div className="absolute top-20 left-10 w-20 h-20 opacity-10">
          <div className="w-full h-full border-2 border-[#fe1f70] transform rotate-12 animate-float-slow"></div>
        </div>
        <div className="absolute bottom-20 right-10 w-16 h-16 opacity-10">
          <div className="w-full h-full border-2 border-white transform -rotate-45 animate-float-delayed"></div>
        </div>
        <div className="absolute top-1/3 right-20 w-12 h-12 opacity-10">
          <div className="w-full h-full border-2 border-[#fe1f70] rotate-45 animate-float"></div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="px-6 text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Experience the <span className="text-[#fe1f70]">Platform</span>
          </h2>
          <p className="text-gray-400 text-lg">
            See how Growdex transforms crypto trading
          </p>
        </div>
        
        <div className="w-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          >
            <source src="/hero video.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-30px) rotate(20deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-25px) rotate(-20deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}
