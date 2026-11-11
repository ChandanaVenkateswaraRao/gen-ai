import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List, Optional
from models.schemas import DocumentMetadata, DocumentChunk, UserBase
from routers.auth import require_admin
from services.db import db_service
from services.document_parser import DocumentParser
from services.rag_engine import rag_engine

router = APIRouter(prefix="/api/documents", tags=["Document Management & Ingestion"])

@router.get("", response_model=List[DocumentMetadata])
def list_documents():
    return list(db_service.documents.values())

@router.post("/upload", response_model=DocumentMetadata)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form("Rules & Discipline"),
    admin: UserBase = Depends(require_admin)
):
    valid_categories = ["Rules & Discipline", "Mess & Dining", "Facilities & Maintenance", "Hostel Admissions", "General Notice"]
    if category not in valid_categories:
        category = "Rules & Discipline"

    content_bytes = await file.read()
    file_size = len(content_bytes)
    doc_id = str(uuid.uuid4())
    filename = file.filename or "uploaded_document.txt"

    # Parse chunks
    if filename.lower().endswith(".pdf"):
        raw_chunks = DocumentParser.parse_pdf(content_bytes, title, doc_id)
    else:
        text = content_bytes.decode("utf-8", errors="ignore")
        raw_chunks = DocumentParser.parse_markdown(text, title, doc_id)

    if not raw_chunks:
        # Create at least one fallback chunk if text was plain
        raw_chunks = [{
            "id": f"{doc_id}_chunk_0",
            "document_id": doc_id,
            "content": content_bytes.decode("utf-8", errors="ignore")[:1000],
            "page_number": 1,
            "chunk_index": 0,
            "metadata": {"doc_title": title}
        }]

    # Save document record
    doc_meta = DocumentMetadata(
        id=doc_id,
        title=title,
        file_name=filename,
        file_size=file_size,
        category=category, # type: ignore
        status="indexed",
        chunk_count=len(raw_chunks),
        created_at=datetime.now(timezone.utc).isoformat()
    )
    db_service.documents[doc_id] = doc_meta

    # Index chunks in vector store
    for c in raw_chunks:
        c_id = c["id"]
        doc_chunk = DocumentChunk(
            id=c_id,
            document_id=doc_id,
            content=c["content"],
            page_number=c["page_number"],
            chunk_index=c["chunk_index"],
            metadata=c["metadata"]
        )
        db_service.document_chunks[c_id] = doc_chunk
        vec = rag_engine._embed_text(c["content"])
        db_service.chunk_vectors[c_id] = vec

    db_service.log_audit("document_uploaded", {
        "title": title,
        "doc_id": doc_id,
        "chunks": len(raw_chunks),
        "uploaded_by": admin.full_name
    })

    return doc_meta

@router.delete("/{doc_id}")
def delete_document(doc_id: str, admin: UserBase = Depends(require_admin)):
    if doc_id not in db_service.documents:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc = db_service.documents.pop(doc_id)
    # Remove associated chunks
    chunk_ids = [c_id for c_id, c in db_service.document_chunks.items() if c.document_id == doc_id]
    for c_id in chunk_ids:
        db_service.document_chunks.pop(c_id, None)
        db_service.chunk_vectors.pop(c_id, None)

    db_service.log_audit("document_deleted", {"title": doc.title, "deleted_by": admin.full_name})
    return {"status": "success", "message": f"Document '{doc.title}' and {len(chunk_ids)} chunks removed."}

@router.get("/{doc_id}/chunks", response_model=List[DocumentChunk])
def get_document_chunks(doc_id: str):
    if doc_id not in db_service.documents:
        raise HTTPException(status_code=404, detail="Document not found.")
    return [c for c in db_service.document_chunks.values() if c.document_id == doc_id]
