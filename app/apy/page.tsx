"use client";

import { useWebSocket } from "../hooks/useWebSocket";
import { APYCard } from "../components/APYCard";

const tokens = [
  {
    symbol: "USDT",
    name: "Tether",
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.svg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg",
  },
  {
    symbol: "USDe",
    name: "USDe",
    logo: "https://assets.coingecko.com/coins/images/33613/small/USDE.png",
  },
  {
    symbol: "crvUSD",
    name: "crvUSD",
    logo: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg",
  },
];

export default function APYDashboard() {
  const { apyData, isConnected, lastUpdate, error, reconnect } = useWebSocket();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Live APY Dashboard
              </h1>
              <p className="text-gray-400">
                Real-time Aave protocol interest rates
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-300">
                  {isConnected ? "Live" : "Disconnected"}
                </span>
              </div>

              {/* Reconnect Button */}
              {!isConnected && (
                <button
                  onClick={reconnect}
                  className="px-4 py-2 bg-[#fe1f70] hover:bg-[#fe1f70]/80 text-white rounded-full text-sm font-medium transition-colors"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Last Update Time */}
          {lastUpdate && (
            <div className="mt-4 text-xs text-gray-500">
              Last updated: {new Date(lastUpdate).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* APY Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tokens.map((token) => (
            <APYCard
              key={token.symbol}
              token={token.symbol}
              logo={token.logo}
              supplyAPY={apyData[token.symbol]?.supply || 0}
              borrowAPY={apyData[token.symbol]?.borrow || 0}
              supplyDelta={apyData[token.symbol]?.supplyDelta}
              borrowDelta={apyData[token.symbol]?.borrowDelta}
              lastUpdate={apyData[token.symbol]?.timestamp}
              isConnected={isConnected}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4">
            About This Dashboard
          </h2>
          <div className="space-y-3 text-gray-300">
            <p>
              This dashboard displays real-time APY (Annual Percentage Yield) data
              from the Aave protocol on Ethereum mainnet.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <strong>Supply APY:</strong> Interest rate earned by supplying
                assets to the protocol
              </li>
              <li>
                <strong>Borrow APY:</strong> Interest rate charged for borrowing
                assets from the protocol
              </li>
              <li>
                <strong>Live Updates:</strong> Data refreshes automatically when
                rates change on-chain
              </li>
              <li>
                <strong>Visual Indicators:</strong> Cards pulse and show arrows
                when rates update
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
