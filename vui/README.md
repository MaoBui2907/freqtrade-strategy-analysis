# VUI - Freqtrade Strategy Analysis Frontend

## New Backtest Features

### Overview
The backtest page now includes:
- ✅ **Backtest Configuration Form** with Strategy, Pair Group, Time Range, and Timeframe selection
- ✅ **Backtest History Table** showing all backtests with status indicators
- ✅ **Auto-refresh** every 5 minutes to update backtest statuses
- ✅ **Performance Dialog** to view detailed results for completed backtests
- ✅ **Real-time Status Updates** with visual indicators

### Features

#### 1. Create New Backtest
- Select a single strategy from dropdown
- Choose a pair group
- Set time range (Last 7 days, 30 days, 90 days, 6 months, 1 year)
- Pick timeframe (1m, 5m, 15m, 30m, 1h, 4h, 8h, 1d)
- Click "Run Backtest" to start

#### 2. Backtest History Table
- **Name**: Backtest name with strategy and pair group info
- **Status**: Visual status badges with icons
  - 🟡 Pending (waiting to start)
  - 🔵 Processing (running with spinner)
  - 🟢 Completed (finished successfully)
  - 🔴 Failed (error occurred)
- **Date Range**: Start and end dates
- **Timeframe**: Selected timeframe
- **Actions**: "View Performance" button (enabled only for completed backtests)

#### 3. Performance Dialog
When clicking "View Performance" on a completed backtest:
- **Performance Stats Cards**: Quick overview for each strategy
- **Detailed Performance Table**: Complete metrics including:
  - Strategy name
  - Wins, Losses, Draws
  - Total trades
  - Profit/Loss amounts
  - Profit percentages
  - Win rates

#### 4. Auto-refresh
- Automatically refreshes backtest list every 5 minutes
- Manual refresh button available
- Updates status in real-time

### API Integration
- Uses `strategy_id` instead of `strategy_group_id` for single strategy backtesting
- Supports all timeframes from 1m to 1d
- Real-time status polling for backtest progress
- Performance data fetching for completed backtests

### Getting Started

1. **Start the development server:**
   ```bash
   cd vui
   npm run dev
   ```

2. **Navigate to backtest page:**
   ```
   http://localhost:3000/backtest
   ```

3. **Create your first backtest:**
   - Fill out the form
   - Click "Run Backtest"
   - Watch the status in the table below

4. **View results:**
   - Wait for status to change to "Completed"
   - Click "View Performance" to see detailed results

### Technical Details

- **Auto-refresh**: 5-minute interval using `setInterval`
- **Status indicators**: Color-coded badges with animated spinners
- **Dialog system**: Modal overlay with performance data
- **Responsive design**: Works on desktop and mobile
- **Error handling**: Graceful error display and recovery

### Status Colors
- **Pending**: Yellow (`bg-yellow-900 text-yellow-300`)
- **Processing**: Blue (`bg-blue-900 text-blue-300`) with spinner
- **Completed**: Green (`bg-green-900 text-green-300`)
- **Failed**: Red (`bg-red-900 text-red-300`) 