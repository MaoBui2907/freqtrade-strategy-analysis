git clone -b migrate-2024 git@github.com:MaoBui2907/freqtrade-strategies.git freqtrade-strategies
cd freqtrade-strategies/strategies
rm -rf ../../ft_userdata/user_data/strategies/*
# copy all strategies recursively end with .py
find . -name "*.py" -exec cp {} ../../ft_userdata/user_data/strategies/ \;
cd ../../
rm -rf freqtrade-strategies
cd ft_userdata
pipenv run python fetch_strategies.py
cd ../