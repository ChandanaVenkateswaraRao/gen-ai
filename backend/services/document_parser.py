import os
import re
from typing import List, Dict, Any

class DocumentParser:
    @staticmethod
    def parse_markdown(content: str, title: str, doc_id: str) -> List[Dict[str, Any]]:
        """Splits markdown by sections (H2 ## or H3 ###) to produce clean chunks with page/section numbers."""
        chunks = []
        sections = re.split(r'\n(?=##\s+)', content)
        
        chunk_idx = 0
        for sec in sections:
            sec = sec.strip()
            if not sec:
                continue
            
            # Detect section header
            lines = sec.split('\n')
            first_line = lines[0].strip('# ').strip()
            
            # If section is very long, sub-chunk by paragraphs
            if len(sec) > 1200:
                paras = sec.split('\n\n')
                current_chunk = f"Section: {first_line}\n"
                for para in paras:
                    if len(current_chunk) + len(para) > 1000:
                        chunks.append({
                            "id": f"{doc_id}_chunk_{chunk_idx}",
                            "document_id": doc_id,
                            "content": current_chunk.strip(),
                            "page_number": chunk_idx // 2 + 1,
                            "chunk_index": chunk_idx,
                            "metadata": {"section": first_line, "doc_title": title}
                        })
                        chunk_idx += 1
                        current_chunk = f"Section: {first_line}\n" + para + "\n"
                    else:
                        current_chunk += para + "\n\n"
                if current_chunk.strip():
                    chunks.append({
                        "id": f"{doc_id}_chunk_{chunk_idx}",
                        "document_id": doc_id,
                        "content": current_chunk.strip(),
                        "page_number": chunk_idx // 2 + 1,
                        "chunk_index": chunk_idx,
                        "metadata": {"section": first_line, "doc_title": title}
                    })
                    chunk_idx += 1
            else:
                chunks.append({
                    "id": f"{doc_id}_chunk_{chunk_idx}",
                    "document_id": doc_id,
                    "content": sec,
                    "page_number": chunk_idx // 2 + 1,
                    "chunk_index": chunk_idx,
                    "metadata": {"section": first_line, "doc_title": title}
                })
                chunk_idx += 1
                
        return chunks

    @staticmethod
    def parse_pdf(file_bytes: bytes, title: str, doc_id: str) -> List[Dict[str, Any]]:
        """Parses PDF bytes using pypdf if available, splitting by page and paragraph."""
        chunks = []
        try:
            import io
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            chunk_idx = 0
            for page_num, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""
                text = text.strip()
                if not text:
                    continue
                # Split large page into chunks of ~800 chars
                paras = text.split("\n\n")
                buf = ""
                for p in paras:
                    if len(buf) + len(p) > 900:
                        chunks.append({
                            "id": f"{doc_id}_chunk_{chunk_idx}",
                            "document_id": doc_id,
                            "content": buf.strip(),
                            "page_number": page_num,
                            "chunk_index": chunk_idx,
                            "metadata": {"doc_title": title, "page": page_num}
                        })
                        chunk_idx += 1
                        buf = p + "\n"
                    else:
                        buf += p + "\n\n"
                if buf.strip():
                    chunks.append({
                        "id": f"{doc_id}_chunk_{chunk_idx}",
                        "document_id": doc_id,
                        "content": buf.strip(),
                        "page_number": page_num,
                        "chunk_index": chunk_idx,
                        "metadata": {"doc_title": title, "page": page_num}
                    })
                    chunk_idx += 1
        except Exception as e:
            # Fallback if pypdf is unavailable or failed
            text = file_bytes.decode('utf-8', errors='ignore')
            chunks = DocumentParser.parse_markdown(text, title, doc_id)
        return chunks
