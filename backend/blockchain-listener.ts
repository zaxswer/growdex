import { ethers } from 'ethers';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import {
  APYData,
  APYUpdate,
  AAVE_POOL_ADDRESS,
  POOL_ABI,
  TOKEN_ADDRESSES,
  REDIS_KEYS,
  HISTORY_RETENTION_DAYS,
  SupportedToken
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

class BlockchainListener {
  private provider: ethers.WebSocketProvider | null = null;
  private contract: ethers.Contract | null = null;
  private redis: Redis;
  private apyCache: Map<string, APYData> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl){
        throw new Error('No redis URL');
    }
    this.redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 1000, 10000);
        Logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
        return delay;
      },
      reconnectOnError: (err) => {
        Logger.error('Redis connection error', { error: err.message });
        return true;
      }
    });

    this.redis.on('connect', () => {
      Logger.info('Redis connected successfully');
    });

    this.redis.on('error', (err) => {
      Logger.error('Redis error', { error: err.message });
    });
  }

  private rayToAPY(ray: bigint): number {
    const RAY = BigInt(10) ** BigInt(27);
    const SECONDS_PER_YEAR = 31536000;
    
    if (ray === BigInt(0)) return 0;
    
    const annualRate = Number(ray) / Number(RAY);
    const ratePerSecond = annualRate / SECONDS_PER_YEAR;
    
    try {
      const apy = (Math.pow(1 + ratePerSecond, SECONDS_PER_YEAR) - 1) * 100;
      if (!isFinite(apy) || apy < 0 || apy > 10000) {
        return annualRate * 100;
      }
      return parseFloat(apy.toFixed(5));
    } catch {
      return parseFloat((annualRate * 100).toFixed(5));
    }
  }

  async initialize(): Promise<void> {
    const wsUrl = process.env.ETH_WS_URL;
    
    if (!wsUrl) {
      throw new Error('No URL');
    }

    Logger.info('Connecting to Ethereum WebSocket', { url: wsUrl.replace(/\/[^\/]+$/, '/***') });
    
    this.provider = new ethers.WebSocketProvider(wsUrl);
    this.contract = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, this.provider);

    // Verify network
    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    
    Logger.info('Connected to Ethereum Mainnet', { chainId });

    // Initialize APY cache from blockchain
    Logger.info('Fetching initial APY data...');
    for (const [symbol, address] of Object.entries(TOKEN_ADDRESSES)) {
      try {
        const reserveData = await this.contract.getReserveData(address);
        const apyData: APYData = {
          supply: this.rayToAPY(reserveData.currentLiquidityRate),
          borrow: this.rayToAPY(reserveData.currentVariableBorrowRate)
        };
        
        this.apyCache.set(symbol, apyData);
        await this.storeAPYInRedis(symbol as SupportedToken, apyData);
        
        Logger.info(`Initial APY for ${symbol}`, apyData);
      } catch (error: any) {
        Logger.error(`Failed to fetch initial data for ${symbol}`, { error: error.message });
      }
    }

    // Start cleanup job
    this.startCleanupJob();
    
    this.reconnectAttempts = 0;
  }

  private async storeAPYInRedis(token: SupportedToken, apyData: APYData): Promise<void> {
    const timestamp = Date.now();
    const apyKey = REDIS_KEYS.APY(token);
    const historyKey = REDIS_KEYS.HISTORY(token);

    try {
      // Store current APY
      await this.redis.hset(apyKey, {
        supplyAPY: apyData.supply.toString(),
        borrowAPY: apyData.borrow.toString(),
        timestamp: timestamp.toString()
      });

      // Store in history (sorted set with timestamp as score)
      const historyValue = JSON.stringify({
        supply: apyData.supply,
        borrow: apyData.borrow
      });
      await this.redis.zadd(historyKey, timestamp, historyValue);

      // Set expiry for history (7 days + 1 hour buffer)
      const expirySeconds = (HISTORY_RETENTION_DAYS + 1) * 24 * 60 * 60;
      await this.redis.expire(historyKey, expirySeconds);
      
    } catch (error: any) {
      Logger.error('Failed to store APY in Redis', { token, error: error.message });
    }
  }

  private async publishUpdate(update: APYUpdate): Promise<void> {
    try {
      await this.redis.publish(REDIS_KEYS.PUBSUB_CHANNEL, JSON.stringify(update));
      Logger.info('Published update to Redis', update);
    } catch (error: any) {
      Logger.error('Failed to publish update', { error: error.message });
    }
  }

  async startListening(): Promise<void> {
    if (!this.contract || !this.provider) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    Logger.info('Starting to listen for ReserveDataUpdated events...');

    this.contract.on('ReserveDataUpdated', async (reserve, liquidityRate, _stableBorrowRate, variableBorrowRate) => {
      const tokenEntry = Object.entries(TOKEN_ADDRESSES).find(([_, addr]) => 
        addr.toLowerCase() === reserve.toLowerCase()
      );

      if (tokenEntry) {
        const [symbol] = tokenEntry;
        const token = symbol as SupportedToken;
        
        const newAPY: APYData = {
          supply: this.rayToAPY(liquidityRate),
          borrow: this.rayToAPY(variableBorrowRate)
        };

        const oldAPY = this.apyCache.get(symbol);
        
        if (oldAPY) {
          const supplyDelta = parseFloat((newAPY.supply - oldAPY.supply).toFixed(5));
          const borrowDelta = parseFloat((newAPY.borrow - oldAPY.borrow).toFixed(5));
          
          // Only process if there's an actual change
          if (Math.abs(supplyDelta) > 0.00001 || Math.abs(borrowDelta) > 0.00001) {
            const update: APYUpdate = {
              token: symbol,
              supply: newAPY.supply,
              borrow: newAPY.borrow,
              supplyDelta,
              borrowDelta,
              timestamp: Date.now()
            };

            Logger.info(`APY Change detected for ${symbol}`, {
              supply: `${oldAPY.supply.toFixed(5)}% → ${newAPY.supply.toFixed(5)}% (${supplyDelta >= 0 ? '+' : ''}${supplyDelta}%)`,
              borrow: `${oldAPY.borrow.toFixed(5)}% → ${newAPY.borrow.toFixed(5)}% (${borrowDelta >= 0 ? '+' : ''}${borrowDelta}%)`
            });

            // Store in Redis and publish
            await this.storeAPYInRedis(token, newAPY);
            await this.publishUpdate(update);
          }
        } else {
          Logger.info(`First APY data for ${symbol}`, newAPY);
          await this.storeAPYInRedis(token, newAPY);
        }
        
        this.apyCache.set(symbol, newAPY);
      }
    });

    // Handle provider errors and disconnections
    this.provider.on('error', (error) => {
      Logger.error('Provider error', { error: error.message });
      this.handleDisconnect();
    });

    // WebSocket specific error handling (check if _websocket exists)
    const websocket = (this.provider as any)._websocket;
    if (websocket) {
      websocket.on('close', () => {
        Logger.warn('WebSocket connection closed');
        this.handleDisconnect();
      });

      websocket.on('error', (error: any) => {
        Logger.error('WebSocket error', { error: error.message });
      });
    } else {
      Logger.warn('WebSocket not available, skipping low-level event handlers');
    }
  }

  private async handleDisconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Logger.error('Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    Logger.warn(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    await this.stop();
    
    setTimeout(async () => {
      try {
        await this.initialize();
        await this.startListening();
        Logger.info('Successfully reconnected');
      } catch (error: any) {
        Logger.error('Reconnection failed', { error: error.message });
        this.handleDisconnect();
      }
    }, delay);
  }

  private startCleanupJob(): void {
    // Run cleanup daily
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
    
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupOldHistory();
    }, CLEANUP_INTERVAL);

    // Run initial cleanup
    this.cleanupOldHistory();
  }

  private async cleanupOldHistory(): Promise<void> {
    const cutoffTime = Date.now() - (HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    Logger.info('Running history cleanup', { cutoffDate: new Date(cutoffTime).toISOString() });

    for (const token of Object.keys(TOKEN_ADDRESSES)) {
      try {
        const historyKey = REDIS_KEYS.HISTORY(token);
        const removed = await this.redis.zremrangebyscore(historyKey, '-inf', cutoffTime);
        
        if (removed > 0) {
          Logger.info(`Cleaned up old history for ${token}`, { recordsRemoved: removed });
        }
      } catch (error: any) {
        Logger.error(`Failed to cleanup history for ${token}`, { error: error.message });
      }
    }
  }

  async stop(): Promise<void> {
    Logger.info('Stopping blockchain listener...');
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.contract) {
      await this.contract.removeAllListeners();
    }

    if (this.provider) {
      this.provider.destroy();
    }

    await this.redis.quit();
  }
}

async function main() {
  const listener = new BlockchainListener();

  try {
    Logger.info('Starting Blockchain Listener Service');
    await listener.initialize();
    await listener.startListening();
    Logger.info('Service running successfully');
  } catch (error: any) {
    Logger.error('Fatal error', { error: error.message, stack: error.stack });
    await listener.stop();
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    Logger.info(`Received ${signal}, shutting down gracefully...`);
    await listener.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
