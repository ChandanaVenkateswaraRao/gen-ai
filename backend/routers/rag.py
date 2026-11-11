from fastapi import APIRouter, HTTPException
from models.schemas import RAGQueryRequest, RAGQueryResponse, DocumentChunk
from services.rag_engine import rag_engine
from services.db import db_service

router = APIRouter(prefix="/api/rag", tags=["RAG & Policy Intelligence"])

@router.post("/query", response_model=RAGQueryResponse)
def execute_query(req: RAGQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    return rag_engine.answer_query(req.query, req.conversation_history)

@router.get("/suggestions")
def get_suggested_queries():
    return {
        "suggestions": [
            "What is the hostel gate curfew timing on weekdays vs weekends?",
            "Can parents or overnight guests stay in student rooms?",
            "Are electric kettles or room heaters permitted in rooms?",
            "What is the minimum duration required to claim a mess rebate?",
            "What is the procedure if I arrive past 10:30 PM due to lab work?",
            "What is for lunch today?",
            "Check status of complaint CMP-2026-0041"
        ]
    }

@router.get("/evidence/{chunk_id}", response_model=DocumentChunk)
def inspect_evidence_chunk(chunk_id: str):
    chunk = db_service.document_chunks.get(chunk_id)
    if not chunk:
        raise HTTPException(status_code=404, detail=f"Evidence chunk {chunk_id} not found.")
    return chunk
