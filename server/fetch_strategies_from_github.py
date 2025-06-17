#!/usr/bin/env python3
"""
Script to fetch trading strategies from GitHub repository and insert into database
"""

import sys
import os
import subprocess
import shutil
import re
import ast
from typing import List, Dict, Optional, Set
from pathlib import Path

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import get_db

def clone_strategies_repo(temp_dir: str = "temp_strategies") -> bool:
    """
    Clone the freqtrade strategies repository
    """
    try:
        # Remove existing temp directory if it exists
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        
        print("Cloning freqtrade-strategies repository...")
        
        # Clone the repository with shallow clone to reduce .git folder size
        result = subprocess.run([
            "git", "clone", "-b", "migrate-2024", "--depth", "1",
            "https://github.com/MaoBui2907/freqtrade-strategies.git", 
            temp_dir
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            print(f"Failed to clone repository: {result.stderr}")
            return False
        
        print("Successfully cloned repository")
        return True
        
    except subprocess.TimeoutExpired:
        print("Repository cloning timed out")
        return False
    except Exception as e:
        print(f"Error cloning repository: {e}")
        return False

def extract_strategy_info(file_path: str) -> Optional[Dict]:
    """
    Extract strategy information from Python file
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse the AST to extract information
        try:
            tree = ast.parse(content)
        except SyntaxError:
            print(f"Syntax error in {file_path}, skipping...")
            return None
        
        strategy_info = {
            'filename': os.path.basename(file_path),
            'name': os.path.splitext(os.path.basename(file_path))[0],
            'description': '',
            'explanation': '',
            'indicators': [],
            'example': '',
            'content': content
        }
        
        # Extract class name and docstring
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Use class name as strategy name if it looks like a strategy
                if any(keyword in node.name.lower() for keyword in ['strategy', 'strat']):
                    strategy_info['name'] = node.name
                
                # Extract class docstring
                if (node.body and isinstance(node.body[0], ast.Expr) and 
                    isinstance(node.body[0].value, ast.Constant) and 
                    isinstance(node.body[0].value.value, str)):
                    docstring = node.body[0].value.value.strip()
                    if docstring:
                        strategy_info['description'] = docstring[:200] + ('...' if len(docstring) > 200 else '')
                        strategy_info['explanation'] = docstring
        
        # Extract indicators from imports and function calls
        indicators = set()
        
        # Common freqtrade indicators
        common_indicators = {
            'sma', 'ema', 'rsi', 'macd', 'bollinger', 'stoch', 'adx', 'cci', 'williams',
            'atr', 'obv', 'mfi', 'trix', 'kama', 'tema', 'dema', 'mama', 'ht_trendline',
            'ht_dcperiod', 'ht_dcphase', 'ht_phasor', 'ht_sine', 'ht_trendmode',
            'sarext', 'sar', 'ppo', 'roc', 'rocp', 'rocr', 'rocr100', 'mom', 'cmo',
            'plus_di', 'plus_dm', 'minus_di', 'minus_dm', 'dx', 'willr', 'ultosc',
            'bop', 'cci', 'cmo', 'dx', 'mfi', 'minus_di', 'minus_dm', 'mom', 'plus_di',
            'plus_dm', 'ppo', 'roc', 'rocp', 'rocr', 'rocr100', 'rsi', 'trix', 'ultosc',
            'willr', 'ad', 'adosc', 'obv', 'ht_dcperiod', 'ht_dcphase', 'ht_phasor',
            'ht_sine', 'ht_trendline', 'ht_trendmode'
        }
        
        # Search for indicator usage in content
        content_lower = content.lower()
        for indicator in common_indicators:
            if indicator in content_lower:
                indicators.add(indicator.upper())
        
        # Look for talib imports
        talib_pattern = r'talib\.(\w+)'
        talib_matches = re.findall(talib_pattern, content, re.IGNORECASE)
        for match in talib_matches:
            indicators.add(match.upper())
        
        # Look for qtpylib imports
        qtpylib_pattern = r'qtpylib\.(\w+)'
        qtpylib_matches = re.findall(qtpylib_pattern, content, re.IGNORECASE)
        for match in qtpylib_matches:
            indicators.add(match.upper())
        
        strategy_info['indicators'] = sorted(list(indicators))
        
        # Generate example based on strategy name and indicators
        if strategy_info['indicators']:
            top_indicators = strategy_info['indicators'][:3]
            strategy_info['example'] = f"Strategy using {', '.join(top_indicators)} indicators"
        else:
            strategy_info['example'] = f"Custom trading strategy: {strategy_info['name']}"
        
        # Use filename as fallback description
        if not strategy_info['description']:
            name_parts = re.findall(r'[A-Z][a-z]*', strategy_info['name'])
            if name_parts:
                strategy_info['description'] = ' '.join(name_parts) + ' trading strategy'
            else:
                strategy_info['description'] = f"{strategy_info['name']} trading strategy"
        
        return strategy_info
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def find_strategy_files(repo_dir: str) -> List[str]:
    """
    Find all Python strategy files in the filtered directory
    """
    strategy_files = []
    filtered_path = os.path.join(repo_dir, "filtered")
    
    if not os.path.exists(filtered_path):
        print(f"Filtered directory not found in {repo_dir}")
        return strategy_files
    
    for root, dirs, files in os.walk(filtered_path):
        for file in files:
            if file.endswith('.py') and not file.startswith('__'):
                file_path = os.path.join(root, file)
                strategy_files.append(file_path)
    
    print(f"Found {len(strategy_files)} filtered strategy files")
    return strategy_files

def copy_strategies_to_server(strategy_files: List[str], server_strategies_dir: str = "strategies") -> int:
    """
    Copy strategy files to server strategies directory for backtesting
    Returns number of files copied
    """
    if not strategy_files:
        print("No strategy files to copy")
        return 0
    
    try:
        # Create server strategies directory if it doesn't exist
        os.makedirs(server_strategies_dir, exist_ok=True)
        
        # Clear existing strategy files
        for existing_file in os.listdir(server_strategies_dir):
            if existing_file.endswith('.py'):
                os.remove(os.path.join(server_strategies_dir, existing_file))
        
        print(f"Cleared existing strategy files in {server_strategies_dir}")
        
        # Copy new strategy files
        copied_count = 0
        for file_path in strategy_files:
            filename = os.path.basename(file_path)
            dest_path = os.path.join(server_strategies_dir, filename)
            
            shutil.copy2(file_path, dest_path)
            copied_count += 1
            print(f"Copied: {filename}")
        
        print(f"Successfully copied {copied_count} strategy files to {server_strategies_dir}")
        return copied_count
        
    except Exception as e:
        print(f"Error copying strategy files: {e}")
        return 0

def insert_strategies_to_database(strategies: List[Dict]) -> int:
    """
    Insert strategies into database
    Returns number of strategies inserted
    """
    if not strategies:
        print("No strategies to insert")
        return 0
    
    try:
        db = get_db()
        
        # Clear existing strategies
        delete_result = db.strategies.delete_many({})
        print(f"Cleared {delete_result.deleted_count} existing strategies")
        
        # Insert new strategies
        insert_result = db.strategies.insert_many(strategies)
        inserted_count = len(insert_result.inserted_ids)
        
        print(f"Successfully inserted {inserted_count} strategies into database")
        return inserted_count
        
    except Exception as e:
        print(f"Error inserting strategies to database: {e}")
        return 0

def create_strategy_groups(strategies: List[Dict]) -> None:
    """
    Create strategy groups based on strategy characteristics
    """
    try:
        db = get_db()
        
        # Group strategies by characteristics
        trend_following = []
        mean_reversion = []
        scalping = []
        breakout = []
        multi_timeframe = []
        machine_learning = []
        
        for strategy in strategies:
            name_lower = strategy['name'].lower()
            description_lower = strategy['description'].lower()
            indicators = [ind.lower() for ind in strategy.get('indicators', [])]
            
            # Categorize based on name and indicators
            if any(keyword in name_lower for keyword in ['trend', 'ma', 'ema', 'sma', 'macd']):
                trend_following.append(strategy['name'])
            
            if any(keyword in name_lower for keyword in ['bb', 'bollinger', 'mean', 'reversion', 'rsi']):
                mean_reversion.append(strategy['name'])
            
            if any(keyword in name_lower for keyword in ['scalp', 'quick', 'fast', 'short']):
                scalping.append(strategy['name'])
            
            if any(keyword in name_lower for keyword in ['break', 'momentum', 'adx']):
                breakout.append(strategy['name'])
            
            if any(keyword in name_lower for keyword in ['multi', 'timeframe', 'tf']):
                multi_timeframe.append(strategy['name'])
            
            if any(keyword in name_lower for keyword in ['ml', 'ai', 'neural', 'learning', 'model']):
                machine_learning.append(strategy['name'])
        
        # Create groups
        groups = [
            {
                "name": "Trend Following Strategies",
                "description": "Strategies that follow market trends using moving averages and trend indicators",
                "strategies": trend_following[:20]  # Limit to 20 strategies per group
            },
            {
                "name": "Mean Reversion Strategies", 
                "description": "Strategies that trade reversals using RSI, Bollinger Bands, etc.",
                "strategies": mean_reversion[:20]
            },
            {
                "name": "Scalping Strategies",
                "description": "Fast trading strategies for short-term profits",
                "strategies": scalping[:20]
            },
            {
                "name": "Breakout Strategies",
                "description": "Strategies that trade momentum and breakouts",
                "strategies": breakout[:20]
            },
            {
                "name": "Multi-Timeframe Strategies",
                "description": "Strategies using multiple timeframes for analysis",
                "strategies": multi_timeframe[:20]
            },
            {
                "name": "Machine Learning Strategies",
                "description": "AI and ML-based trading strategies",
                "strategies": machine_learning[:20]
            },
            {
                "name": "All Strategies",
                "description": "Complete collection of all available strategies",
                "strategies": [s['name'] for s in strategies[:50]]  # First 50 strategies
            }
        ]
        
        # Clear existing strategy groups
        db.strategy_groups.delete_many({})
        
        # Insert new groups (only if they have strategies)
        inserted_groups = 0
        for group in groups:
            if group['strategies']:  # Only insert if group has strategies
                db.strategy_groups.insert_one(group)
                inserted_groups += 1
                print(f"Created strategy group '{group['name']}' with {len(group['strategies'])} strategies")
        
        print(f"Created {inserted_groups} strategy groups")
        
    except Exception as e:
        print(f"Error creating strategy groups: {e}")

def cleanup_temp_directory(temp_dir: str) -> None:
    """
    Clean up temporary directory with better Windows support
    """
    try:
        if os.path.exists(temp_dir):
            # On Windows, we need to handle file permissions and locks
            if os.name == 'nt':  # Windows
                import stat
                
                def handle_remove_readonly(func, path, exc):
                    """Error handler for Windows readonly files"""
                    if os.path.exists(path):
                        os.chmod(path, stat.S_IWRITE)
                        func(path)
                
                shutil.rmtree(temp_dir, onerror=handle_remove_readonly)
            else:
                shutil.rmtree(temp_dir)
            
            print(f"Cleaned up temporary directory: {temp_dir}")
    except PermissionError as e:
        print(f"Permission error cleaning up temp directory (this is normal on Windows): {e}")
        print("You may need to manually delete the temp_strategies folder later")
    except Exception as e:
        print(f"Error cleaning up temp directory: {e}")
        print("You may need to manually delete the temp_strategies folder")

def main():
    """Main function"""
    print("=== Freqtrade Strategies Fetcher ===")
    print("Fetching trading strategies from GitHub repository...")
    
    temp_dir = "temp_strategies"
    
    try:
        # Clone repository
        if not clone_strategies_repo(temp_dir):
            print("Failed to clone repository. Exiting.")
            return
        
        # Find strategy files
        strategy_files = find_strategy_files(temp_dir)
        
        if not strategy_files:
            print("No strategy files found. Exiting.")
            return
        
        print(f"Processing {len(strategy_files)} strategy files...")
        
        # Process each strategy file
        strategies = []
        processed = 0
        
        for file_path in strategy_files:
            print(f"Processing: {os.path.basename(file_path)}")
            strategy_info = extract_strategy_info(file_path)
            
            if strategy_info:
                strategies.append(strategy_info)
                processed += 1
            
            # Show progress
            if processed % 10 == 0:
                print(f"Processed {processed}/{len(strategy_files)} files...")
        
        print(f"\nSuccessfully processed {len(strategies)} strategies")
        
        if strategies:
            # Copy strategy files to server directory for backtesting
            print(f"\nCopying strategy files to server directory...")
            copied_count = copy_strategies_to_server(strategy_files)
            
            # Insert strategies to database
            inserted_count = insert_strategies_to_database(strategies)
            
            if inserted_count > 0:
                print(f"\n✅ Successfully inserted {inserted_count} strategies to database")
                print(f"✅ Successfully copied {copied_count} strategy files to server/strategies")
                
                # Create strategy groups
                print("\nCreating strategy groups...")
                create_strategy_groups(strategies)
                
                print("\n🎉 Strategies update completed successfully!")
                print(f"Total strategies in database: {inserted_count}")
                print(f"Total strategy files copied: {copied_count}")
                
                # Show sample strategies
                print("\nSample strategies:")
                for i, strategy in enumerate(strategies[:5]):
                    print(f"  {i+1}. {strategy['name']} - {strategy['description']}")
                    if strategy['indicators']:
                        print(f"     Indicators: {', '.join(strategy['indicators'][:5])}")
                
            else:
                print("\n❌ Failed to insert strategies to database")
        else:
            print("\n❌ No valid strategies found to insert")
    
    finally:
        # Cleanup
        cleanup_temp_directory(temp_dir)

if __name__ == "__main__":
    main() 