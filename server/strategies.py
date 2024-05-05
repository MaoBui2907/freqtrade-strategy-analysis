
from fastapi import APIRouter, Depends
from db import get_db, get_ai
import services as srv
from schemas import AIQueryRequest, StrategyUpdateRequest

router = APIRouter()

@router.get("")
def get_strategies(db=Depends(get_db)):
    res = srv.get_strategies(db)
    return res

@router.get("/{strategyId}")
def get_strategy(strategyId: str, db=Depends(get_db)):
    res = srv.get_strategy(db, strategyId)
    return res

@router.put("/{strategyId}")
def save_strategy(strategyId: str, strategy: StrategyUpdateRequest, db=Depends(get_db)):
    res = srv.save_strategy(db, strategyId, strategy.model_dump())
    return res

@router.post("/{strategyId}/ai-query")
def ai_query(strategyId: str, query_request: AIQueryRequest, db=Depends(get_db), llm=Depends(get_ai)):
    res = srv.query_ai(db, llm, strategyId, query_request.query, query_request.query_type, query_request.content)
    return res