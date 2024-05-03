

import hashlib
import json
import subprocess
import ast
import glob
from datetime import datetime, timedelta
import asyncio

def get_timerange(delta=2):
    today = datetime.today().strftime('%Y%m%d')
    delta_days_ago = (datetime.today() - timedelta(days=delta)).strftime('%Y%m%d')
    return f'{delta_days_ago}-{today}'

def get_strategy_name(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        root = ast.parse(f.read())
    
    for node in ast.walk(root):
        if isinstance(node, ast.ClassDef):
            return node.name
        
def hash_strategies(strategies):
    return hashlib.md5(''.join(strategies).encode()).hexdigest()

def download_data(delta=2):
    with open('./backtesting_pairs.txt', 'r') as f:
        pairlists = f.read().splitlines()
    
    p = ' '.join(pairlists)
    
    subprocess.run(f'freqtrade download-data --exchange binance --timerange {get_timerange(delta)} --timeframe 1m 5m 15m -p {p} --config ./user_data/backtest_config.json', shell=True)
    # subprocess.run(['freqtrade', 'download-data', '--exchange', 'binance', '--timerange', get_timerange(), '--timeframe', '5m', '-p', p])

class BacktestingService:
    def __init__(self, delta=2):
        self.queue = asyncio.Queue()
        with open('./backtesting_pairs.txt', 'r') as f:
            self.pairlists = f.read().splitlines()
        self.delta = delta

    async def run(self):
        self.result_file = set()
        strategies = glob.glob('./user_data/strategies/*.py')
        item_per_batch = 3
        worker_num = 3
        batches = [strategies[i:i+item_per_batch] for i in range(0, len(strategies), item_per_batch)]
        for batch in batches:
            self.queue.put_nowait(batch)
        
        tasks = [asyncio.create_task(self.worker(f'wn_{i}')) for i in range(worker_num)]
        await self.queue.join()
        
        for _ in range(worker_num):
            await self.queue.put(None)
        await asyncio.gather(*tasks)
        return self.result_file

    async def worker(self, name):
        while True:
            strategies = await self.queue.get()
            if strategies is None:
                break
            stdout, sterr = await self.backtest_batch(strategies, log_file=f'{name}_backtest.log')
            self.queue.task_done()

    async def backtest_batch(self, strategies, log_file='backtest.log'):
        # Create one thread and run sub process
        strategy_names = []
        for strategy in strategies:
            strategy_name = get_strategy_name(strategy)
            strategy_names.append(strategy_name)
        result_filename = f'{hash_strategies(strategy_names)}_{get_timerange(self.delta)}'
        command = f'freqtrade backtesting --strategy-list {" ".join(strategy_names)} --timerange {get_timerange(self.delta)} --timeframe 5m --config ./user_data/backtest_config.json --logfile ./user_data/backtest_logs/{log_file} -p {" ".join(self.pairlists)} --export=trades --export-file=./user_data/backtest_results/{result_filename}.json --cache none'
        process = await asyncio.create_subprocess_shell(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = await process.communicate()
        self.result_file.add(result_filename)
        return stdout, stderr

class AnalysisService:
    def __init__(self):
        self.backtest_results = [f for f in glob.glob('./user_data/backtest_results/*.json') if not f.endswith('.meta.json')]
        pass

    def run(self):
        results = []
        for result in self.backtest_results:
            with open(result, 'r') as f:
                data = json.load(f)
                if not data:
                    continue
                comparison = data.get('strategy_comparison', [])
                results.extend(comparison)
        pass


async def main():
    backtest_days = 10
    # download_data(backtest_days)
    backtester = BacktestingService(backtest_days)
    results = await backtester.run()
    analyzer = AnalysisService()
    results = analyzer.run()
    print(results)

if __name__ == '__main__':
    asyncio.run(main())