"""
Sentence embedding model and FAISS vector store.
"""
from pathlib import Path
from typing import List

import numpy as np
import faiss


class EmbeddingModel:
    DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

    def __init__(self, model_name: str | None = None):
        from sentence_transformers import SentenceTransformer
        self._model = SentenceTransformer(model_name or self.DEFAULT_MODEL)

    def encode(self, texts: str | List[str]) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]
        return self._model.encode(texts, convert_to_numpy=True).astype(np.float32)


class FaissStore:
    def __init__(self, embedding_model: EmbeddingModel | None = None):
        self.model = embedding_model or EmbeddingModel()
        self._index: faiss.IndexFlatL2 | None = None
        self._chunks: List[str] = []

    def build(self, chunks: List[str]) -> None:
        embeddings = self.model.encode(chunks)
        dim = embeddings.shape[1]
        self._index = faiss.IndexFlatL2(dim)
        self._index.add(embeddings)  # type: ignore[arg-type]
        self._chunks = list(chunks)

    def search(self, query: str, top_k: int = 3) -> List[str]:
        if self._index is None or not self._chunks:
            return []
        q_emb = self.model.encode([query])
        _, indices = self._index.search(q_emb, min(top_k, len(self._chunks)))  # type: ignore[arg-type]
        return [self._chunks[i] for i in indices[0] if i < len(self._chunks)]

    def get_all_chunks(self) -> List[str]:
        return list(self._chunks)

    @property
    def num_chunks(self) -> int:
        return len(self._chunks)

    def save(self, index_path: Path, chunks_path: Path) -> None:
        if self._index is None:
            raise RuntimeError("No index built yet — call build() first.")
        index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self._index, str(index_path))
        np.save(str(chunks_path), np.array(self._chunks, dtype=object))

    def load(self, index_path: Path, chunks_path: Path) -> None:
        self._index = faiss.read_index(str(index_path))
        self._chunks = np.load(str(chunks_path), allow_pickle=True).tolist()
