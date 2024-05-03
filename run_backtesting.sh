cd ft_userdata
rm -rf user_data/backtest_results/*
rm -rf user_data/backtest_logs/*
pipenv run python backtesting.py
cd ../