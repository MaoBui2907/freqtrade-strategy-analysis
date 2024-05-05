

from celery import Celery
import asyncio
import os

MONGODB_USER = os.getenv('MONGODB_USER', 'root')
MONGODB_PASS = os.getenv('MONGODB_PASS', 'root')
print(MONGODB_USER, MONGODB_PASS)
MONGODB_URI = f'mongodb://{MONGODB_USER}:{MONGODB_PASS}@localhost:27017'
app = Celery('app', broker="redis://localhost:6379/0", backend='redis://localhost:6379/1')

@app.task()
def process_backtesting():
    from ft_userdata.process_backtesting import main
    asyncio.run(main())