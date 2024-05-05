from textwrap import dedent
from langchain_anthropic import ChatAnthropic
from pymongo.database import Database
from bson.objectid import ObjectId
from db import get_db
from langchain_core.messages import SystemMessage


def get_backtestings(db: Database):
    res = db.get_collection("backtestings").find()
    return [{
        "id": str(r["_id"]),
        "name": r.get("name", ""),
        "status": r["status"],
        "start_date": r["start_date"],
        "end_date": r["end_date"],
        "pair_group_id": str(r["pair_group_id"]),
    } for r in list(res)]

def create_backtesting(db: Database, backtesting: dict):
    res = db.get_collection("backtestings").insert_one({
        "name": backtesting.name,
        "status": "pending",
        "start_date": backtesting.start_date,
        "end_date": backtesting.end_date,
        "pair_group_id": ObjectId(backtesting.pair_group_id),
        "strategies": [ObjectId(strategy_id) for strategy_id in backtesting.strategies],
        "performances": [],
    })
    return str(res.inserted_id)

def get_backtesting_performance(db: Database, id: str):
    res = db.get_collection("backtestings").find_one({"_id": ObjectId(id)})
    res = db.get_collection("strategy_performances").find({"_id": {"$in": res["performances"]}})
    return [{
        "id": str(r["_id"]),
        "strategy_id": str(r["strategy_id"]),
        "strategy_name": r["strategy_name"],
        "start_date": r["start_date"],
        "end_date": r["end_date"],
        "wins": r["wins"],
        "losses": r["losses"],
        "draws": r["draws"],
        "total_trades": r["total_trades"],
        "trade_per_day": r["trade_per_day"],
        "profit": r["profit"],
        "final_balance": r["final_balance"],
        "max_drawdown": r["max_drawdown"],
        "profit_percentage": r["profit_percentage"],
    } for r in list(res)]


def get_pairs(db: Database):
    res = db.get_collection("pairs").find()
    return [{
        "id": str(r["_id"]),
        "name": r["name"],
        "description": r["description"],
    } for r in list(res)]

def get_pair_groups(db: Database):
    res = db.get_collection("pair_groups").find()
    return [{
        "id": str(r["_id"]),
        "name": r["name"],
        "pairs": r["pairs"],
    } for r in list(res)]

def create_pair_group(db: Database, pair_group):
    res = db.get_collection("pair_groups").insert_one({
        "name": pair_group.name,
        "pairs": pair_group.pairs,
        "description": pair_group.description,
    })
    return {
        "id": str(res.inserted_id),
        "name": pair_group.name,
        "pairs": pair_group.pairs,
        "description": pair_group.description,
    }

def delete_pair_group(db: Database, id: str):
    res = db.get_collection("pair_groups").delete_one({"_id": ObjectId(id)})
    return str(res.deleted_count)

def add_pair(db: Database, pair: dict):
    res = db.get_collection("pairs").update_one({
        'name': pair['name']
    }, {
        '$set': {
            'description': pair['description']
        }
    }, upsert=True)
    return str(res.upserted_id)


def get_strategies(db: Database):
    res = db.get_collection("strategies").find()
    return [{
        "id": str(r["_id"]),
        "name": r["name"],
        "description": r["description"],
        "indicators": r.get("indicators", []),
    } for r in list(res)]

def get_strategy(db: Database, id: str):
    res = db.get_collection("strategies").find_one({"_id": ObjectId(id)})
    return {
        "id": str(res["_id"]),
        "name": res["name"],
        "description": res["description"],
        "indicators": res.get("indicators", []),
        "example": res.get("example", ""),
        "explanation": res.get("explanation", "")
    }

def save_strategy(db: Database, id: str, strategy: dict):
    res = db.get_collection("strategies").update_one({
        '_id': ObjectId(id)
    }, {
        '$set': {
            'description': strategy.get('description', ''),
            'indicators': strategy.get('indicators', []),
            'example': strategy.get('example', ''),
            'explanation': strategy.get('explanation', ''),
        }
    })
    return str(res.upserted_id)

def query_ai(db: Database, llm: ChatAnthropic, strategy_id, query: str, query_type: str, content: str = None):
    res = db.get_collection("strategies").find_one({"_id": ObjectId(strategy_id)})
    if content:
        data = content
    else:
        data = res.get(query_type, "")

    code = res.get("code", "")
    print(data)
    system = SystemMessage(dedent("""You are a FreqTrade expertise and can analyze, improve the content based on strategy code and user requirements. 
        Return only the improved content, without modifying code or have any notation or notification text. MUST return as markdown format without Heading 1."""))
    template = f"""
        From the strategy code below and current {query_type} data, follow the user requirement and improve it:
        ==== STRATEGY CODE ====
        {code}
        ==== END STRATEGY CODE ====
        ==== {query_type.upper()} ====
        {data}
        ==== END {query_type.upper()} ====
        ==== USER REQUIREMENT ====
        {query}
        ==== END USER REQUIREMENT ====
    """
    res = llm.invoke([system, template])
    return res.content


if __name__ == '__main__':
    db = get_db()
    res = get_backtestings(db)
    print(res)
    res = get_backtesting_performance(db, "123")
    
