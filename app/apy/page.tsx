"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface APYData {
  supply: number;
  borrow: number;
  timestamp: number;
}

interface TokenData {
  symbol: string;
  name: string;
  logoUrl: string;
  totalSupplied: string;
  totalSuppliedValue: string;
  supplyAPY: number;
  borrowAPY: number;
  totalBorrowed: string;
  totalBorrowedValue: string;
  isConnected: boolean;
}

export default function APYDashboard() {
  const [tokensData, setTokensData] = useState<Record<string, TokenData>>({
    USDT: {
      symbol: "USDT",
      name: "Tether",
      logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.svg",
      totalSupplied: "6.54B",
      totalSuppliedValue: "$6.52B",
      supplyAPY: 0,
      borrowAPY: 0,
      totalBorrowed: "4.78B",
      totalBorrowedValue: "$4.77B",
      isConnected: false,
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg",
      totalSupplied: "4.13B",
      totalSuppliedValue: "$4.13B",
      supplyAPY: 0,
      borrowAPY: 0,
      totalBorrowed: "3.64B",
      totalBorrowedValue: "$3.64B",
      isConnected: false,
    },
    USDe: {
      symbol: "USDe",
      name: "USDe",
      logoUrl: "https://assets.coingecko.com/coins/images/33613/small/USDE.png",
      totalSupplied: "1.14B",
      totalSuppliedValue: "$1.14B",
      supplyAPY: 0,
      borrowAPY: 0,
      totalBorrowed: "608.06M",
      totalBorrowedValue: "$607.08M",
      isConnected: false,
    },
    crvUSD: {
      symbol: "crvUSD",
      name: "crvUSD",
      logoUrl: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg",
      totalSupplied: "892M",
      totalSuppliedValue: "$892M",
      supplyAPY: 0,
      borrowAPY: 0,
      totalBorrowed: "445M",
      totalBorrowedValue: "$445M",
      isConnected: false,
    },
  });

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // Connect to websocket server (adjust port if needed)
      const ws = new WebSocket("ws://localhost:8080");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("Connected");

        // Request current APY data
        ws.send(JSON.stringify({ type: "current" }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Received message:", message);

          if (message.type === "connected") {
            console.log("Connection confirmed:", message.data);
          } else if (message.type === "current") {
            // Update token data with current APY
            // message.data format: { USDT: { supply: 2.65, borrow: 4.06, timestamp: ... }, ... }
            updateTokensAPY(message.data);
          } else if (message.type === "update") {
            // Handle real-time updates
            // message.data format: { token: 'USDT', supply: 2.65, borrow: 4.06, supplyDelta: ..., borrowDelta: ..., timestamp: ... }
            updateSingleTokenAPY(message.data);
          } else if (message.type === "error") {
            console.error("Server error:", message.error);
            setConnectionStatus("Error: " + message.error);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("Connection Error");
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setConnectionStatus("Disconnected - Reconnecting...");

        // Try to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      setConnectionStatus("Failed to Connect");
      setIsConnected(false);

      // Retry connection
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };

  const updateTokensAPY = (data: Record<string, APYData>) => {
    setTokensData((prev) => {
      const updated = { ...prev };
      Object.keys(data).forEach((token) => {
        if (updated[token]) {
          updated[token] = {
            ...updated[token],
            supplyAPY: data[token].supply,
            borrowAPY: data[token].borrow,
            isConnected: true,
          };
        }
      });
      return updated;
    });
  };

  const updateSingleTokenAPY = (update: {
    token: string;
    supply: number;
    borrow: number;
  }) => {
    setTokensData((prev) => {
      if (!prev[update.token]) return prev;

      return {
        ...prev,
        [update.token]: {
          ...prev[update.token],
          supplyAPY: update.supply,
          borrowAPY: update.borrow,
          isConnected: true,
        },
      };
    });
  };

  const formatAPY = (apy: number) => {
    if (apy === 0) return "< 0.01";
    if (apy < 0.01) return "< 0.01";
    return apy.toFixed(2);
  };

  return (
    <div className="relative min-h-screen bg-black text-white pt-24 sm:pt-32 pb-12 px-3 sm:px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#fe1f70]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-4 sm:mb-6 backdrop-blur-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            ></span>
            <span className="text-xs sm:text-sm text-gray-300">{connectionStatus}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 leading-tight px-2">
            Real-Time{" "}
            <span className="bg-gradient-to-r from-[#fe1f70] via-[#ff3d87] to-[#fe1f70] bg-clip-text text-transparent">
              APY Rates
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            Live supply and borrow APY rates from Aave Protocol
          </p>
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 px-3 sm:px-8 py-3 sm:py-5 bg-white/5 border-b border-white/10">
            <div className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Asset
            </div>
            <div className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider text-center">
              Supply
            </div>
            <div className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider text-center">
              Borrow
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/10">
            {Object.values(tokensData).map((token) => (
              <div
                key={token.symbol}
                className="grid grid-cols-3 gap-2 sm:gap-6 px-3 sm:px-8 py-4 sm:py-6 hover:bg-white/10 transition-all group"
              >
                {/* Asset */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                    <img
                      src={token.logoUrl}
                      alt={token.symbol}
                      className="w-6 h-6 sm:w-9 sm:h-9 object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm sm:text-lg truncate">
                      {token.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">{token.symbol}</div>
                  </div>
                </div>

                {/* Supply APY */}
                <div className="flex items-center justify-center">
                  <div
                    className={`text-lg sm:text-3xl font-bold ${
                      token.isConnected
                        ? "text-[#fe1f70]"
                        : "text-gray-500"
                    }`}
                  >
                    {formatAPY(token.supplyAPY)}%
                  </div>
                </div>

                {/* Borrow APY */}
                <div className="flex items-center justify-center">
                  <div
                    className={`text-lg sm:text-3xl font-bold ${
                      token.isConnected ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {formatAPY(token.borrowAPY)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400 px-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
            Data updates in real-time from Aave smart contracts
          </p>
        </div>

        {/* Connection Info */}
        {!isConnected && (
          <div className="mt-6 sm:mt-8 bg-[#fe1f70]/10 border border-[#fe1f70]/30 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#fe1f70] mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="min-w-0">
                <div className="font-semibold text-[#fe1f70] mb-2 text-base sm:text-lg">
                  WebSocket Connection Issue
                </div>
                <div className="text-sm sm:text-base text-gray-300 break-words">
                  Make sure the backend WebSocket server is running on port
                  8080. Run:{" "}
                  <code className="bg-black/50 px-2 sm:px-3 py-1 rounded border border-white/10 text-xs sm:text-sm inline-block mt-2">
                    bun run backend/websocket-server.ts
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
