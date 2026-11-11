import os
import re
import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

from config import settings
from models.schemas import (
    RAGQueryResponse, GroundedSource, DocumentChunk
)
from services.db import db_service
from services.document_parser import DocumentParser

class RAGEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        self._init_gemini_client()
        self._index_initial_seed_docs()

    def _init_gemini_client(self):
        if self.api_key and self.api_key.strip() and self.api_key != "your_gemini_api_key_here":
            try:
                # Attempt to load official google-genai SDK
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                # Fallback to google.generativeai if available
                try:
                    import google.generativeai as gai
                    gai.configure(api_key=self.api_key)
                    self.client = gai
                except Exception:
                    self.client = None
        else:
            self.client = None

    def _index_initial_seed_docs(self):
        """Indexes initial seed markdown documents from backend/data/seed_docs."""
        seed_dir = os.path.join(os.path.dirname(__file__), "..", "data", "seed_docs")
        if not os.path.exists(seed_dir):
            return

        doc_mappings = [
            ("d0000000-0000-0000-0000-000000000001", "Hostel_Rules_and_Regulations_2026.md", "Hostel Rules & Regulations Handbook 2026"),
            ("d0000000-0000-0000-0000-000000000002", "Mess_Guidelines_and_Rebate_Policy_2026.md", "Mess Dining Guidelines & Rebate Policy 2026"),
            ("d0000000-0000-0000-0000-000000000003", "Electrical_and_Maintenance_Policy.md", "Hostel Maintenance & Electrical Appliance Policy")
        ]

        for doc_id, filename, title in doc_mappings:
            filepath = os.path.join(seed_dir, filename)
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                raw_chunks = DocumentParser.parse_markdown(content, title, doc_id)
                for chunk in raw_chunks:
                    c_id = chunk["id"]
                    doc_chunk = DocumentChunk(
                        id=c_id,
                        document_id=doc_id,
                        content=chunk["content"],
                        page_number=chunk["page_number"],
                        chunk_index=chunk["chunk_index"],
                        metadata=chunk["metadata"]
                    )
                    db_service.document_chunks[c_id] = doc_chunk
                    # Generate embedding
                    vec = self._embed_text(chunk["content"])
                    db_service.chunk_vectors[c_id] = vec

    def _embed_text(self, text: str) -> np.ndarray:
        """Embeds text using Gemini or a deterministic lexical-semantic representation."""
        if self.client and hasattr(self.client, "models"):
            try:
                # google-genai SDK
                result = self.client.models.embed_content(
                    model=settings.EMBEDDING_MODEL,
                    contents=text
                )
                return np.array(result.embedding.values, dtype=np.float32)
            except Exception:
                pass
        
        # Local semantic vector generator (Bag of n-grams with hash projections for deterministic cosine search)
        words = re.findall(r'\b[a-zA-Z0-9_]{2,}\b', text.lower())
        vec = np.zeros(768, dtype=np.float32)
        if not words:
            return vec
        for w in words:
            # Deterministic hash projection into 768 dimensions
            h = hash(w) % 768
            vec[h] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def search_similar_chunks(self, query: str, top_k: int = 4, threshold: float = 0.25) -> List[Tuple[DocumentChunk, float]]:
        """Retrieves top matching chunks based on cosine similarity."""
        query_vec = self._embed_text(query)
        scored: List[Tuple[DocumentChunk, float]] = []

        STOPWORDS = {
            "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "by", "for", "with",
            "about", "against", "between", "into", "through", "during", "before", "after", "above",
            "below", "to", "from", "up", "down", "out", "off", "over", "under", "then", "once",
            "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few",
            "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
            "so", "than", "too", "very", "can", "will", "just", "should", "now", "of", "and", "or",
            "what", "which", "who", "whom", "this", "that", "these", "those", "am", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "student", "students", "hostel"
        }
        query_terms = set(re.findall(r'\b[a-zA-Z0-9_]{3,}\b', query.lower())) - STOPWORDS

        for c_id, chunk in db_service.document_chunks.items():
            vec = db_service.chunk_vectors.get(c_id)
            if vec is not None:
                # Cosine similarity
                dot = np.dot(query_vec, vec)
                norm_q = np.linalg.norm(query_vec)
                norm_v = np.linalg.norm(vec)
                if norm_q > 0 and norm_v > 0:
                    sim = float(dot / (norm_q * norm_v))
                else:
                    sim = 0.0

                chunk_terms = set(re.findall(r'\b[a-zA-Z0-9_]{3,}\b', chunk.content.lower())) - STOPWORDS
                overlap = len(query_terms.intersection(chunk_terms))

                # If query has 3 or more content terms, require at least 2 overlapping terms
                if len(query_terms) >= 3 and overlap < 2:
                    continue

                # If query contains content terms but none match chunk, do not match
                if len(query_terms) >= 2 and overlap == 0:
                    continue

                adjusted_sim = sim + (0.15 * min(overlap, 4))
                
                if adjusted_sim >= threshold and overlap > 0:
                    scored.append((chunk, adjusted_sim))

        # Sort by highest similarity
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def answer_query(self, query: str, conversation_history: List[Dict[str, str]] = []) -> RAGQueryResponse:
        now_iso = datetime.now(timezone.utc).isoformat()
        q_lower = query.lower().strip()

        # 1. Check for Mess Menu Intent (Structured Database Retrieval)
        if any(term in q_lower for term in ["mess", "menu", "lunch", "dinner", "breakfast", "snacks", "food", "eat today", "what to eat"]):
            return self._handle_mess_query(query, now_iso)

        # 2. Check for Complaint Tracking Intent (Structured Database Retrieval)
        complaint_match = re.search(r'\b(cmp-\d{4}-\d{4})\b', q_lower)
        if complaint_match:
            tracking_id = complaint_match.group(1).upper()
            return self._handle_complaint_query(tracking_id, now_iso)

        # 3. Policy / Document RAG Retrieval
        matching_chunks = self.search_similar_chunks(query, top_k=3, threshold=0.30)
        
        # If no evidence meets threshold, strictly return no-evidence state
        if not matching_chunks:
            return RAGQueryResponse(
                query=query,
                answer="I could not find policy information regarding this topic in the approved hostel documents. Please contact the hostel warden or administration office for guidance on unlisted matters.",
                is_grounded=False,
                query_type="policy_rag",
                sources=[],
                generated_at=now_iso,
                suggested_followups=[
                    "What are the main hostel gate curfew timings?",
                    "What is the policy for overnight guests?",
                    "Are electric room heaters or kettles allowed in rooms?"
                ]
            )

        # Build grounded sources
        sources: List[GroundedSource] = []
        context_blocks = []
        for chunk, score in matching_chunks:
            doc = db_service.documents.get(chunk.document_id)
            doc_title = doc.title if doc else "Approved Hostel Document"
            sources.append(GroundedSource(
                document_id=chunk.document_id,
                document_title=doc_title,
                page_number=chunk.page_number,
                chunk_index=chunk.chunk_index,
                similarity=round(score, 3),
                snippet=chunk.content[:240] + "..." if len(chunk.content) > 240 else chunk.content
            ))
            context_blocks.append(f"--- Document: {doc_title} (Page {chunk.page_number}) ---\n{chunk.content}")

        combined_context = "\n\n".join(context_blocks)

        # Synthesize answer using Gemini LLM if key is configured, else synthesize groundedly
        answer = self._generate_grounded_answer(query, combined_context, sources)

        return RAGQueryResponse(
            query=query,
            answer=answer,
            is_grounded=True,
            query_type="policy_rag",
            sources=sources,
            generated_at=now_iso,
            suggested_followups=[
                "How do I apply for a Digital Late Entry Gate Pass?",
                "What is the penalty for unauthorized appliances?",
                "What is the minimum duration for a mess rebate?"
            ]
        )

    def _generate_grounded_answer(self, query: str, context: str, sources: List[GroundedSource]) -> str:
        """Calls Gemini API or formats an exact grounded answer."""
        system_instruction = (
            "You are HostelIQ AI, an intelligent university hostel policy assistant. "
            "You MUST answer the question using ONLY the approved hostel document excerpts provided below. "
            "Do NOT invent, assume, or generalize policies not present in the text. "
            "If the excerpts do not contain the answer, say: 'This information is not stated in the approved hostel documents.' "
            "Keep the tone formal, direct, and institutional."
        )

        user_prompt = f"""
Approved Document Context:
<approved_hostel_policy_documents>
{context}
</approved_hostel_policy_documents>

Student Question: {query}

Provide a concise, direct answer based strictly on the approved text above:
"""
        if self.client and hasattr(self.client, "models"):
            try:
                response = self.client.models.generate_content(
                    model=settings.GENERATIVE_MODEL,
                    contents=f"{system_instruction}\n\n{user_prompt}"
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                pass

        # Deterministic grounded synthesizer from retrieved excerpts
        points = []
        for s in sources:
            points.append(f"Based on **{s.document_title}** (Page {s.page_number}):\n{s.snippet}")
        
        return (
            f"Here is the verified policy information found in the official hostel records:\n\n"
            + "\n\n".join(points)
        )

    def _handle_mess_query(self, query: str, now_iso: str) -> RAGQueryResponse:
        """Direct structured PostgreSQL query for mess menu to prevent hallucination."""
        overview = db_service.get_overview()
        active_meal = overview.current_meal
        
        now = datetime.now()
        current_day = now.strftime("%A")
        
        day_menus = [m for m in db_service.mess_menus.values() if m.day_of_week == current_day]
        day_menus.sort(key=lambda x: x.start_time)

        lines = [f"**Mess Schedule for Today ({current_day})**:\n"]
        for m in day_menus:
            active_badge = " *(Serving Now)*" if m.is_active_now else ""
            items_str = ", ".join(m.items)
            lines.append(f"- **{m.meal_type}** ({m.start_time} – {m.end_time}){active_badge}:\n  {items_str}")

        lines.append("\n*Note: Timings and items are sourced directly from the authorized hostel mess roster.*")

        return RAGQueryResponse(
            query=query,
            answer="\n".join(lines),
            is_grounded=True,
            query_type="structured_menu",
            sources=[],
            generated_at=now_iso,
            suggested_followups=[
                "What are the mess dining hall timings?",
                "How do I apply for a mess rebate?",
                "Can I take meals to my hostel room?"
            ]
        )

    def _handle_complaint_query(self, tracking_id: str, now_iso: str) -> RAGQueryResponse:
        """Direct structured PostgreSQL query for complaint status."""
        for c in db_service.complaints.values():
            if c.tracking_id == tracking_id:
                notes = f"\n- **Admin Remarks**: {c.admin_notes}" if c.admin_notes else ""
                ans = (
                    f"**Complaint Record Found: {c.tracking_id}**\n\n"
                    f"- **Category**: {c.category}\n"
                    f"- **Title**: {c.title}\n"
                    f"- **Current Status**: **{c.status}**\n"
                    f"- **Priority**: {c.priority}\n"
                    f"- **Room / Block**: {c.room_number}, {c.block_name}\n"
                    f"- **Submitted At**: {c.created_at[:10]}"
                    f"{notes}"
                )
                return RAGQueryResponse(
                    query=tracking_id,
                    answer=ans,
                    is_grounded=True,
                    query_type="structured_complaint",
                    sources=[],
                    generated_at=now_iso,
                    suggested_followups=[
                        "Submit a new maintenance complaint",
                        "View all my active complaints"
                    ]
                )
        return RAGQueryResponse(
            query=tracking_id,
            answer=f"No record was found in the database for tracking ID **{tracking_id}**. Please check the code format (e.g. `CMP-2026-0041`) or check your complaints list.",
            is_grounded=False,
            query_type="structured_complaint",
            sources=[],
            generated_at=now_iso,
            suggested_followups=["View all my active complaints"]
        )

rag_engine = RAGEngine()
