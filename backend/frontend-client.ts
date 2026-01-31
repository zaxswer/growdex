import WebSocket from 'ws';
import {
  WebSocketMessage,
  CurrentAPYResponse,
  HistoryRequest,
  HistoryResponse,
  UpdateMessage,
  ErrorMessage,
  SUPPORTED_TOKENS
} from './types';

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

class FrontendClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private serverUrl: string;
  private shouldReconnect = true;

  constructor(serverUrl: string = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
  }

  connect(): void {
    Logger.info('Connecting to WebSocket server', { url: this.serverUrl });

    this.ws = new WebSocket(this.serverUrl);

    this.ws.on('open', () => {
      this.reconnectAttempts = 0;
      Logger.info('Connected to server');
      
      // Request initial data
      this.requestCurrentAPY();
      
      // Example: Request 24h history for USDC
      this.requestHistory('USDC', 24);
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error: any) {
        Logger.error('Failed to parse message', { error: error.message });
      }
    });

    this.ws.on('close', (code, reason) => {
      Logger.warn('Disconnected from server', { 
        code, 
        reason: reason.toString() 
      });
      
      if (this.shouldReconnect) {
        this.handleReconnect();
      }
    });

    this.ws.on('error', (error) => {
      Logger.error('WebSocket error', { error: error.message });
    });

    this.ws.on('ping', () => {
      if (this.ws) {
        this.ws.pong();
      }
    });
  }

  private handleMessage(message: WebSocketMessage | CurrentAPYResponse | HistoryResponse | UpdateMessage | ErrorMessage): void {
    switch (message.type) {
      case 'connected':
        Logger.info('Server connection confirmed', message.data);
        break;

      case 'current':
        const currentResponse = message as CurrentAPYResponse;
        Logger.info('Current APY Data:', currentResponse.data);
        this.displayCurrentAPY(currentResponse);
        break;

      case 'history':
        const historyResponse = message as HistoryResponse;
        Logger.info(`History for ${historyResponse.token}`, {
          dataPoints: historyResponse.data.length,
          firstPoint: historyResponse.data[0],
          lastPoint: historyResponse.data[historyResponse.data.length - 1]
        });
        break;

      case 'update':
        const updateMessage = message as UpdateMessage;
        this.handleUpdate(updateMessage.data);
        break;

      case 'error':
        const errorMessage = message as ErrorMessage;
        Logger.error('Server error', { error: errorMessage.error });
        break;

      default:
        Logger.warn('Unknown message type', { message });
    }
  }

  private displayCurrentAPY(response: CurrentAPYResponse): void {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║              CURRENT AAVE V3 APY RATES                    ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    
    for (const [token, data] of Object.entries(response.data)) {
      const timestamp = new Date(data.timestamp).toLocaleString();
      console.log(`║ ${token.padEnd(7)} │ Supply: ${data.supply.toFixed(5)}% │ Borrow: ${data.borrow.toFixed(5)}% ║`);
    }
    
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
  }

  private handleUpdate(update: any): void {
    const supplyChange = update.supplyDelta >= 0 ? '↑' : '↓';
    const borrowChange = update.borrowDelta >= 0 ? '↑' : '↓';
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log(`║  APY UPDATE: ${update.token.padEnd(7)}                                  ║`);
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Supply APY: ${update.supply.toFixed(5)}%  ${supplyChange} ${Math.abs(update.supplyDelta).toFixed(5)}%        ║`);
    console.log(`║  Borrow APY: ${update.borrow.toFixed(5)}%  ${borrowChange} ${Math.abs(update.borrowDelta).toFixed(5)}%        ║`);
    console.log(`║  Time: ${new Date(update.timestamp).toLocaleTimeString().padEnd(45)}║`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Also log to console
    Logger.info(`APY Update: ${update.token}`, {
      supply: `${update.supply.toFixed(5)}% (${update.supplyDelta >= 0 ? '+' : ''}${update.supplyDelta.toFixed(5)}%)`,
      borrow: `${update.borrow.toFixed(5)}% (${update.borrowDelta >= 0 ? '+' : ''}${update.borrowDelta.toFixed(5)}%)`
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Logger.error('Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    Logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  requestCurrentAPY(): void {
    this.sendMessage({ type: 'current' });
  }

  requestHistory(token: string, hours: number): void {
    const request: HistoryRequest = {
      type: 'history',
      token,
      hours
    };
    this.sendMessage(request);
  }

  subscribeToTokens(tokens: string[]): void {
    const request: WebSocketMessage = {
      type: 'subscribe',
      tokens
    };
    this.sendMessage(request);
    Logger.info('Subscription updated', { tokens });
  }

  private sendMessage(message: WebSocketMessage | HistoryRequest): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      Logger.warn('Cannot send message, WebSocket not open');
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    
    Logger.info('Disconnected from server');
  }
}

// Example usage
async function main() {
  const serverUrl = process.env.WS_SERVER_URL || 'ws://localhost:8080';
  
  Logger.info('Starting Frontend Client');
  const client = new FrontendClient(serverUrl);
  
  client.connect();

  // Example: Subscribe to specific tokens after 5 seconds
  setTimeout(() => {
    Logger.info('Subscribing to USDC and USDT only');
    client.subscribeToTokens(['USDC', 'USDT']);
  }, 5000);

  // Example: Request history every 60 seconds
  setInterval(() => {
    Logger.info('Requesting fresh history data');
    client.requestHistory('USDC', 24);
  }, 60000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    Logger.info('Shutting down client...');
    client.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    Logger.info('Shutting down client...');
    client.disconnect();
    process.exit(0);
  });
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { FrontendClient };
