"""
Build the question cache: chunks → Groq → JSON.
Run after build_rag.py.
Usage: python -m backend.scripts.build_question_cache [20]
"""
import sys
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(ROOT / ".env")
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

from backend.config import (
    DATA_DIR,
    FAISS_INDEX_PATH,
    CHUNKS_PATH,
    QUESTION_CACHE_PATH,
    GROQ_API_KEY,
)
from backend.core.embeddings_utils import EmbeddingModel, FaissStore
from backend.core.quiz_logic import QuizGenerator


def main():
    num_questions = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    if not GROQ_API_KEY:
        print("Error: GROQ_API_KEY is not set.")
        print(f"  Expected .env at: {ROOT / '.env'} or backend/.env")
        print("  Example: GROQ_API_KEY=gsk_xxxxxxxx")
        sys.exit(1)

    if not FAISS_INDEX_PATH.exists() or not CHUNKS_PATH.exists():
        print("Error: RAG index not found. Run build_rag.py first.")
        sys.exit(1)

    print("Loading chunks...")
    store = FaissStore(EmbeddingModel())
    store.load(FAISS_INDEX_PATH, CHUNKS_PATH)
    chunks = store.get_all_chunks()
    if not chunks:
        print("No chunks found.")
        sys.exit(1)

    generator = QuizGenerator(api_key=GROQ_API_KEY)
    questions = []
    used = set()
    attempt = 0
    max_attempts = num_questions * 3

    while len(questions) < num_questions and attempt < max_attempts:
        attempt += 1
        idx = random.randint(0, len(chunks) - 1)
        if idx in used:
            continue
        used.add(idx)
        result = generator.generate(chunks[idx])
        if not result:
            continue
        questions.append({
            "question": result["question"],
            "options": result.get("options", {"A": "A) ?", "B": "B) ?", "C": "C) ?"}),
            "correct": result.get("correct", "A"),
            "chunk_id": idx,
            "chunk_text": chunks[idx][:500],
            "times_asked": 0,
            "times_correct": 0,
        })
        print(f"  Generated {len(questions)}/{num_questions} (chunk {idx}).")

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(QUESTION_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(questions)} questions to {QUESTION_CACHE_PATH}")


if __name__ == "__main__":
    main()
