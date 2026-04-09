"""
Build RAG index from a PDF: extract -> chunk -> FAISS.
Usage: python -m backend.scripts.build_rag [path_to.pdf]
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.config import DATA_DIR, FAISS_INDEX_PATH, CHUNKS_PATH, CHUNK_SIZE, CHUNK_OVERLAP
from backend.core.pdf_utils import extract_text_from_pdf, chunk_text
from backend.core.embeddings_utils import EmbeddingModel, FaissStore


def main():
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "data" / "sample.pdf"
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}")
        print("Usage: python -m backend.scripts.build_rag <path_to.pdf>")
        sys.exit(1)

    print("1. Extracting text from PDF...")
    text = extract_text_from_pdf(pdf_path)
    print(f"   Extracted {len(text)} characters.")

    print("2. Chunking text...")
    chunks = chunk_text(text, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    print(f"   Got {len(chunks)} chunks.")

    print("3. Building FAISS index...")
    model = EmbeddingModel()
    store = FaissStore(model)
    store.build(chunks)
    store.save(FAISS_INDEX_PATH, CHUNKS_PATH)
    print(f"   Saved to {DATA_DIR}")


if __name__ == "__main__":
    main()
