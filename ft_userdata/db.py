from dataclasses import asdict, dataclass
from pymongo import MongoClient
import os
from bson.objectid import ObjectId


@dataclass
class Strategy:
    name: str
    filename: str
    code: str
    indicators: list[str]
    explanation: str
    example: str
    description: str
    analysis: str

@dataclass
class PairGroup:
    name: str
    pairs: list[str]

@dataclass
class Backtesting:
    name: str
    start_date: str
    end_date: str
    pair_group_id: str
    strategies: list[str]
    status: str  # 'pending', 'running', 'completed', 'failed'
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
    win_rate: float
    details: dict


class DBService:
    def __init__(self):
        MONGO_URL = os.environ.get("MONGODB_URL")
        MONGO_USER = os.environ.get("MONGODB_USER")
        MONGO_PASS = os.environ.get("MONGODB_PASS")
        MONOGO_DB = os.environ.get("MONGODB_DB")
        MONOGO_PORT = os.environ.get("MONGODB_PORT")

        client = MongoClient(
            host=MONGO_URL, port=MONOGO_PORT, username=MONGO_USER, password=MONGO_PASS
        )
        self.db = client.get_database(MONOGO_DB)

    def get_strategies(self):
        return self.db.get_collection("strategies").find()

    def filter_strategies(self, names: list[str]):
        return self.db.get_collection("strategies").find({"name": {"$in": names}})
    
    def filter_strategies_by_id(self, ids: list[str]):
        return self.db.get_collection("strategies").find({"_id": {"$in": [ObjectId(id) for id in ids]}})

    def add_strategy(self, strategy: Strategy):
        result = self.db.get_collection("strategies").update_one(
            {"name": strategy.name}, { "$set": asdict(strategy) }, upsert=True
        )
        return result

    def get_strategy(self, id):
        return self.db.get_collection("strategies").find_one({"_id": id})

    def get_backtestings(self):
        return self.db.get_collection("backtestings").find()
    
    def get_pending_backtestings_to_process(self):
        return self.db.get_collection("backtestings").find({"status": "pending"})

    def update_backtesting_status(self, backtesting_id: str, status: 'pending' or 'running' or 'completed' or 'failed' = 'pending'):  # type: ignore # noqa: F821
        return self.db.get_collection("backtestings").update_one(
            {"_id": ObjectId(backtesting_id)}, {"$set": {"status": status}}
        )

    def get_pair_group(self, group_id: str):
        return self.db.get_collection("pair_groups").find_one({"_id": ObjectId(group_id)})

    def add_backtesting(self, backtesting: Backtesting):
        result = self.db.get_collection("backtestings").insert_one(asdict(backtesting))
        return result
    
    def add_pair_group(self, pair_group: PairGroup):
        result = self.db.get_collection("pair_groups").insert_one(asdict(pair_group))
        return result
    
    def add_strategy_performance(self, performance: StrategyPerformance):
        return self.db.get_collection("strategy_performances").insert_one(asdict(performance))

    def add_backtesting_result(
        self, backtesting_id, performances: list[str]
    ):
        self.db.get_collection("backtestings").update_one(
            {"_id": ObjectId(backtesting_id)}, {"$set": {"status": "completed", "performances": performances}}
        )
        return backtesting_id
