from fastapi import APIRouter, Depends
from db import get_db
import services.services as srv

router = APIRouter()


@router.get("")
def get_strategy_groups(db = Depends(get_db)):
    return srv.get_strategy_groups(db)

@router.get("/{id}")
def get_strategy_group(db = Depends(get_db), *, id: str):
    return srv.get_strategy_group(db, id)

@router.post("")
def create_strategy_group(streategy_group: dict, db = Depends(get_db)):
    return srv.create_strategy_group(db, streategy_group)

@router.put("/{id}")
def update_strategy_group(id: str, streategy_group: dict, db = Depends(get_db)):
    return srv.update_strategy_group(db, id, streategy_group)

@router.delete("/{id}")
def delete_strategy_group(id: str, db = Depends(get_db)):
    return srv.delete_strategy_group(db, id)