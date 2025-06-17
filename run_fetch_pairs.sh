#!/bin/bash

# Freqtrade Pairs Fetcher Script
# Fetches trading pairs from remotepairlist.com and inserts into database

echo "=== Freqtrade Pairs Fetcher ==="
echo "Starting pairs fetch process..."

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
echo "Running pairs fetch script..."
python fetch_pairs_from_remote.py

echo "Pairs fetch process completed!" 