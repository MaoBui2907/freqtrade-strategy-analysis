
export interface BacktestingData {
    uid: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
    timeframe: Timeframe;
    pairGroup: string;
    strategyGroup: string;
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

export interface StrategyGroupData {
    uid: string;
    name: string;
    description: string;
    strategies: string[];
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

export enum Timeframe {
    M1 = '1m',
    M5 = '5m',
    M15 = '15m',
    M30 = '30m',
    H1 = '1h',
    H4 = '4h',
    H8 = '8h',
    D1 = '1d',
    W1 = '1w',
    MN1 = '1M'
}