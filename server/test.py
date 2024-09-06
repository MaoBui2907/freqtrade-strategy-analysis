
from celery_service import fetch_strategies, download_data, start_backtesting_batch
from datetime import datetime

if __name__ == '__main__':
    # add.delay(4, 4)
    # fetch_strategies.delay()
    # download_data.delay(["BTC/USDT:USDT", "ETH/USDT:USDT"], datetime(2024, 7, 1), datetime(2024, 8, 20)) 
    start_backtesting_batch.delay("66dab119243c13c90c705c25")