# Data Fetching Scripts

This document explains how to use the data fetching scripts to populate your database with trading pairs and strategies.

## Overview

We have created scripts to automatically fetch and populate:
- **Trading Pairs**: From remotepairlist.com (Binance futures pairs)
- **Trading Strategies**: From GitHub repository (freqtrade-strategies)

## Prerequisites

- Python 3.8+
- MongoDB connection (or the scripts will use in-memory mock database)
- Git (for strategy fetching)
- Internet connection

## Scripts Available

### 1. Fetch Trading Pairs

Fetches 430+ trading pairs from remotepairlist.com and creates sample pair groups.

**Python Script:**
```bash
cd server
python fetch_pairs_from_remote.py
```

**PowerShell Script (Windows):**
```powershell
.\run_fetch_pairs.ps1
```

**Bash Script (Linux/Mac):**
```bash
./run_fetch_pairs.sh
```

### 2. Fetch Trading Strategies

Clones the freqtrade-strategies repository and extracts 436+ strategies with metadata.

**Python Script:**
```bash
cd server
python fetch_strategies_from_github.py
```

**PowerShell Script (Windows):**
```powershell
.\run_fetch_strategies.ps1
```

**Bash Script (Linux/Mac):**
```bash
./run_fetch_strategies.sh
```

## What Gets Fetched

### Trading Pairs
- **Source**: https://remotepairlist.com (Binance futures, sorted by volume)
- **Count**: ~430 pairs
- **Format**: Converts from futures format (BTC/USDT:USDT) to spot format (BTC/USDT)
- **Groups Created**:
  - Major Cryptocurrencies (BTC, ETH, BNB, etc.)
  - DeFi Tokens (UNI, AAVE, COMP, etc.)
  - Layer 1 Blockchains (SOL, AVAX, DOT, etc.)
  - Meme Coins (DOGE, SHIB, PEPE, etc.)
  - High Volume Pairs (top 20 by volume)

### Trading Strategies
- **Source**: https://github.com/MaoBui2907/freqtrade-strategies (migrate-2024 branch)
- **Count**: ~436 strategies
- **Extracted Data**:
  - Strategy name and filename
  - Description and explanation
  - Technical indicators used
  - Full strategy code content
- **Groups Created**:
  - Trend Following Strategies
  - Mean Reversion Strategies
  - Scalping Strategies
  - Breakout Strategies
  - Multi-Timeframe Strategies
  - Machine Learning Strategies
  - All Strategies (top 50)

## Database Storage

### Collections Created/Updated:
- `pairs` - Individual trading pairs
- `pair_groups` - Groups of related pairs
- `strategies` - Individual trading strategies
- `strategy_groups` - Groups of related strategies

### Data Format:

**Pair Document:**
```json
{
  "_id": "ObjectId",
  "name": "BTC/USDT",
  "description": "Bitcoin to Tether"
}
```

**Strategy Document:**
```json
{
  "_id": "ObjectId",
  "name": "RSIStrategy",
  "filename": "rsi_strategy.py",
  "description": "RSI-based trading strategy",
  "explanation": "Uses RSI indicator to identify overbought/oversold conditions",
  "indicators": ["RSI", "SMA", "EMA"],
  "example": "Buy when RSI < 30, Sell when RSI > 70",
  "content": "# Full Python code here..."
}
```

## Usage Examples

### Fetch Both Pairs and Strategies:
```bash
# Fetch pairs first
python server/fetch_pairs_from_remote.py

# Then fetch strategies
python server/fetch_strategies_from_github.py
```

### PowerShell (Windows):
```powershell
# Fetch pairs
.\run_fetch_pairs.ps1

# Fetch strategies  
.\run_fetch_strategies.ps1
```

## API Endpoints

After running the scripts, data will be available through these API endpoints:

- `GET /pair-groups/pairs` - List all pairs
- `GET /pair-groups` - List pair groups
- `GET /strategies` - List all strategies
- `GET /strategy-groups` - List strategy groups

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Scripts will automatically fallback to in-memory mock database
   - Check your MongoDB connection string in environment variables

2. **Git Clone Failed**
   - Ensure Git is installed and accessible
   - Check internet connection
   - Repository might be temporarily unavailable

3. **Permission Errors**
   - Run with appropriate permissions
   - On Windows, run PowerShell as Administrator if needed

4. **Network Issues**
   - Check internet connection
   - Some corporate networks might block GitHub or external APIs

### Logs and Debug:
- Scripts provide detailed console output
- Errors are logged with specific error messages
- Progress indicators show current processing status

## Automation

You can set up these scripts to run periodically to keep data fresh:

### Cron Job (Linux/Mac):
```bash
# Update pairs daily at 2 AM
0 2 * * * /path/to/project/run_fetch_pairs.sh

# Update strategies weekly on Sunday at 3 AM  
0 3 * * 0 /path/to/project/run_fetch_strategies.sh
```

### Task Scheduler (Windows):
Create scheduled tasks to run the PowerShell scripts at desired intervals.

## Notes

- Pair data updates frequently (market-driven)
- Strategy repository updates less frequently
- Scripts handle duplicate data by clearing and re-inserting
- All operations are idempotent (safe to run multiple times)
- Temporary directories are automatically cleaned up 