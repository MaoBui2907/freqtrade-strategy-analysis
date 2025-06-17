

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.backtesting import router as backtesting_router
from routes.pairs import router as pair_groups_router
from routes.strategies import router as strategies_router
from routes.strategy_groups import router as strategy_groups_router

app = FastAPI(
    debug=True,
    title="Freqtrade API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(backtesting_router, prefix="/backtestings", tags=["backtestings"])
app.include_router(pair_groups_router, prefix="/pair-groups", tags=["pair groups"])
app.include_router(strategies_router, prefix="/strategies", tags=["strategies"])
app.include_router(strategy_groups_router, prefix="/strategy-groups", tags=["strategy groups"])

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", port=1998, reload=True)