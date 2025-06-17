from pymongo import MongoClient
import os
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel

def get_db():
    # Try to use real MongoDB first, fallback to mock database
    try:
        CONNECTION_STRING = os.environ.get('MONGO_CONNECTION_STRING')
        DB_NAME = os.environ.get('MONGO_DB_NAME')
        
        if CONNECTION_STRING and DB_NAME:
            client = MongoClient(CONNECTION_STRING)
            # Test connection
            client.admin.command('ping')
            return client.get_database(DB_NAME)
        else:
            print("MongoDB connection string not found")
            raise Exception("MongoDB connection string not found")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise e

def get_ai(model='anthropic') -> BaseChatModel:
    if model == 'anthropic':
        ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
        model_name = "claude-3-sonnet-20240229"
        llm = ChatAnthropic(api_key=ANTHROPIC_API_KEY, model_name=model_name)
    elif model == 'openai':
        OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
        llm = ChatOpenAI(api_key=OPENAI_API_KEY, model_name='gpt-4o-mini')
    return llm



if __name__ == '__main__':
    db = get_db()
    print(f"Using database: {type(db)}")
    print(f"Collections available: {list(db.collections.keys()) if hasattr(db, 'collections') else 'MongoDB'}")