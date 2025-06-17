#!/usr/bin/env python3
"""
Script to fetch trading pairs from remotepairlist.com and insert into database
"""

import sys
import os
import requests
import json
from typing import List, Dict

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import get_db

def fetch_pairs_from_remote() -> List[str]:
    """
    Fetch pairs from remotepairlist.com
    Returns list of pair names
    """
    url = "https://remotepairlist.com/?r=1&filter=noprefilter&sort=exchange_7day_volume&exchange=binance&market=futures&stake=USDT&limit=500&exchange=binance&show=1"
    
    try:
        print("Fetching pairs from remotepairlist.com...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        pairs = data.get('pairs', [])
        
        # Convert from futures format (BTC/USDT:USDT) to spot format (BTC/USDT)
        spot_pairs = []
        for pair in pairs:
            if ':USDT' in pair:
                spot_pair = pair.replace(':USDT', '')
                spot_pairs.append(spot_pair)
            else:
                spot_pairs.append(pair)
        
        # Remove duplicates and sort
        unique_pairs = sorted(list(set(spot_pairs)))
        
        print(f"Successfully fetched {len(unique_pairs)} unique pairs")
        return unique_pairs
        
    except requests.RequestException as e:
        print(f"Error fetching pairs from remote: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

def generate_pair_description(pair_name: str) -> str:
    """
    Generate description for a trading pair
    """
    if '/' in pair_name:
        base, quote = pair_name.split('/', 1)
        
        # Common crypto descriptions
        crypto_names = {
            'BTC': 'Bitcoin',
            'ETH': 'Ethereum', 
            'BNB': 'Binance Coin',
            'XRP': 'Ripple',
            'ADA': 'Cardano',
            'DOT': 'Polkadot',
            'LINK': 'Chainlink',
            'LTC': 'Litecoin',
            'BCH': 'Bitcoin Cash',
            'ETC': 'Ethereum Classic',
            'UNI': 'Uniswap',
            'AAVE': 'Aave',
            'COMP': 'Compound',
            'MKR': 'Maker',
            'SNX': 'Synthetix',
            'DOGE': 'Dogecoin',
            'SHIB': 'Shiba Inu',
            'MATIC': 'Polygon',
            'SOL': 'Solana',
            'AVAX': 'Avalanche',
            'ATOM': 'Cosmos',
            'FTM': 'Fantom',
            'ALGO': 'Algorand',
            'VET': 'VeChain',
            'ICP': 'Internet Computer',
            'THETA': 'Theta',
            'FIL': 'Filecoin',
            'TRX': 'TRON',
            'EOS': 'EOS',
            'XTZ': 'Tezos',
            'NEAR': 'NEAR Protocol',
            'SAND': 'The Sandbox',
            'MANA': 'Decentraland',
            'CRV': 'Curve DAO Token',
            'USDT': 'Tether',
            'USDC': 'USD Coin'
        }
        
        base_name = crypto_names.get(base, base)
        quote_name = crypto_names.get(quote, quote)
        
        return f"{base_name} to {quote_name}"
    
    return f"Trading pair {pair_name}"

def insert_pairs_to_database(pairs: List[str]) -> int:
    """
    Insert pairs into database
    Returns number of pairs inserted
    """
    if not pairs:
        print("No pairs to insert")
        return 0
    
    try:
        db = get_db()
        
        # Clear existing pairs
        delete_result = db.pairs.delete_many({})
        print(f"Cleared {delete_result.deleted_count} existing pairs")
        
        # Prepare pairs data
        pairs_data = []
        for pair in pairs:
            pairs_data.append({
                "name": pair,
                "description": generate_pair_description(pair)
            })
        
        # Insert new pairs
        insert_result = db.pairs.insert_many(pairs_data)
        inserted_count = len(insert_result.inserted_ids)
        
        print(f"Successfully inserted {inserted_count} pairs into database")
        return inserted_count
        
    except Exception as e:
        print(f"Error inserting pairs to database: {e}")
        return 0

def update_existing_pair_groups(pairs: List[str]) -> None:
    """
    Update existing pair groups to use valid pairs only
    """
    try:
        db = get_db()
        pair_groups = list(db.pair_groups.find())
        
        for group in pair_groups:
            group_pairs = group.get('pairs', [])
            # Filter to only include pairs that exist in our new list
            valid_pairs = [p for p in group_pairs if p in pairs]
            
            if len(valid_pairs) != len(group_pairs):
                # Update the group with valid pairs only
                db.pair_groups.update_one(
                    {"_id": group["_id"]},
                    {"$set": {"pairs": valid_pairs}}
                )
                print(f"Updated pair group '{group['name']}': {len(group_pairs)} -> {len(valid_pairs)} pairs")
        
    except Exception as e:
        print(f"Error updating pair groups: {e}")

def create_sample_pair_groups(pairs: List[str]) -> None:
    """
    Create sample pair groups based on fetched pairs
    """
    try:
        db = get_db()
        
        # Define sample groups based on common patterns
        sample_groups = [
            {
                "name": "Major Cryptocurrencies",
                "description": "Top market cap cryptocurrencies",
                "pairs": [p for p in pairs if any(major in p for major in ['BTC/', 'ETH/', 'BNB/', 'XRP/', 'ADA/'])][:10]
            },
            {
                "name": "DeFi Tokens", 
                "description": "Decentralized Finance tokens",
                "pairs": [p for p in pairs if any(defi in p for defi in ['UNI/', 'AAVE/', 'COMP/', 'MKR/', 'SNX/', 'CRV/', 'SUSHI/'])][:10]
            },
            {
                "name": "Layer 1 Blockchains",
                "description": "Layer 1 blockchain tokens",
                "pairs": [p for p in pairs if any(l1 in p for l1 in ['SOL/', 'AVAX/', 'DOT/', 'ATOM/', 'NEAR/', 'ALGO/'])][:10]
            },
            {
                "name": "Meme Coins",
                "description": "Popular meme cryptocurrencies", 
                "pairs": [p for p in pairs if any(meme in p for meme in ['DOGE/', 'SHIB/', 'PEPE/', 'WIF/', 'BONK/', 'FLOKI/'])][:10]
            },
            {
                "name": "High Volume Pairs",
                "description": "Most actively traded pairs",
                "pairs": pairs[:20]  # First 20 pairs (sorted by volume)
            }
        ]
        
        # Clear existing sample groups
        db.pair_groups.delete_many({})
        
        # Insert new groups (only if they have pairs)
        inserted_groups = 0
        for group in sample_groups:
            if group['pairs']:  # Only insert if group has pairs
                db.pair_groups.insert_one(group)
                inserted_groups += 1
                print(f"Created pair group '{group['name']}' with {len(group['pairs'])} pairs")
        
        print(f"Created {inserted_groups} sample pair groups")
        
    except Exception as e:
        print(f"Error creating sample pair groups: {e}")

def main():
    """Main function"""
    print("=== Freqtrade Pairs Fetcher ===")
    print("Fetching trading pairs from remotepairlist.com...")
    
    # Fetch pairs from remote
    pairs = fetch_pairs_from_remote()
    
    if not pairs:
        print("Failed to fetch pairs. Exiting.")
        return
    
    print(f"\nFetched {len(pairs)} pairs")
    print("Sample pairs:", pairs[:10])
    
    # Insert pairs to database
    inserted_count = insert_pairs_to_database(pairs)
    
    if inserted_count > 0:
        print(f"\n✅ Successfully inserted {inserted_count} pairs to database")
        
        # Update existing pair groups
        print("\nUpdating existing pair groups...")
        update_existing_pair_groups(pairs)
        
        # Create sample pair groups
        print("\nCreating sample pair groups...")
        create_sample_pair_groups(pairs)
        
        print("\n🎉 Pairs update completed successfully!")
        print(f"Total pairs in database: {inserted_count}")
        
    else:
        print("\n❌ Failed to insert pairs to database")

if __name__ == "__main__":
    main() 