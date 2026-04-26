import os
import pickle
import numpy as np
from typing import List


class VectorStore:
    """
    FAISS vector store using sentence-transformers.
    Uses a lightweight model for fast indexing.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.documents: List[str] = []
        self.embeddings = None
        self.index = None
        self._load_model()

    def _load_model(self):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(self.model_name)

    def add_documents(self, documents: List[str]):
        import faiss
        self.documents = documents
        embeddings = self.model.encode(
            documents,
            show_progress_bar=False,
            batch_size=64,
            normalize_embeddings=True,   # cosine via inner product
        )
        self.embeddings = np.array(embeddings, dtype="float32")
        dim = self.embeddings.shape[1]
        # Use IndexFlatIP for cosine similarity (vectors normalised)
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(self.embeddings)

    def search(self, query: str, top_k: int = 5) -> List[str]:
        if self.index is None or not self.documents:
            return []
        import faiss
        q_emb = self.model.encode(
            [query], normalize_embeddings=True
        ).astype("float32")
        _, indices = self.index.search(q_emb, min(top_k, len(self.documents)))
        return [self.documents[i] for i in indices[0] if i < len(self.documents)]

    def save(self, path: str = "vector_store.pkl"):
        import faiss
        with open(path, "wb") as f:
            pickle.dump({"documents": self.documents, "embeddings": self.embeddings}, f)
        faiss.write_index(self.index, path.replace(".pkl", ".index"))

    def load(self, path: str = "vector_store.pkl"):
        import faiss
        with open(path, "rb") as f:
            data = pickle.load(f)
        self.documents = data["documents"]
        self.embeddings = data["embeddings"]
        self.index = faiss.read_index(path.replace(".pkl", ".index"))
