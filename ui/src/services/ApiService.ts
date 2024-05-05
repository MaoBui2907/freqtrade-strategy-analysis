import { BacktestingData, PairData, PairGroupData, StrategyData, StrategyDetailData, StrategyPerformance } from "../types/Backtesting";

const API_ROOT = 'http://localhost:1998';

export function getBacktestings(): Promise<BacktestingData[]> {
    return fetch(`${API_ROOT}/backtestings`)
        .then(response => response.json())
        .then(response => response?.map((item: any) => ({
            uid: item.id,
            name: item.name,
            startDate: item.start_date,
            endDate: item.end_date,
            pairGroup: item.pair_group_id,
        } as BacktestingData)));
}

export function getStrategyPerformance(uid: string): Promise<StrategyPerformance[]> {
    return fetch(`${API_ROOT}/backtestings/${uid}/performances`)
    .then(response => response.json())
    .then(response => response?.map((item: any) => ({
        uid: item.id,
        strategyName: item.strategy_name,
        wins: Number(item.wins.toFixed(3)),
        losses: Number(item.losses.toFixed(3)),
        draws: Number(item.draws.toFixed(3)),
        tradePerDay: Number(item.trade_per_day.toFixed(3)),
        totalTrades: Number(item.total_trades.toFixed(3)),
        profit: Number(item.profit.toFixed(3)),
        finalBalance: Number(item.final_balance.toFixed(3)),
        maxDrawdown: Number(item.max_drawdown.toFixed(3)),
        profitPercent: Number(item.profit_percentage.toFixed(3)),
    } as StrategyPerformance)));
}

export function getPairGroups(): Promise<PairGroupData[]> {
    return fetch(`${API_ROOT}/pair-groups`)
        .then(response => response.json())
        .then(response => response?.map((item: any) => ({
            uid: item.id,
            name: item.name,
            pairs: item.pairs,
        } as PairGroupData)));
}

export function getStrategies(): Promise<StrategyData[]> {
    return fetch(`${API_ROOT}/strategies`)
        .then(response => response.json())
        .then(response => response?.map((item: any) => ({
            uid: item.id,
            name: item.name,
            description: item.description,
            indicators: item.indicators,
        } as StrategyData)));
}

export function createBacktesting(data: BacktestingData, strategies: string[]): Promise<void> {
    return fetch(`${API_ROOT}/backtestings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: data.name,
            start_date: data.startDate,
            end_date: data.endDate,
            strategies: strategies,
            pair_group_id: data.pairGroup,
        }),
    }).then(response => response.json());   
}


export function getPairs(): Promise<PairData[]> {
    return fetch(`${API_ROOT}/pair-groups/pairs`)
        .then(response => response.json())
        .then(response => response?.map((item: any) => ({
            name: item.name,
            description: item.description,
        } as PairData)));
}

export function createPairGroup(data: PairGroupData): Promise<void> {
    return fetch(`${API_ROOT}/pair-groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: data.name,
            description: data.description,
            pairs: data.pairs,
        }),
    }).then(response => response.json());
}


export function deletePairGroup(uid: string): Promise<void> {
    return fetch(`${API_ROOT}/pair-groups/${uid}`, {
        method: 'DELETE',
    }).then(response => response.json());
}

export function getStrategy(uid: string): Promise<StrategyDetailData> {
    return fetch(`${API_ROOT}/strategies/${uid}`)
        .then(response => response.json())
        .then(response => ({
            uid: response.id,
            name: response.name,
            description: response.description,
            indicators: response.indicators,
            explanation: response.explanation,
            example: response.example,
        } as StrategyDetailData));
}

export function saveStrategy(uid: string, data: StrategyDetailData): Promise<void> {
    return fetch(`${API_ROOT}/strategies/${uid}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: data.name,
            description: data.description,
            indicators: data.indicators,
            explanation: data.explanation,
            example: data.example,
        }),
    }).then(response => response.json());
}

export function sendAIQuery(strategyId: string, queryType: string, query: string, content: string): Promise<string> {
    return fetch(`${API_ROOT}/strategies/${strategyId}/ai-query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            query_type: queryType,
            content
        }),
    }).then(response => response.json());
}