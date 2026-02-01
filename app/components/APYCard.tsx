"use client";

import { useState, useEffect } from "react";

interface APYCardProps {
  token: string;
  logo: string;
  supplyAPY: number;
  borrowAPY: number;
  supplyDelta?: number;
  borrowDelta?: number;
  lastUpdate?: number;
  isConnected: boolean;
}

export function APYCard({
  token,
  logo,
  supplyAPY,
  borrowAPY,
  supplyDelta = 0,
  borrowDelta = 0,
  lastUpdate,
  isConnected,
}: APYCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevSupply, setPrevSupply] = useState(supplyAPY);
  const [prevBorrow, setPrevBorrow] = useState(borrowAPY);

  useEffect(() => {
    if (supplyAPY !== prevSupply || borrowAPY !== prevBorrow) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 800);
      setPrevSupply(supplyAPY);
      setPrevBorrow(borrowAPY);
      return () => clearTimeout(timer);
    }
  }, [supplyAPY, borrowAPY, prevSupply, prevBorrow]);

  const formatAPY = (apy: number): string => {
    return apy ? `${apy.toFixed(5)}%` : "N/A";
  };

  const formatDelta = (delta: number): string => {
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(5)}%`;
  };

  return (
    <div
      className={`relative bg-white/5 border rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all ${
        isUpdating
          ? "border-[#fe1f70] shadow-lg shadow-[#fe1f70]/20 scale-105"
          : "border-white/10"
      }`}
    >
      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        ></div>
      </div>

      {/* Token Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-white/10 p-2 flex items-center justify-center">
          <img src={logo} alt={token} className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{token}</h3>
          {lastUpdate && (
            <p className="text-xs text-gray-400">
              Updated {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* APY Data */}
      <div className="space-y-4">
        {/* Supply APY */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 uppercase tracking-wider">
              Supply APY
            </span>
            {supplyDelta !== 0 && (
              <span
                className={`text-xs font-medium ${
                  supplyDelta > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatDelta(supplyDelta)}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white">
            {formatAPY(supplyAPY)}
          </div>
        </div>

        {/* Borrow APY */}
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400 uppercase tracking-wider">
              Borrow APY
            </span>
            {borrowDelta !== 0 && (
              <span
                className={`text-xs font-medium ${
                  borrowDelta > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {formatDelta(borrowDelta)}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white">
            {formatAPY(borrowAPY)}
          </div>
        </div>
      </div>

      {/* Subtle Update Indicator */}
      {isUpdating && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#fe1f70] animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
}