
from services.celery_service import start_backtesting_batch, run_backtest
from datetime import datetime

if __name__ == '__main__':
    # add.delay(4, 4)
    # fetch_strategies.delay()
    # download_data.delay(["BTC/USDT:USDT", "ETH/USDT:USDT"], datetime(2024, 7, 1), datetime(2024, 8, 20)) 
    start_backtesting_batch("6851166039c6df3d9bc29ac2")
    # run_backtest("6851166039c6df3d9bc29ac2", ["CombinedBinHAndCluc"], ["BTC/USDT:USDT", "ETH/USDT:USDT"], datetime(2025, 6, 8), datetime(2025, 6, 10), "5m")