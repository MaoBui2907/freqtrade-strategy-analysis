

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backtesting import router as backtesting_router
from pairs import router as pair_groups_router
from strategies import router as strategies_router


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

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", port=1998, reload=True)