import { useEffect, useRef, useState, useCallback } from 'react';

export interface APYData {
  supply: number;
  borrow: number;
  supplyDelta?: number;
  borrowDelta?: number;
  timestamp?: number;
}

export interface APYUpdate {
  token: string;
  supply: number;
  borrow: number;
  supplyDelta: number;
  borrowDelta: number;
  timestamp: number;
}

interface WebSocketMessage {
  type: 'current' | 'history' | 'subscribe' | 'update' | 'error' | 'connected';
  data?: any;
  token?: string;
  error?: string;
}

interface UseWebSocketReturn {
  apyData: Record<string, APYData>;
  isConnected: boolean;
  lastUpdate: number | null;
  error: string | null;
  reconnect: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export function useWebSocket(): UseWebSocketReturn {
  const [apyData, setApyData] = useState<Record<string, APYData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      console.log('Connecting to WebSocket:', WS_URL);
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Request current APY data
        ws.send(JSON.stringify({ type: 'current' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connected':
              console.log('Connected to server:', message.data);
              break;

            case 'current':
              // Update with current APY data for all tokens
              if (message.data) {
                setApyData(message.data);
                setLastUpdate(Date.now());
              }
              break;

            case 'update':
              // Handle real-time update for a specific token
              const update = message.data as APYUpdate;
              if (update && update.token) {
                setApyData(prev => ({
                  ...prev,
                  [update.token]: {
                    supply: update.supply,
                    borrow: update.borrow,
                    supplyDelta: update.supplyDelta,
                    borrowDelta: update.borrowDelta,
                    timestamp: update.timestamp
                  }
                }));
                setLastUpdate(update.timestamp);
              }
              break;

            case 'error':
              console.error('WebSocket error message:', message.error);
              setError(message.error || 'Unknown error');
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        const maxAttempts = 10;
        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else {
          setError('Failed to reconnect after multiple attempts');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect');
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    apyData,
    isConnected,
    lastUpdate,
    error,
    reconnect
  };
}
