
from typing import Optional
from pydantic import BaseModel

class PairGroupRequest(BaseModel):
    name: str
    description: str
    pairs: list[str]

class PairGroupResponse(BaseModel):
    uid: str
    name: str
    description: str
    pairs: list[str]

class StrategyPerformance(BaseModel):
    uid: str
    strategy_name: str
    wins: int
    losses: int
    draws: int
    total_trades: int
    trade_per_day: float
    profit: float
    final_balance: float
    max_drawdown: float
    profit_percentage: float

class BacktestingRequest(BaseModel):
    name: str
    start_date: str
    end_date: str
    pair_group_id: str
    strategies: list[str]


class BacktestingResponse(BaseModel):
    uid: str
    start_date: str
    end_date: str
    performances: list[StrategyPerformance]

class StrategyUpdateRequest(BaseModel):
    name: str
    description: str
    explanation: str
    indicators: list[str]
    example: str

class AIQueryRequest(BaseModel):
    query: str
    query_type: str
    content: Optional[str] = None