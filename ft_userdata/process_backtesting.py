import asyncio
from datetime import datetime
import glob
import hashlib
import json
import os
import re
from textwrap import dedent
from time import sleep
import uuid
from dateutil.parser import parse
import subprocess
import shutil
from db import DBService, StrategyPerformance
from multiprocessing import Process

class DataDownloader:
    def __init__(self, pairlist, start_date: datetime, end_date: datetime):
        self.pairlist = pairlist
        self.start_date = start_date
        self.end_date = end_date
        self.config_filepath = "./user_data/backtest_config.json"
        self.data_folder = "./user_data/data"
        self.log_filepath = "./user_data/logs/download_data.log"
        self.queue = asyncio.Queue()
        pass

    def build_download_command(self):
        timerange = f"{self.start_date.strftime('%Y%m%d')}-{self.end_date.strftime('%Y%m%d')}"
        pairs = " ".join([pair for pair in self.pairlist])

        command = dedent(f"""
            freqtrade download-data --exchange binance --timerange {timerange} 
            --timeframe 1m 5m 15m -p {pairs} --config ./user_data/backtest_config.json
            --include-inactive-pairs --trading-mode futures --log-file {self.log_filepath} --datadir {self.data_folder}
        """).strip().replace("\n", " ")
        command = re.sub(r"\s+", " ", command)
        return command
    
    def download_data(self):
        command = self.build_download_command()
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
        process.wait()
        pass

class ProcessBacktestingService:
    def __init__(self, pairlist, strategies, start_date: datetime, end_date: datetime):
        self.strategies = strategies
        self.pairlist = pairlist
        self.start_date = start_date
        self.end_date = end_date
        self.queue = asyncio.Queue()
        self.results = []
        pass

    async def worker(self, name):
        result_folder = f'./user_data/backtest_results/{name}_{str(uuid.uuid4())}/'
        # Create the result folder
        os.makedirs(result_folder, exist_ok=True)
        while True:
            strategies = await self.queue.get()
            if strategies is None:
                break
            command = self.build_backtesting_command(strategies, name, result_folder)

            process = await asyncio.create_subprocess_shell(
                command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            await process.communicate()
            self.queue.task_done()
        # Analyze the results
        result_files = [f for f in glob.glob(f'{result_folder}/*.json') if not f.endswith('.meta.json')]
        for result in result_files:
            with open(result, 'r') as f:
                data = json.load(f)
                if not data:
                    continue
                summary = data.get('strategy', {})
                
                strategies = summary.keys()
                for strategy in strategies:
                    d = summary.get(strategy, {})
                    self.results.append({
                        'key': strategy,
                        'details': d,
                    })
        # Remove the result folder
        shutil.rmtree(result_folder)
        pass

    def md5_hash(self, strategies: list[str]):
        return hashlib.md5("".join(strategies).encode()).hexdigest()

    def build_backtesting_command(self, strategies: list[str], worker_name: str, result_folder: str):
        logfilepath = f'./user_data/backtest_logs/{worker_name}_backtesting_{datetime.now().strftime("%Y%m%d%H%M%S")}.log'        
        result_filepath = f"{result_folder}/result.json"
        config_filepath = "./user_data/backtest_config.json"

        strategies = " ".join([strategy for strategy in strategies])
        pairs = " ".join([pair for pair in self.pairlist])
        time_range = (
            f"{self.start_date.strftime('%Y%m%d')}-{self.end_date.strftime('%Y%m%d')}"
        )

        command = dedent(f"""freqtrade backtesting --strategy-list {strategies} --pairs {pairs} 
            --timerange {time_range} --export trades --backtest-filename {result_filepath} --logfile {logfilepath}
            --config {config_filepath} --timeframe 5m --cache none
        """).strip().replace("\n", " ")
        command = re.sub(r"\s+", " ", command)
        return command

    async def run(self):
        batch_size = 1
        worker_num = 1
        batches = [self.strategies[i : i + batch_size] for i in range(0, len(self.strategies), batch_size)]
        for batch in batches:
            self.queue.put_nowait(batch)
        tasks = [asyncio.create_task(self.worker(f'worker_{i}')) for i in range(worker_num)]
        await self.queue.join()
        for _ in range(worker_num):
            await self.queue.put(None)
        await asyncio.gather(*tasks)
        return self.results

async def process_backtesting(db: DBService, backtesting):
    try: 
        db.update_backtesting_status(str(backtesting.get('_id')), "running")
        pairgroup = db.get_pair_group(str(backtesting.get('pair_group_id')))
        pairlist = pairgroup.get('pairs', [])

        strategy_ids = backtesting.get('strategies', [])
        strategies_r = list(db.filter_strategies_by_id([str(i) for i in strategy_ids]))
        strategies = [strategy.get('name') for strategy in strategies_r]

        start_date = parse(backtesting.get('start_date'))
        end_date = parse(backtesting.get('end_date'))

        downloader = DataDownloader(pairlist, start_date, end_date)
        downloader.download_data()

        backtesting_service = ProcessBacktestingService(pairlist, strategies, start_date, end_date)
        results = await backtesting_service.run()
        
        performances = []
        for result in results:
            sid = None
            for strategy in strategies_r:
                if strategy['name'] == result['key']:
                    sid = strategy['_id']
                    break
            _details = result['details']
            _pid = db.add_strategy_performance(StrategyPerformance(   
                    strategy_id=sid,
                    strategy_name=result['key'],
                    start_date=start_date,
                    end_date=end_date,
                    wins=_details['wins'],
                    losses=_details['losses'],
                    draws=_details['draws'],
                    total_trades=_details['total_trades'],
                    trade_per_day=_details['trades_per_day'],
                    profit=_details['profit_total'],
                    final_balance=_details['final_balance'],
                    max_drawdown=_details['max_drawdown_abs'],
                    profit_percentage=_details['profit_factor'],
                    win_rate=_details['winrate'],
                    details=_details
                ))
            performances.append(_pid.inserted_id)
        db.add_backtesting_result(backtesting_id=str(backtesting.get('_id')), performances=performances)
    except Exception as e:
        db.update_backtesting_status(str(backtesting.get('_id')), "failed")
        print(f"Failed to process backtesting {backtesting.get('_id')}: {e}")

async def main():
    db = DBService()
    backtestings  = list(db.get_pending_backtestings_to_process())
    if not backtestings:
        return
    
    ####################
    # TEST CODE #
    # test_b = backtestings[0]    
    # await process_backtesting(db, test_b)
    # END TEST CODE #
    ####################
    tasks = []
    for backtesting in backtestings:
        task = asyncio.create_task(process_backtesting(db, backtesting))
        tasks.append(task)
    await asyncio.gather(*tasks)

def loop_main():
    asyncio.run(main())

if __name__ == "__main__":
    print("Starting backtesting process...")
    while True:
        p = Process(target=loop_main)
        p.start()
        sleep(5)
