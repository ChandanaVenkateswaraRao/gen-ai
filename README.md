# HostelIQ AI — Intelligent Hostel & Mess Management Assistant

A production-quality web application designed for university residential administration, combining **Retrieval-Augmented Generation (RAG)**, approved policy verification, structured mess menu management, official announcements, and verified complaint lifecycle tracking.

---

## 1. Visual Design Philosophy & Standards

HostelIQ AI is built with a restrained, authoritative institutional design language inspired by clean university administration software:

* **Primary Background**: Warm off-white (`#F7F7F4`)
* **Content Surfaces**: Pure white (`#FFFFFF`)
* **Primary Text**: Charcoal (`#202421`)
* **Secondary Text**: Muted slate gray (`#737873`)
* **Primary Accent**: Forest green (`#245C46`)
* **Borders**: Subtle 1px neutral gray (`#E2E5E0`)
* **Status Badges**: Distinct accessible tones (Green `#1E6B43`, Amber `#B26A00`, Red `#B91C1C`, Slate `#334155`)
* **Corner Radius**: Modest rectangular controls (`5px` to `8px`, `rounded-md`) — **Strictly zero pill buttons**
* **Icons**: Lucide line icons exclusively — **Strictly zero emojis**
* **Data Integrity**: Zero fabricated metrics, fake testimonials, or decorative charts. All counts derive from active database tables.

---

## 2. System Architecture

```
HostelIQ AI/
├── backend/
│   ├── config.py                 # Environment and application configuration
│   ├── main.py                   # FastAPI gateway with CORS & routers
│   ├── models/schemas.py         # Pydantic v2 schemas for all entities
│   ├── services/
│   │   ├── db.py                 # Structured repository & operational metrics
│   │   ├── document_parser.py    # PDF and Markdown semantic chunker
│   │   └── rag_engine.py         # Gemini SDK + vector similarity engine & intent router
│   ├── routers/
│   │   ├── auth.py               # Persona session & role guards
│   │   ├── rag.py                # Policy search & evidence inspector endpoints
│   │   ├── documents.py          # Document upload & chunk management
│   │   ├── mess_menu.py          # 7-day dining roster & admin schedule editor
│   │   ├── announcements.py      # Official circulars & publisher desk
│   │   ├── complaints.py         # Confirmed complaint tracking & triage
│   │   └── overview.py           # Real operational metrics & audit trail
│   └── data/seed_docs/           # Authentic hostel policy handbooks
│
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js 15 App Router pages
│   │   │   ├── layout.tsx        # Institutional app shell with Sidebar & Header
│   │   │   ├── page.tsx          # Real database operational overview
│   │   │   ├── ask/              # Grounded RAG policy assistant with evidence drawer
│   │   │   ├── mess-menu/        # Weekly dining schedule matrix
│   │   │   ├── announcements/    # Official circulars notice board
│   │   │   ├── complaints/       # Grievance desk with DB-verified tracking IDs
│   │   │   └── admin/            # Role-protected administrative desk
│   │   │       ├── page.tsx      # Admin overview & triage queue
│   │   │       ├── documents/    # Document ingestion & chunk vector inspector
│   │   │       ├── mess-editor/  # Weekly schedule editor & meal authoring
│   │   │       ├── announcements/# Notice publisher & pinned broadcast
│   │   │       ├── complaints/   # Work order triage & technician remarks
│   │   │       └── logs/         # System audit trail & ingestion logs
│   │   ├── components/           # Sidebar, Header, EvidenceDrawer
│   │   ├── context/AppContext.tsx# Role switcher (Student / Administrator)
│   │   ├── lib/api.ts            # Typed client connecting to FastAPI
│   │   └── types/index.ts        # TypeScript definitions
│   └── tailwind.config.ts        # Custom institutional color tokens
│
└── database/
    ├── mongo_setup.py            # MongoDB setup and seeding script
    ├── README.md                 # MongoDB collection schemas & index details
    ├── schema.sql                # Legacy PostgreSQL reference schema
    └── seed.sql                  # Institutional demonstration data reference
```

---

## 3. RAG Architecture & Grounding Principles

1. **Approved Document Ingestion**:
   - Supports PDF, Markdown, and TXT files.
   - Text is split into semantic chunks with metadata (document title, page number, chunk index).
   - Generates 768-dimensional embeddings using Google Gemini `text-embedding-004` (with automated high-fidelity local vector cosine search fallback).
2. **Intent Classification & Query Router**:
   - **Dining inquiries** ("What is for lunch today?", "Mess timings") automatically route to the structured `mess_menus` database table to guarantee **0% hallucination**.
   - **Complaint tracking** ("Status of CMP-2026-0041") routes to the structured `complaints` database table.
   - **Policy inquiries** execute vector similarity retrieval across approved document chunks.
3. **Grounded Answer Synthesis**:
   - System prompts strictly fence untrusted document context (`<approved_hostel_policy_documents>...</approved_hostel_policy_documents>`).
   - If no document chunk exceeds the similarity threshold, the system displays an explicit no-evidence disclaimer rather than fabricating an answer.
4. **Inspect Retrieved Evidence**:
   - Students and administrators can click "Inspect Evidence" to examine verbatim text chunks, page numbers, and cosine relevance scores in a slide-out panel.

---

## 4. Getting Started

### Prerequisites
* Python 3.10+ (Tested on Python 3.13)
* Node.js 18+ (Tested on Node.js v22)

### Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Configure `.env` with your Gemini API key and MongoDB URI:
   ```bash
   cp .env.example .env
   # Edit .env and set MONGO_URI=mongodb://localhost:27017/hosteliq and GEMINI_API_KEY
   ```
   *Note: Database collections and default seed records are automatically initialized into MongoDB on backend startup or via `python ../database/mongo_setup.py`.*
3. Start the FastAPI server:
   ```bash
   python main.py
   ```
   Backend will be active at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### Frontend Setup
1. Open a separate terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open `http://localhost:3000` in your web browser.

---

## 5. Dual Personas for Evaluation

Use the **Access Role** switcher in the sidebar to seamlessly test both workflows:
* **Student View**: Rohan Sharma (Room B-304, Block B)
  - Ask policy questions with document citations
  - View today's active meal and 7-day schedule
  - Submit complaints and receive database-confirmed tracking codes (`CMP-2026-XXXX`)
* **Administrator View**: Prof. Arthur Pendelton (Chief Warden)
  - Upload approved policy documents and inspect chunks
  - Triage complaints and update statuses with technician remarks
  - Edit mess menus and modify serving hours
  - Broadcast official pinned circulars
  - Review immutable audit and ingestion logs
