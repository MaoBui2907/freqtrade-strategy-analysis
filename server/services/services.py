from textwrap import dedent
from pymongo.database import Database
from bson.objectid import ObjectId
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import SystemMessage
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
from dateutil import parser


def get_backtestings(db: Database):
    res = db.get_collection("backtestings").find()
    return [{
        "id": str(r["_id"]),
        "name": r.get("name", ""),
        "status": r.get("status", "pending"),
        "start_date": r.get("start_date", ""),
        "end_date": r.get("end_date", ""),
        "pair_group_id": str(r.get("pair_group_id", "")),
        "timeframe": r.get("timeframe", "5m"),
        "strategy_id": str(r.get("strategy_id", "")),
    } for r in list(res)]

def get_backtesting(db: Database, id: str):
    res = db.get_collection("backtestings").find_one({"_id": ObjectId(id)})
    return {
        "id": str(res["_id"]),
        "name": res.get("name", ""),
        "status": res.get("status", "pending"),
        "start_date": res.get("start_date", ""),
        "end_date": res.get("end_date", ""),
        "timeframe": res.get("timeframe", "5m"),
        "pair_group_id": str(res["pair_group_id"]),
        "strategy_id": str(res["strategy_id"]),
        "performances": [str(performance_id) for performance_id in res["performances"]],
    }

def get_backtesting_to_process(db: Database, id: str):
    pipeline = [
        {
            "$match": {
                "_id": ObjectId(id),
                # "status": "pending"
            }
        },
        {
            "$lookup": {
                "from": "pair_groups",
                "localField": "pair_group_id",
                "foreignField": "_id",
                "as": "pair_group"
            }
        },
        {
            "$lookup": {
                "from": "strategies",
                "localField": "strategy_id",
                "foreignField": "_id",
                "as": "strategy"
            }
        }
    ]
    res = list(db.get_collection("backtestings").aggregate(pipeline=pipeline))
    if not res:
        return None
    res = res[0]
    strategy = res.get('strategy', [{}])[0] if res.get('strategy') else {}
    db.get_collection("backtestings").update_one({
        "_id": ObjectId(id)
    }, {
        "$set": {
            "status": "processing"
        }
    })
    return {
        "id": str(res["_id"]),
        "start_date": res.get("start_date", ""),
        "end_date": res.get("end_date", ""),
        "timeframe": res.get("timeframe", "5m"),
        "pairs": res.get('pair_group', [{}])[0].get('pairs', []),
        "strategies": [{
            "_id": str(strategy.get("_id", "")),
            "name": strategy.get("name", ""),
        }] if strategy.get("_id") else [],
    }

def create_backtesting(db: Database, backtesting: dict):
    res = db.get_collection("backtestings").insert_one({
        "name": backtesting.get('name', ''),
        "status": "pending",
        "start_date": parser.parse(backtesting.get('start_date', '')).strftime('%Y-%m-%d'),
        "end_date": parser.parse(backtesting.get('end_date', '')).strftime('%Y-%m-%d'),
        "pair_group_id": ObjectId(backtesting.get('pair_group_id', '')),
        "strategy_id": ObjectId(backtesting.get('strategy_id', '')),
        "timeframe": backtesting.get('timeframe', '5m'),
        "performances": [],
    })
    return str(res.inserted_id)

def complete_backtesting(db: Database, id: str, performances: list[str]):
    res = db.get_collection("backtestings").update_one({
        "_id": ObjectId(id)
    }, {
        "$set": {
            "status": "completed",
            "performances": [ObjectId(performance_id) for performance_id in performances]
        }
    })
    return str(res.modified_count)

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

def add_backtesting_performances(db: Database, performances: list[dict]):
    res = db.get_collection("strategy_performances").insert_many([{
        "strategy_id": ObjectId(performance.get("strategy_id", "")),
        "strategy_name": performance.get("strategy_name", ""),
        "start_date": performance.get("start_date", ""),
        "end_date": performance.get("end_date", ""),
        "wins": performance.get("wins", 0),
        "losses": performance.get("losses", 0),
        "draws": performance.get("draws", 0),
        "total_trades": performance.get("total_trades", 0),
        "trade_per_day": performance.get("trade_per_day", 0),
        "profit": performance.get("profit", 0),
        "starting_balance": performance.get("starting_balance", 0),
        "final_balance": performance.get("final_balance", 0),
        "stop_loss": performance.get("stop_loss", 0),
        "avg_duration": performance.get("avg_duration", 0),
        "max_drawdown": performance.get("max_drawdown", 0),
        "profit_percentage": performance.get("profit_percentage", 0),
        "avg_profit_percentage": performance.get("avg_profit_percentage", 0),
        "win_rate": performance.get("win_rate", 0),
    } for performance in performances])
    return list(res.inserted_ids)


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
        "description": r["description"]
    } for r in list(res)]

def get_strategy_groups(db: Database):
    res = db.get_collection("strategy_groups").find()
    return [{
        "id": str(r["_id"]),
        "name": r["name"],
        "strategies": r["strategies"],
        "description": r["description"]
    } for r in list(res)]

def get_strategy_group(db: Database, id: str):
    res = db.get_collection("strategy_groups").find_one({"_id": ObjectId(id)})
    return {
        "id": str(res["_id"]),
        "name": res["name"],
        "strategies": res["strategies"],
        "description": res["description"],
    }

def create_strategy_group(db: Database, strategy_group: dict):
    res = db.get_collection("strategy_groups").insert_one({
        "name": strategy_group.get('name', ''),
        "strategies": strategy_group.get('strategies', []),
        "description": strategy_group.get('description', ''),
    })
    return {
        "id": str(res.inserted_id),
        "name": strategy_group.get('name', ''),
        "strategies": strategy_group.get('strategies', []),
        "description": strategy_group.get('description', ''),
    }

def update_strategy_group(db: Database, id: str, strategy_group: dict):
    res = db.get_collection("strategy_groups").update_one({
        '_id': ObjectId(id)
    }, {
        '$set': {
            'name': strategy_group.get('name', ''),
            'strategies': strategy_group.get('strategies', []),
            'description': strategy_group.get('description', ''),
        }
    }, upsert=True)
    return str(res.upserted_id)

def delete_strategy_group(db: Database, id: str):
    res = db.get_collection("strategy_groups").delete_one({"_id": ObjectId(id)})
    return str(res.deleted_count)

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

def add_strategy(db: Database, strategy: dict):
    res = db.get_collection("strategies").update_one({
        'name': strategy['name']
    }, {
        '$set': {
            'description': strategy['description'],
            'indicators': strategy.get('indicators', []),
            'example': strategy.get('example', ''),
            'explanation': strategy.get('explanation', ''),
        }
    }, upsert=True)
    return str(res.upserted_id)

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
    }, upsert=True)
    return str(res.upserted_id)

def query_ai(db: Database, llm: BaseChatModel, strategy_id, query: str, query_type: str, content: str = None):
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

def process_strategy(llm: BaseChatModel, strategy: str, max_retries=3):
    while max_retries > 0:
        class StrategyResponse(BaseModel):
            Status: str = Field(..., description="Status of the strategy logic code verification. CORRECT or INCORRECT.")
            Analyze: str = Field(..., description="Detailed analysis of the strategy.")
            Indicators: list[str] = Field(..., description="List of the indicators used in the strategy.")
            Explanation: str = Field(..., description="Detailed explanation of the strategy logic.")
            Example: str = Field(..., description="A very detailed example for the strategy logic.")
            Recommendation: str = Field(..., description="Recommendation list of the strategy improvement or Fixes if it is incorrect.")
            CodeReview: str = Field(..., description="Code review of the strategy code, and suggestions for improvement.")
        pydantic_parser = PydanticOutputParser(pydantic_object=StrategyResponse)
        prompt = PromptTemplate(template=dedent("""You are a FreqTrade expertise and can verify strategies code. You will receive a strategy code and you need to verify it. Analyze the strategy, understand the logic, and provide feedback.           
        ==== STRATEGY CODE ====
        {strategy}
        ==== END STRATEGY CODE ====
        {format_instructions}
        """), input_variables=["strategy"], partial_variables={'format_instructions': pydantic_parser.get_format_instructions()})
        chain = LLMChain(llm=llm, prompt=prompt, output_parser=pydantic_parser)
        try:
            result = chain.invoke(input={
                "strategy": strategy
            })
            return result.get('text', '')
        except Exception as e:
            print(e)
            max_retries -= 1
    return StrategyResponse(Status="INCORRECT", Analyze="", Indicators=[], Explanation="", Example="", Recommendation="", CodeReview="")

if __name__ == '__main__':
    import glob
    from db import get_ai
    import json
    strategies = [f for f in glob.glob('./ftrade/strategies/*.py')]
    with open(strategies[0], 'r', encoding='utf-8') as f:
        strategy_code = f.read()
        llm = get_ai('openai')
        result = process_strategy(llm, strategy_code)
        print(result)
        with open('test.json', 'w', encoding='utf-8') as f:
            json.dump(result.model_dump(), f)
    
