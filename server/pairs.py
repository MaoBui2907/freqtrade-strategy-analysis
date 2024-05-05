

from fastapi import APIRouter, Depends

from db import get_db
from schemas import PairGroupRequest
import services as srv


router = APIRouter()

@router.get("")
def get_pair_groups(db=Depends(get_db)):
    res = srv.get_pair_groups(db)
    return res


@router.post("")
def create_pair_group(pair_group: PairGroupRequest, db=Depends(get_db)):
    res = srv.create_pair_group(db, pair_group)
    return res


@router.delete("/{pair_group_id}")
def get_pair_group(pair_group_id: str, db=Depends(get_db)):
    res = srv.delete_pair_group(db, pair_group_id)
    return res

@router.get("/pairs")
def get_pairs(db=Depends(get_db)):
    res = srv.get_pairs(db)
    return res