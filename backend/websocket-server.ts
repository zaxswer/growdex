import WebSocket, { WebSocketServer as WSServer } from 'ws';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import {
  WebSocketMessage,
  CurrentAPYResponse,
  HistoryRequest,
  HistoryResponse,
  SubscribeRequest,
  UpdateMessage,
  ErrorMessage,
  REDIS_KEYS,
  SUPPORTED_TOKENS,
  HistoricalDataPoint
} from './types';

dotenv.config({ quiet: true });

class Logger {
  private static log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
  }

  static info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  static warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  static error(message: string, data?: any) {
    this.log('ERROR', message, data);
  }
}

interface ClientInfo {
  ws: WebSocket;
  subscribedTokens: Set<string>;
  isAlive: boolean;
}

class WebSocketServer {
  private wss: WSServer;
  private redis: Redis;
  private redisSub: Redis;
  private clients: Map<WebSocket, ClientInfo> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(port: number) {
    this.wss = new WSServer({ 
      port,
      clientTracking: true
    });

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Main Redis client for queries
    this.redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 1000, 10000);
        Logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      }
    });

    // Separate Redis client for pub/sub
    this.redisSub = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 1000, 10000);
        Logger.warn(`Redis (sub) reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      }
    });

    this.redis.on('connect', () => {
      Logger.info('Redis connected successfully');
    });

    this.redis.on('error', (err) => {
      Logger.error('Redis error', { error: err.message });
    });

    this.redisSub.on('error', (err) => {
      Logger.error('Redis (sub) error', { error: err.message });
    });
  }

  async initialize(): Promise<void> {
    // Subscribe to Redis pub/sub channel
    await this.redisSub.subscribe(REDIS_KEYS.PUBSUB_CHANNEL);
    Logger.info('Subscribed to Redis pub/sub channel', { channel: REDIS_KEYS.PUBSUB_CHANNEL });

    this.redisSub.on('message', (channel, message) => {
      if (channel === REDIS_KEYS.PUBSUB_CHANNEL) {
        try {
          const update = JSON.parse(message);
          this.broadcastUpdate(update);
        } catch (error: any) {
          Logger.error('Failed to parse Redis pub/sub message', { error: error.message, message });
        }
      }
    });

    // Setup WebSocket server
    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    // Start heartbeat
    this.startHeartbeat();

    Logger.info('WebSocket server initialized', { 
      port: (this.wss.address() as any)?.port || 'unknown'
    });
  }

  private handleConnection(ws: WebSocket): void {
    const clientInfo: ClientInfo = {
      ws,
      subscribedTokens: new Set(SUPPORTED_TOKENS),
      isAlive: true
    };

    this.clients.set(ws, clientInfo);
    Logger.info('Client connected', { 
      totalClients: this.clients.size,
      clientId: this.getClientId(ws)
    });

    // Send welcome message and current APY data
    this.sendWelcomeMessage(ws);

    // Handle incoming messages
    ws.on('message', async (data: WebSocket.Data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await this.handleMessage(ws, message);
      } catch (error: any) {
        Logger.error('Failed to handle message', { error: error.message });
        this.sendError(ws, 'Invalid message format');
      }
    });

    // Handle pong responses
    ws.on('pong', () => {
      const client = this.clients.get(ws);
      if (client) {
        client.isAlive = true;
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      this.clients.delete(ws);
      Logger.info('Client disconnected', { 
        totalClients: this.clients.size,
        clientId: this.getClientId(ws)
      });
    });

    ws.on('error', (error) => {
      Logger.error('WebSocket error', { error: error.message, clientId: this.getClientId(ws) });
    });
  }

  private async sendWelcomeMessage(ws: WebSocket): Promise<void> {
    try {
      // Send connected confirmation
      const connectedMsg: WebSocketMessage = {
        type: 'connected',
        data: {
          message: 'Connected to Aave APY Monitor',
          supportedTokens: SUPPORTED_TOKENS
        }
      };
      this.sendMessage(ws, connectedMsg);

      // Send current APY data
      const currentAPY = await this.getCurrentAPY();
      this.sendMessage(ws, currentAPY);
    } catch (error: any) {
      Logger.error('Failed to send welcome message', { error: error.message });
    }
  }

  private async handleMessage(ws: WebSocket, message: WebSocketMessage): Promise<void> {
    const client = this.clients.get(ws);
    if (!client) return;

    Logger.info('Received message', { 
      type: message.type, 
      clientId: this.getClientId(ws)
    });

    switch (message.type) {
      case 'current':
        const currentAPY = await this.getCurrentAPY();
        this.sendMessage(ws, currentAPY);
        break;

      case 'history':
        const historyRequest = message as HistoryRequest;
        if (historyRequest.token && historyRequest.hours) {
          const history = await this.getHistory(historyRequest.token, historyRequest.hours);
          this.sendMessage(ws, history);
        } else {
          this.sendError(ws, 'Invalid history request. Requires token and hours.');
        }
        break;

      case 'subscribe':
        const subscribeRequest = message as SubscribeRequest;
        if (subscribeRequest.tokens && Array.isArray(subscribeRequest.tokens)) {
          client.subscribedTokens = new Set(
            subscribeRequest.tokens.filter(token => SUPPORTED_TOKENS.includes(token as any))
          );
          Logger.info('Client subscription updated', { 
            clientId: this.getClientId(ws),
            tokens: Array.from(client.subscribedTokens)
          });
          this.sendMessage(ws, {
            type: 'connected',
            data: { 
              message: 'Subscription updated', 
              subscribedTokens: Array.from(client.subscribedTokens) 
            }
          });
        } else {
          this.sendError(ws, 'Invalid subscribe request. Requires tokens array.');
        }
        break;

      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private async getCurrentAPY(): Promise<CurrentAPYResponse> {
    const data: any = {};

    for (const token of SUPPORTED_TOKENS) {
      try {
        const apyKey = REDIS_KEYS.APY(token);
        const apyData = await this.redis.hgetall(apyKey);

        if (apyData && apyData.supplyAPY) {
          data[token] = {
            supply: parseFloat(apyData.supplyAPY),
            borrow: parseFloat(apyData.borrowAPY),
            timestamp: parseInt(apyData.timestamp)
          };
        }
      } catch (error: any) {
        Logger.error(`Failed to get current APY for ${token}`, { error: error.message });
      }
    }

    return {
      type: 'current',
      data
    };
  }

  private async getHistory(token: string, hours: number): Promise<HistoryResponse> {
    const historyKey = REDIS_KEYS.HISTORY(token);
    const startTime = Date.now() - (hours * 60 * 60 * 1000);
    
    try {
      // Get all entries from startTime to now
      const results = await this.redis.zrangebyscore(
        historyKey,
        startTime,
        '+inf',
        'WITHSCORES'
      );

      const dataPoints: HistoricalDataPoint[] = [];
      
      // Results come as [value, score, value, score, ...]
      for (let i = 0; i < results.length; i += 2) {
        try {
          const value = JSON.parse(results[i]);
          const timestamp = parseInt(results[i + 1]);
          
          dataPoints.push({
            supply: value.supply,
            borrow: value.borrow,
            timestamp
          });
        } catch (error: any) {
          Logger.error('Failed to parse history entry', { error: error.message });
        }
      }

      return {
        type: 'history',
        token,
        data: dataPoints
      };
    } catch (error: any) {
      Logger.error(`Failed to get history for ${token}`, { error: error.message });
      return {
        type: 'history',
        token,
        data: []
      };
    }
  }

  private broadcastUpdate(update: any): void {
    const updateMessage: UpdateMessage = {
      type: 'update',
      data: update
    };

    let sentCount = 0;

    this.clients.forEach((client, ws) => {
      // Only send if client is subscribed to this token
      if (client.subscribedTokens.has(update.token)) {
        this.sendMessage(ws, updateMessage);
        sentCount++;
      }
    });

    Logger.info('Broadcasted update', { 
      token: update.token, 
      clientsSent: sentCount, 
      totalClients: this.clients.size 
    });
  }

  private sendMessage(ws: WebSocket, message: WebSocketMessage | CurrentAPYResponse | HistoryResponse | UpdateMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, errorMessage: string): void {
    const error: ErrorMessage = {
      type: 'error',
      error: errorMessage
    };
    this.sendMessage(ws, error);
  }

  private startHeartbeat(): void {
    // Ping clients every 30 seconds
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client, ws) => {
        if (!client.isAlive) {
          Logger.warn('Client not responding, terminating', { clientId: this.getClientId(ws) });
          ws.terminate();
          this.clients.delete(ws);
          return;
        }

        client.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private getClientId(ws: WebSocket): string {
    // Simple client ID based on the WebSocket object
    return `client_${Array.from(this.clients.keys()).indexOf(ws)}`;
  }

  async stop(): Promise<void> {
    Logger.info('Stopping WebSocket server...');

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Close all client connections
    this.clients.forEach((client, ws) => {
      ws.close(1000, 'Server shutting down');
    });

    // Close WebSocket server
    await new Promise<void>((resolve) => {
      this.wss.close(() => {
        Logger.info('WebSocket server closed');
        resolve();
      });
    });

    // Unsubscribe from Redis
    await this.redisSub.unsubscribe();
    await this.redisSub.quit();
    await this.redis.quit();

    Logger.info('All connections closed');
  }
}

async function main() {
  const port = parseInt(process.env.WS_PORT || '8080');
  const server = new WebSocketServer(port);

  try {
    Logger.info('Starting WebSocket Server');
    await server.initialize();
    Logger.info(`Server running on ws://localhost:${port}`);
  } catch (error: any) {
    Logger.error('Fatal error', { error: error.message, stack: error.stack });
    await server.stop();
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    Logger.info(`Received ${signal}, shutting down gracefully...`);
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
