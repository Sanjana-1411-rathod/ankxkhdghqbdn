"""
ANKAN Garments AI Store Manager — FastAPI Backend
"""

import os
import time
import tempfile
import pickle
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.document_processor import DocumentProcessor
from src.vector_store import VectorStore
from src.llm import LLMHandler

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")
VECTOR_STORE_PATH = "vector_store.pkl"
DATA_DIR = "data"

app_state = {
    "vector_store": None,
    "processed": False,
    "total_chunks": 0,
    "files_loaded": [],
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.path.exists(VECTOR_STORE_PATH):
        try:
            vs = VectorStore()
            vs.load(VECTOR_STORE_PATH)
            app_state["vector_store"] = vs
            app_state["processed"] = True
            app_state["total_chunks"] = len(vs.documents)
            print(f"Loaded saved index: {len(vs.documents)} chunks")
        except Exception as e:
            print(f"Could not load saved index: {e}")
    yield


app = FastAPI(title="ANKAN Garments AI API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    top_k: int = 5
    model: str = "llama-3.3-70b-versatile"
    groq_api_key: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    elapsed: float
    model: str
    chunks_used: int


class StatusResponse(BaseModel):
    processed: bool
    total_chunks: int
    files_loaded: List[str]


@app.get("/api/status", response_model=StatusResponse)
def get_status():
    return StatusResponse(
        processed=app_state["processed"],
        total_chunks=app_state["total_chunks"],
        files_loaded=app_state["files_loaded"],
    )


@app.post("/api/upload")
async def upload_and_index(
    files: Optional[List[UploadFile]] = File(default=None),
    auto_load_data: bool = True,
):
    try:
        processor = DocumentProcessor()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processor init failed: {str(e)}")

    all_chunks = []
    names = []
    tmp_dir = tempfile.gettempdir()

    for uf in (files or []):
        try:
            path = os.path.join(tmp_dir, uf.filename)
            content = await uf.read()
            with open(path, "wb") as f:
                f.write(content)
            chunks = processor.process_file(path)
            all_chunks.extend(chunks)
            names.append(f"{uf.filename} ({len(chunks)} chunks)")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing {uf.filename}: {str(e)}")

    if auto_load_data and os.path.exists(DATA_DIR):
        for fname in os.listdir(DATA_DIR):
            fpath = os.path.join(DATA_DIR, fname)
            if os.path.isfile(fpath):
                try:
                    chunks = processor.process_file(fpath)
                    all_chunks.extend(chunks)
                    names.append(f"{fname} ({len(chunks)} chunks) [/data]")
                except Exception as e:
                    print(f"Skipping {fname}: {e}")

    if not all_chunks:
        raise HTTPException(status_code=400, detail="No content extracted. Add CSV/Excel files to /data folder.")

    try:
        vs = VectorStore()
        vs.add_documents(all_chunks)
        vs.save(VECTOR_STORE_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector store error: {str(e)}")

    app_state["vector_store"] = vs
    app_state["processed"] = True
    app_state["total_chunks"] = len(all_chunks)
    app_state["files_loaded"] = names

    return {"success": True, "total_chunks": len(all_chunks), "files": names}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not app_state["processed"] or app_state["vector_store"] is None:
        raise HTTPException(status_code=400, detail="No data indexed yet. Please process files first.")

    t0 = time.time()
    results = app_state["vector_store"].search(req.question, top_k=req.top_k)
    context = "\n\n".join(results)
    api_key = req.groq_api_key or GROQ_API_KEY
    llm = LLMHandler(api_key=api_key, model_name=req.model)
    answer = llm.get_answer(query=req.question, context=context)
    elapsed = round(time.time() - t0, 2)

    return ChatResponse(answer=answer, elapsed=elapsed, model=req.model, chunks_used=len(results))


@app.delete("/api/reset")
def reset():
    app_state["vector_store"] = None
    app_state["processed"] = False
    app_state["total_chunks"] = 0
    app_state["files_loaded"] = []
    if os.path.exists(VECTOR_STORE_PATH):
        os.remove(VECTOR_STORE_PATH)
    return {"success": True}


@app.get("/")
def root():
    return {"message": "ANKAN Garments AI API v2.0"}
