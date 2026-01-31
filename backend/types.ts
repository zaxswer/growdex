// Shared TypeScript interfaces for the Aave APY monitoring system

export interface APYData {
  supply: number;
  borrow: number;
}

export interface APYUpdate {
  token: string;
  supply: number;
  borrow: number;
  supplyDelta: number;
  borrowDelta: number;
  timestamp: number;
}

export interface HistoricalDataPoint {
  supply: number;
  borrow: number;
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'current' | 'history' | 'subscribe' | 'update' | 'error' | 'connected';
  data?: any;
  token?: string;
  tokens?: string[];
  hours?: number;
  error?: string;
}

export interface CurrentAPYResponse {
  type: 'current';
  data: {
    [token: string]: APYData & { timestamp: number };
  };
}

export interface HistoryRequest {
  type: 'history';
  token: string;
  hours: number;
}

export interface HistoryResponse {
  type: 'history';
  token: string;
  data: HistoricalDataPoint[];
}

export interface SubscribeRequest {
  type: 'subscribe';
  tokens: string[];
}

export interface UpdateMessage {
  type: 'update';
  data: APYUpdate;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
}

export const SUPPORTED_TOKENS = ['USDC', 'USDT', 'USDe', 'crvUSD'] as const;
export type SupportedToken = typeof SUPPORTED_TOKENS[number];

export const TOKEN_ADDRESSES: Record<SupportedToken, string> = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDe: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
  crvUSD: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E'
};

export const AAVE_POOL_ADDRESS = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2';

export const POOL_ABI = [
  'event ReserveDataUpdated(address indexed reserve, uint256 liquidityRate, uint256 stableBorrowRate, uint256 variableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex)',
  'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))'
];

export const REDIS_KEYS = {
  APY: (token: string) => `aave:apy:${token}`,
  HISTORY: (token: string) => `aave:history:${token}`,
  PUBSUB_CHANNEL: 'aave:updates'
};

export const HISTORY_RETENTION_DAYS = 7;
