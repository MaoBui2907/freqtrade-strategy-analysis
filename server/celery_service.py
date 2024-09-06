from celery import Celery
import os
from datetime import datetime, timedelta
from db import get_db, get_ai
from services import add_strategy, process_strategy, add_pair, get_backtesting_to_process, add_backtesting_performances, complete_backtesting

celery_app = Celery(
    "celery_service",
    broker=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.environ.get("REDIS_URL", "redis://localhost:6379/0")
)

@celery_app.task
def add(x, y):
    print(f"Adding {x} + {y}")
    res = x + y
    print(f"Result: {res}")
    with open("result.txt", "w") as f:
        f.write(str(res))
    return res

@celery_app.task
def download_data(pairlist: list[str], start_date: datetime, end_date: datetime, timeframe: str = '5m'):
    print(f"Downloading data for {pairlist} from {start_date} to {end_date}")
    import os
    from textwrap import dedent
    timerange = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
    pairs = " ".join([pair for pair in pairlist])
    log_filepath = "./ftrade/logs/download_data.log"
    data_folder = "./ftrade/data"
    command = dedent(f"""
        freqtrade download-data --exchange binance --timerange {timerange} 
        --timeframe {timeframe} 1d -p {pairs} --config ./ftrade/config.json
        --include-inactive-pairs --trading-mode futures --log-file {log_filepath} --datadir {data_folder} --userdir ./ftrade
    """).strip().replace("\n", " ")
    print(f"Running command: {command}")
    res = os.system(command)
    print(f"Result: {res}")
    return "Data downloaded"

@celery_app.task
def fetch_pairs():
    print("Fetching pairs")
    import requests
    FETCH_URL = 'https://remotepairlist.com/?q=8fe76912e37c98b6'

    db = get_db()
    try:
        res = requests.get(FETCH_URL)
        res = res.json()
        res = res.get('pairs', [])
    except Exception as e:
        return {"error": f"Failed to fetch data from remote server {e}"}
    for pair in res:
        p = {
            'name': pair,
            'description': 'Description of ' + pair
        }
        add_pair(db, p)
    return 'Pairs fetched'

@celery_app.task
def fetch_strategies():
    print("Fetching strategies")
    import os
    import glob
    from textwrap import dedent
    import shutil
    result_folder = f'./ftrade/strategies_{str(datetime.today().strftime("%Y%m%d"))}/'
    target_folder = './ftrade/strategies/'
    # Create the result folder
    if not os.path.exists(result_folder) or not os.listdir(result_folder):
        os.makedirs(result_folder, exist_ok=True)
        temp_folder = './ftrade/temp/'
        clone_command = dedent(f"""
            git clone -b {os.environ.get('STRATEGIES_BRANCH')} {os.environ.get('STRATEGIES_REPO')} {temp_folder}
        """).strip().replace("\n", " ")
        print(f"Running command: {clone_command}")
        res = os.system(clone_command)
        os.system(f'cp -r {temp_folder}strategies/* {result_folder}')
        os.system(f"rm -rf {temp_folder}")
        print(f"Result: {res}")
    
    shutil.rmtree(target_folder, ignore_errors=True)
    os.makedirs(target_folder, exist_ok=True)
    os.system(f"cp -r {result_folder}* {target_folder}")
    # shutil.rmtree(result_folder, ignore_errors=True)
    
    strategy_files = [f for f in glob.glob(f'{target_folder}*.py')]
    db = get_db()
    llm = get_ai('openai')
    print(f"Found {len(strategy_files)} strategies")
    for i, strategy_file in enumerate(strategy_files):
        with open(strategy_file, 'r', encoding='utf-8') as f:
            strategy_code = f.read()
            print(f"Processing strategy {i}: {strategy_file}")
            result = process_strategy(llm, strategy_code)
            result = result.model_dump()
            strategy = {
                "name": os.path.basename(strategy_file).replace(".py", ""),
                "filename": os.path.basename(strategy_file),
                "indicators": result.get('Indicators', []),
                "explanation": result.get('Explanation', ''),
                "example": result.get('Example', ''),
                "description": result.get('Analyze', ''),
                "analysis": result
            }
            print(f"Adding strategy: {strategy.get('name')}")
            add_strategy(db, strategy)
    return "Strategies fetched"

def analyze_results(backtesting_id: str):
    import glob
    import json
    results = []
    result_folder = f'./ftrade/backtest_results/backtesting_{backtesting_id}'
    result_files = [f for f in glob.glob(f'{result_folder}*.json') if not f.endswith('.meta.json')]
    print(f"Found {len(result_files)} result files")
    for result in result_files:
        with open(result, 'r') as f:
            data = json.load(f)
            if not data:
                continue
            summary = data.get('strategy', {})
            
            strategies = summary.keys()
            print(f"Found {len(strategies)} strategies")
            for strategy in strategies:
                d = summary.get(strategy, {})
                results.append({
                    'key': strategy,
                    'details': d,
                })
    # Remove the result files
    # for f in glob.glob(f'{result_folder}*'):
    #     os.remove(f)
    return results

def run_backtest(id: str, strategies: list[str], pairs: list[str], start_date: datetime, end_date: datetime, timeframe: str):
    print(f"Running backtesting for {strategies} on {pairs} from {start_date} to {end_date} with timeframe {timeframe}")
    from textwrap import dedent
    strategies = " ".join([strategy for strategy in strategies])
    pairs = " ".join([pair for pair in pairs])
    timerange = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
    result_file = f"./ftrade/backtest_results/backtesting_{id}.json"
    log_file = f"./ftrade/logs/backtesting_{id}.log"
    command = dedent(f"""
        freqtrade backtesting --strategy-list {strategies} --pairs {pairs} --datadir ./ftrade/data
        --timerange {timerange} --backtest-filename {result_file} --logfile {log_file}
        --export trades --timeframe {timeframe} --config ./ftrade/config.json --userdir ./ftrade
    """).strip().replace("\n", " ")
    print(f"Running command: {command}")
    res = os.system(command)
    os.remove(log_file)
    print(f"Result: {res}")

@celery_app.task
def start_backtesting_batch(backtesting_id: str):
    print(f"Running backtesting for {backtesting_id}")
    from dateutil import parser
    db = get_db()
    backtesting = get_backtesting_to_process(db, backtesting_id)
    if not backtesting:
        return "Backtesting not found"
    if backtesting.get('status') == 'completed':
        return "Backtesting already completed"
    pairs = backtesting.get('pairs', [])
    strategies = backtesting.get('strategies', [])
    start_date = parser.isoparse(backtesting.get('start_date')) - timedelta(days=2)
    end_date = parser.isoparse(backtesting.get('end_date')) + timedelta(days=1)
    timeframe = backtesting.get('timeframe', '5m')
    download_data(pairs, start_date, end_date, timeframe)
    run_backtest(backtesting_id, [strategy['name'] for strategy in strategies], pairs, start_date, end_date, timeframe)
    result = analyze_results(backtesting_id)
    performances = []
    for performance in result:
        for strategy in strategies:
            if strategy['name'] == performance.get('key'):
                performances.append({
                    'strategy_id': strategy.get('_id'),
                    'strategy_name': strategy.get('name'),
                    'start_date': start_date.strftime('%Y-%m-%d'),
                    'end_date': end_date.strftime('%Y-%m-%d'),
                    'wins': performance.get('details').get('wins', 0),
                    'losses': performance.get('details').get('losses', 0),
                    'draws': performance.get('details').get('draws', 0),
                    'total_trades': performance.get('details').get('total_trades', 0),
                    'trade_per_day': performance.get('details').get('trades_per_day', 0),
                    'profit': performance.get('details').get('profit_total_abs', 0),
                    'starting_balance': performance.get('details').get('starting_balance', 0),
                    'stop_loss': performance.get('details').get('stoploss', 0),
                    'avg_duration': performance.get('details').get('holding_avg_s', 0),
                    'final_balance': performance.get('details').get('final_balance', 0),
                    'max_drawdown': performance.get('details').get('max_drawdown_abs', 0),
                    'profit_percentage': performance.get('details').get('profit_total', 0) * 100,
                    'avg_profit_percentage': performance.get('details').get('profit_mean', 0) * 100,
                    'win_rate': performance.get('details').get('winrate', 0),
                })
                break
    if not performances:
        return "No performances found"
    performance_ids = add_backtesting_performances(db, performances)
    print(f"Completed backtesting for {backtesting_id}: {performance_ids}")
    complete_backtesting(db, backtesting_id, performance_ids)
    return "Backtesting completed"