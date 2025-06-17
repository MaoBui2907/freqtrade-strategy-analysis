#!/bin/bash

# Freqtrade Strategies Fetcher Script
# Fetches trading strategies from GitHub repository and inserts into database

echo "=== Freqtrade Strategies Fetcher ==="
echo "Starting strategies fetch process..."

# Change to server directory
cd server

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install required dependencies if needed
echo "Checking dependencies..."
pip install requests pymongo python-dotenv

# Run the fetch script
echo "Running strategies fetch script..."
python fetch_strategies_from_github.py

echo "Strategies fetch process completed!"