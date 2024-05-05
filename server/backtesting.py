
from fastapi import APIRouter, Depends

from db import get_db
from schemas import BacktestingRequest
import services as serv


router = APIRouter()

@router.get("", response_model=list[dict])
def get_backtestings(db=Depends(get_db)):
    res = serv.get_backtestings(db)
    return res

@router.get("/{id}/performances")
def get_backtesting_performance(id: str,db=Depends(get_db)):
    res = serv.get_backtesting_performance(db, id)
    return res

@router.post("")
def create_backtesting(backtesting: BacktestingRequest, db=Depends(get_db)):
    res = serv.create_backtesting(db, backtesting)
    return res