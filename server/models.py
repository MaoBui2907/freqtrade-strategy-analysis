
from dataclasses import dataclass


@dataclass
class Strategy:
    name: str
    filename: str
    description: str

@dataclass
class PairGroup:
    name: str
    pairs: list[str]

@dataclass
class Backtesting:
    start_date: str
    end_date: str
    pair_group_id: str
    strategies: list[str]
    status: str  # 'pending', 'processing', 'completed', 'failed'
    performances: list[str] = None

@dataclass
class StrategyPerformance:
    strategy_id: str
    strategy_name: str
    start_date: str
    end_date: str
    wins: int
    losses: int
    draws: int
    total_trades: int
    trade_per_day: float
    profit: float
    final_balance: float
    max_drawdown: float
    profit_percentage: float
    details: dict

