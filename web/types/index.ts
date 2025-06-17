export interface Bot {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  strategy: string;
  pairGroup: string;
  todayPL: number;
  totalPL: number;
  winRate: number;
  maxDrawdown: number;
  avgTradeDuration: string;
  equityData: EquityPoint[];
  trades: Trade[];
}

export interface EquityPoint {
  timestamp: string;
  value: number;
}

export interface Trade {
  id: string;
  pair: string;
  direction: 'long' | 'short';
  openTime: string;
  closeTime: string;
  plPercent: number;
  plQuote: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
}

export interface PairGroup {
  id: string;
  name: string;
  pairs: string[];
}

export interface BacktestResult {
  id: string;
  strategy: string;
  pairGroup: string;
  timeRange: string;
  timeframe: string;
  totalPL: number;
  winRate: number;
  maxDrawdown: number;
  totalTrades: number;
  equityData: EquityPoint[];
  trades: Trade[];
  createdAt: string;
}

export interface PortfolioStats {
  totalBotsRunning: number;
  totalPL24h: number;
  mostProfitableStrategy: string;
  totalValue: number;
  portfolioData: EquityPoint[];
}