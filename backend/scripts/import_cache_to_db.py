#!/usr/bin/env python3
"""Import questions from question_cache.json into PostgreSQL. Usage: python -m backend.scripts.import_cache_to_db"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

from backend.database.connection import init_db, get_db
from backend.database.repositories import QuestionRepository
from backend.core.quiz_logic import QuestionCache
from backend.config import QUESTION_CACHE_PATH

def main():
    print("=== Import questions to PostgreSQL ===\n")
    cache = QuestionCache(QUESTION_CACHE_PATH)
    questions = cache.load()
    if not questions:
        print("No questions found in question_cache.json.")
        sys.exit(1)
    print(f"Found {len(questions)} question(s) in the cache.")
    init_db()
    print("Database ready.")
    with get_db() as db:
        repo = QuestionRepository(db)
        imported = repo.import_from_cache(questions)
        db.commit()
    print(f"\nDone: {imported} new question(s) imported to DB.")

if __name__ == "__main__":
    main()
