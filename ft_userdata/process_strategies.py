import os
from textwrap import dedent
from time import sleep
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
import glob
from langchain_core.output_parsers import PydanticOutputParser
from db import DBService, Strategy
import ast
from pydantic import BaseModel
from typing import List
from tqdm import tqdm

class ProcessStrategies:
    def __init__(self):
        ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
        model_name = "claude-3-sonnet-20240229"
        self.llm = ChatAnthropic(model_name=model_name, api_key=ANTHROPIC_API_KEY)
        
        class StrategyResponse(BaseModel):
            Status: str
            Analyze: str
            Indicators: List[str]
            Explanation: str
            Example: str
            Recommendation: str
            CodeReview: str
        self.pydantic_parser = PydanticOutputParser(pydantic_object=StrategyResponse)

    def verify_strategy(self, strategy_code: str):
        max_retries = 5
        default_result = {"Status": "UNKNOWN", "Analyze": "", "Indicators": [], "Explaination": "", "Example": "", "Recommendation": "", "CodeReview": ""}
        
        for i in range(max_retries):
            try:
                system = SystemMessage(dedent("""
                    You are a FreqTrade expertise and can verify strategies code. Must return as below format:
                    {
                        "Status": "CORRECT" | "INCORRECT" -- Status of the strategy logic code verification,
                        "Analyze": "string" -- Detailed analysis of the strategy,
                        "Indicators": ["string"] -- List of the indicators used in the strategy,
                        "Explanation": "string" -- Detailed explanation of the strategy logic,
                        "Example": "string" -- A very detailed example for the strategy logic,
                        "Recommendation": "string" -- Recommendation list of the strategy improvement or Fixes if it is incorrect,
                        "CodeReview": "string" -- Code review of the strategy code, and suggestions for improvement
                    }
                """))
                question = HumanMessage(dedent(f"""
                    Verify the following strategy code and response with expected format:
                    ==== STRATEGY CODE ====                  
                    {strategy_code}
                    ==== END STRATEGY CODE ====
                """))
                result = self.llm.invoke([system, question])
                result = self.pydantic_parser.parse(result.content)
                result = result.model_dump()
                break  # If no exception is raised, break the loop
            except Exception as e:
                print(e)
                result = default_result  # Set the result to the default value
                if i == max_retries - 1:  # If this was the last retry, return the default result
                    break
                sleep(1)  # Sleep for 1 second before retrying
        
        return result

def get_strategy_name(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            root = ast.parse(f.read())
    except Exception as e:
        print(e, file_path)
        return "Unknown"

    for node in ast.walk(root):
        if isinstance(node, ast.ClassDef):
            return node.name    

def main():
    ps = ProcessStrategies()
    strategies = [f for f in glob.glob('./user_data/strategies/*.py')]
    db = DBService()
    for strategy in tqdm(strategies[30:]):
        with open(strategy, 'r', encoding='utf-8') as f:
            strategy_code = f.read()
            result = ps.verify_strategy(strategy_code)
            db.add_strategy(Strategy(
                name=get_strategy_name(strategy),
                filename=os.path.basename(strategy),
                code=strategy_code,
                indicators=result.get('Indicators', []),
                explanation=result.get('Explanation', ''),
                example=result.get('Example', ''),
                description=result.get('Analyze', ''),
                analysis=result
            ))
        sleep(5)
    
if __name__ == "__main__":
    main()