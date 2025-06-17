import { Bot, Strategy, PairGroup, BacktestResult, PortfolioStats, Trade, EquityPoint } from '@/types';

// Generate mock equity data
function generateEquityData(days: number, startValue: number = 1000): EquityPoint[] {
  const data: EquityPoint[] = [];
  let currentValue = startValue;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Random walk with slight upward bias
    const change = (Math.random() - 0.45) * 50;
    currentValue += change;
    
    data.push({
      timestamp: date.toISOString(),
      value: Math.max(0, currentValue)
    });
  }
  
  return data;
}

// Generate mock trades
function generateTrades(count: number): Trade[] {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT', 'SOL/USDT'];
  const trades: Trade[] = [];
  
  for (let i = 0; i < count; i++) {
    const openTime = new Date();
    openTime.setHours(openTime.getHours() - Math.random() * 168); // Random time in last week
    
    const closeTime = new Date(openTime);
    closeTime.setMinutes(closeTime.getMinutes() + Math.random() * 480); // Random duration up to 8 hours
    
    const plPercent = (Math.random() - 0.4) * 10; // Slight positive bias
    const plQuote = plPercent * (Math.random() * 100 + 50); // Random base amount
    
    trades.push({
      id: `trade-${i}`,
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      direction: Math.random() > 0.5 ? 'long' : 'short',
      openTime: openTime.toISOString(),
      closeTime: closeTime.toISOString(),
      plPercent: Math.round(plPercent * 100) / 100,
      plQuote: Math.round(plQuote * 100) / 100
    });
  }
  
  return trades.sort((a, b) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime());
}

export const mockBots: Bot[] = [
  {
    id: 'bot-1',
    name: 'BTC Scalper Pro',
    status: 'running',
    strategy: 'ScalpingStrategy',
    pairGroup: 'Major Pairs',
    todayPL: 145.32,
    totalPL: 2847.91,
    winRate: 68.5,
    maxDrawdown: 12.3,
    avgTradeDuration: '2h 15m',
    equityData: generateEquityData(30, 10000),
    trades: generateTrades(45)
  },
  {
    id: 'bot-2',
    name: 'ETH Momentum',
    status: 'running',
    strategy: 'MomentumStrategy',
    pairGroup: 'Altcoins',
    todayPL: -23.45,
    totalPL: 1234.67,
    winRate: 72.1,
    maxDrawdown: 8.7,
    avgTradeDuration: '1h 45m',
    equityData: generateEquityData(30, 8000),
    trades: generateTrades(38)
  },
  {
    id: 'bot-3',
    name: 'DeFi Hunter',
    status: 'stopped',
    strategy: 'BreakoutStrategy',
    pairGroup: 'DeFi Tokens',
    todayPL: 0,
    totalPL: 892.14,
    winRate: 58.9,
    maxDrawdown: 15.2,
    avgTradeDuration: '3h 22m',
    equityData: generateEquityData(30, 5000),
    trades: generateTrades(28)
  },
  {
    id: 'bot-4',
    name: 'Multi-Pair Grid',
    status: 'running',
    strategy: 'GridStrategy',
    pairGroup: 'Top Volume',
    todayPL: 67.89,
    totalPL: 3456.78,
    winRate: 75.3,
    maxDrawdown: 6.4,
    avgTradeDuration: '4h 18m',
    equityData: generateEquityData(30, 12000),
    trades: generateTrades(52)
  }
];

export const mockStrategies: Strategy[] = [
  {
    id: 'scalping',
    name: 'Scalping Strategy',
    description: 'High-frequency trading strategy targeting small price movements with tight stop-losses.'
  },
  {
    id: 'momentum',
    name: 'Momentum Strategy',
    description: 'Follows strong price trends using technical indicators like RSI and MACD.'
  },
  {
    id: 'breakout',
    name: 'Breakout Strategy',
    description: 'Identifies and trades breakouts from support/resistance levels and chart patterns.'
  },
  {
    id: 'grid',
    name: 'Grid Strategy',
    description: 'Places buy and sell orders at regular intervals to profit from price volatility.'
  },
  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    description: 'Exploits temporary price deviations from historical averages.'
  },
  {
    id: 'arbitrage',
    name: 'Arbitrage Strategy',
    description: 'Profits from price differences between different exchanges or trading pairs.'
  }
];

export const mockPairGroups: PairGroup[] = [
  {
    id: 'major-pairs',
    name: 'Major Pairs',
    pairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT']
  },
  {
    id: 'altcoins',
    name: 'Altcoins',
    pairs: ['DOT/USDT', 'LINK/USDT', 'LTC/USDT', 'BCH/USDT', 'ETC/USDT']
  },
  {
    id: 'defi-tokens',
    name: 'DeFi Tokens',
    pairs: ['UNI/USDT', 'AAVE/USDT', 'COMP/USDT', 'MKR/USDT', 'SNX/USDT']
  },
  {
    id: 'top-volume',
    name: 'Top Volume',
    pairs: ['BTC/USDT', 'ETH/USDT', 'DOGE/USDT', 'SHIB/USDT', 'MATIC/USDT']
  }
];

export const mockBacktestResults: BacktestResult[] = [
  {
    id: 'backtest-1',
    strategy: 'Scalping Strategy',
    pairGroup: 'Major Pairs',
    timeRange: 'Last 30 days',
    timeframe: '1h',
    totalPL: 1847.32,
    winRate: 71.2,
    maxDrawdown: 9.8,
    totalTrades: 156,
    equityData: generateEquityData(30, 10000),
    trades: generateTrades(156),
    createdAt: new Date().toISOString()
  },
  {
    id: 'backtest-2',
    strategy: 'Momentum Strategy',
    pairGroup: 'Altcoins',
    timeRange: 'Last 7 days',
    timeframe: '5m',
    totalPL: 432.18,
    winRate: 68.9,
    maxDrawdown: 7.3,
    totalTrades: 89,
    equityData: generateEquityData(7, 5000),
    trades: generateTrades(89),
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockPortfolioStats: PortfolioStats = {
  totalBotsRunning: 3,
  totalPL24h: 189.76,
  mostProfitableStrategy: 'Grid Strategy',
  totalValue: 34567.89,
  portfolioData: generateEquityData(30, 25000)
};

export const allAvailablePairs = [
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOT/USDT',
  'LINK/USDT', 'LTC/USDT', 'BCH/USDT', 'ETC/USDT', 'UNI/USDT', 'AAVE/USDT',
  'COMP/USDT', 'MKR/USDT', 'SNX/USDT', 'DOGE/USDT', 'SHIB/USDT', 'MATIC/USDT',
  'SOL/USDT', 'AVAX/USDT', 'ATOM/USDT', 'FTM/USDT', 'ALGO/USDT', 'VET/USDT',
  'ICP/USDT', 'THETA/USDT', 'FIL/USDT', 'TRX/USDT', 'EOS/USDT', 'XTZ/USDT'
];