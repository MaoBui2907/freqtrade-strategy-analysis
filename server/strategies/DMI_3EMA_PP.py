# --- Do not remove these libs ---
from freqtrade.strategy.interface import IStrategy
from pandas import DataFrame
import talib.abstract as ta
import pandas as pd  # noqa

pd.options.mode.chained_assignment = None  # default='warn'
import technical.indicators as ftt

# --------------------------------
# NOTE: The strategy should only work with static pairs with big volume.

class DMI_3EMA_PP(IStrategy):
    params = {
        "adx_period": 14,
        "ema_period": 14,
        "pivot_timeframe": '4h'
    }
    # Optimal timeframe for the strategy
    timeframe = "5m"
    startup_candle_count = params["adx_period"]
    process_only_new_candles = False

    trailing_stop = False
    # trailing_stop_positive = 0.002
    # trailing_stop_positive_offset = 0.025
    # trailing_only_offset_is_reached = True

    use_exit_signal = True
    exit_profit_only = False
    ignore_roi_if_entry_signal = False

    plot_config = {
        "main_plot": {
            "pivot": {"color": "red"},
            "r1": {"color": "orange"},
            "s1": {"color": "orange"},
            "r2": {"color": "orange"},
            "s2": {"color": "orange"},
            "r3": {"color": "orange"},
            "s3": {"color": "orange"},
            "high_ema": {"color": "green"},
            "low_ema": {"color": "green"},
            "close_ema": {"color": "white"},
        },
        "subplots": {
            "adx": {"color": "yellow"},
            "positive_di": {"color": "orange"},
            "negative_di": {"color": "blue"},
        },
    }

    def informative_pairs(self):
        pairs = self.dp.current_whitelist()
        informative_pairs = [(pair, self.params["pivot_timeframe"]) for pair in pairs]
        return informative_pairs

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        if not self.dp:
            return dataframe
        informative_tf = self.params["pivot_timeframe"]
        pair = metadata['pair']
        informative = self.dp.get_pair_dataframe(pair, timeframe=informative_tf)
        if informative is None:
            return dataframe
        # Populate Pivot Points
        pivot_df = ftt.pivots_points(informative, timeperiod=1, levels=3)
        dataframe = pd.concat([dataframe, pivot_df], axis=1)

        # Populate trend indicators
        dataframe['positive_di'] = ta.PLUS_DI(dataframe, timeperiod=self.params["adx_period"])
        dataframe['negative_di'] = ta.MINUS_DI(dataframe, timeperiod=self.params["adx_period"])
        dataframe['adx'] = ta.ADX(dataframe, timeperiod=self.params["adx_period"])

        # Populate EMA
        dataframe['high_ema'] = ta.EMA(dataframe['high'], timeperiod=self.params["ema_period"])
        dataframe['low_ema'] = ta.EMA(dataframe['low'], timeperiod=self.params["ema_period"])
        dataframe['close_ema'] = ta.EMA(dataframe['close'], timeperiod=self.params["ema_period"])
        
        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:        
        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        return dataframe
