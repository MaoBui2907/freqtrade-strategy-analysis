
export interface BacktestingData {
    uid: string;
    name: string;
    startDate: string;
    endDate: string;
    pairGroup: string;
}

export interface StrategyPerformance {
    uid: string;
    strategyName: string;
    wins: number;
    losses: number;
    draws: number;
    tradePerDay: number;
    totalTrades: number;
    profit: number;
    finalBalance: number;
    maxDrawdown: number;
    profitPercent: number;
}

export interface PairData {
    name: string;
    description: string;
}

export interface PairGroupData {
    uid: string;
    name: string;
    description: string;
    pairs: string[];
}

export interface StrategyData {
    uid: string;
    name: string;
    indicators: string[];
    description: string;
}


export interface StrategyDetailData {
    uid: string;
    name: string;
    description: string;
    indicators: string[];
    explanation: string;
    example: string;
}