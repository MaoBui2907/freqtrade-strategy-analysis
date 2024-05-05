

import hashlib
import json
import subprocess
import ast
import glob
from datetime import datetime, timedelta
import asyncio

from db import DBService, PairGroup, Backtesting, StrategyPerformance
import logging

logging.basicConfig(level=logging.ERROR)

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

def get_pairlists():
    with open('./backtesting_pairs.txt', 'r') as f:
        return f.read().splitlines()

def get_strategies():
    strategies = glob.glob('./user_data/strategies/*.py')
    return [get_strategy_name(strategy) for strategy in strategies]

def download_data(delta=2, pairlists=get_pairlists()):
    p = ' '.join(pairlists)
    subprocess.run(f'freqtrade download-data --exchange binance --timerange {get_timerange(delta)} --timeframe 1m 5m 15m -p {p} --config ./user_data/backtest_config.json', shell=True)
    # subprocess.run(['freqtrade', 'download-data', '--exchange', 'binance', '--timerange', get_timerange(), '--timeframe', '5m', '-p', p])

class BacktestingService:
    def __init__(self, strategies, pairlists=get_pairlists(), delta=2, item_per_batch=3, worker_num=3):
        self.queue = asyncio.Queue()
        self.strategies = strategies
        self.pairlists = pairlists
        self.delta = delta
        self.item_per_batch = item_per_batch
        self.worker_num = worker_num

    async def run(self):
        self.result_file = set()
        batches = [self.strategies[i:i+self.item_per_batch] for i in range(0, len(self.strategies), self.item_per_batch)]
        for batch in batches:
            self.queue.put_nowait(batch)
        
        tasks = [asyncio.create_task(self.worker(f'wn_{i}')) for i in range(self.worker_num)]
        await self.queue.join()
        
        for _ in range(self.worker_num):
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
        for strategy_name in strategies:
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
                summary = data.get('strategy', {})
                
                strategies = summary.keys()
                for strategy in strategies:
                    d = summary.get(strategy, {})
                    results.append({
                        'key': strategy,
                        'details': d,
                    })
        return results


async def main():
    backtest_days = 15
    pairlist = get_pairlists()
    strategies = get_strategies()
    start_date = (datetime.today() - timedelta(days=backtest_days)).isoformat()
    end_date = datetime.today().isoformat()
    db = DBService()
    s = list(db.filter_strategies(strategies))
    p = PairGroup(name='backtesting_pairs', pairs=pairlist)
    p = db.add_pair_group(p)
    print('Downloading data...')
    # download_data(backtest_days)
    print('Data downloaded')

    backtester = BacktestingService(strategies, pairlist, backtest_days, 5, 5)
    b = Backtesting(
        name='backtesting',
        start_date=start_date,
        end_date=end_date,
        pair_group_id=p.inserted_id,
        strategies=[strategy['_id'] for strategy in list(s)],
        status='pending'
    )
    print(f'Backtesting for {len(strategies)} strategies...')
    b = db.add_backtesting(b)
    results = await backtester.run()
    analyzer = AnalysisService()
    results = analyzer.run()
    p = []
    for r in results:
        sid = None
        for strategy in list(s):
            if strategy['name'] == r['key']:
                sid = strategy['_id']
                break
        _details = r['details']
        _pid = db.add_strategy_performance(StrategyPerformance(
                strategy_id=sid,
                strategy_name=r['key'],
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
        p.append(_pid.inserted_id)
    # print(p)
    r = db.add_backtesting_result(backtesting_id=b.inserted_id, performances=p)
    # print(results)

if __name__ == '__main__':
    asyncio.run(main())