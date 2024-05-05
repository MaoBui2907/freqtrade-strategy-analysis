import ast
import glob
import os
from db import DBService, Strategy
from tqdm import tqdm


def list_strategies():
    return glob.glob("./user_data/strategies/*.py")


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
    strategies = list_strategies()
    db = DBService()
    for strategy in tqdm(strategies):
        s = Strategy(
            name=get_strategy_name(strategy),
            filename=os.path.basename(strategy),
            description="This is a strategy",
        )
        db.add_strategy(s)
    print("Done", len(list(db.get_strategies())))


if __name__ == "__main__":
    main()
