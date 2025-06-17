// Adapter functions to convert between API types and VUI types
import { 
  StrategyResponse, 
  PairGroupResponse, 
  BacktestingResponse, 
  StrategyPerformance 
} from './api-client';
import { 
  Strategy, 
  PairGroup, 
  BacktestResult, 
  EquityPoint, 
  Trade 
} from '@/types';

// Convert API Strategy to VUI Strategy
export function adaptStrategy(apiStrategy: StrategyResponse): Strategy {
  return {
    id: apiStrategy.id,
    name: apiStrategy.name,
    description: apiStrategy.description || 'No description available'
  };
}

// Convert API PairGroup to VUI PairGroup
export function adaptPairGroup(apiPairGroup: PairGroupResponse): PairGroup {
  return {
    id: apiPairGroup.id,
    name: apiPairGroup.name,
    pairs: apiPairGroup.pairs
  };
}

// Convert API BacktestingResponse to VUI BacktestResult
export function adaptBacktestResult(
  apiBacktest: BacktestingResponse, 
  performances?: StrategyPerformance[]
): BacktestResult {
  // Calculate aggregated performance metrics
  const totalPL = performances?.reduce((sum, p) => sum + p.profit, 0) || 0;
  const totalTrades = performances?.reduce((sum, p) => sum + p.total_trades, 0) || 0;
  const avgWinRate = performances?.length 
    ? performances.reduce((sum, p) => sum + (p.wins / p.total_trades * 100), 0) / performances.length 
    : 0;
  const maxDrawdown = performances?.reduce((max, p) => Math.max(max, p.max_drawdown), 0) || 0;

  // Generate mock equity data for now (will be replaced with real data when available)
  const equityData: EquityPoint[] = generateMockEquityData(30, 10000 + totalPL);
  
  // Generate mock trades for now (will be replaced with real data when available)
  const trades: Trade[] = generateMockTrades(totalTrades);

  return {
    id: apiBacktest.id,
    strategy: apiBacktest.strategy_id, // Updated to use strategy_id
    pairGroup: apiBacktest.pair_group_id,
    timeRange: `${apiBacktest.start_date} to ${apiBacktest.end_date}`,
    timeframe: apiBacktest.timeframe,
    totalPL: totalPL,
    winRate: avgWinRate,
    maxDrawdown: maxDrawdown,
    totalTrades: totalTrades,
    equityData: equityData,
    trades: trades,
    createdAt: new Date().toISOString() // API doesn't provide this, using current time
  };
}

// Helper function to generate mock equity data (temporary)
function generateMockEquityData(days: number, startValue: number): EquityPoint[] {
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

// Helper function to generate mock trades (temporary)
function generateMockTrades(count: number): Trade[] {
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

// Convert VUI timeframe to API timeframe
export function adaptTimeframe(vuiTimeRange: string): { start_date: string; end_date: string } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (vuiTimeRange) {
    case 'Last 7 days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'Last 30 days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'Last 90 days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'Last 6 months':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case 'Last 1 year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0]
  };
} 