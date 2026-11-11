from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    id: str
    email: str
    full_name: str
    role: Literal["student", "admin"]
    room_number: Optional[str] = None
    block_name: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Literal["student", "admin"]] = None

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: Literal["student", "admin"] = "student"
    room_number: Optional[str] = None
    block_name: Optional[str] = None

# RAG & Document Schemas
class DocumentChunk(BaseModel):
    id: str
    document_id: str
    content: str
    page_number: int = 1
    chunk_index: int
    similarity: Optional[float] = None
    metadata: Dict[str, Any] = {}

class GroundedSource(BaseModel):
    document_id: str
    document_title: str
    page_number: int
    chunk_index: int
    similarity: float
    snippet: str

class RAGQueryRequest(BaseModel):
    query: str
    conversation_history: List[Dict[str, str]] = []

class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    is_grounded: bool
    query_type: Literal["policy_rag", "structured_menu", "structured_complaint", "general"]
    sources: List[GroundedSource] = []
    generated_at: str
    suggested_followups: List[str] = []

class DocumentMetadata(BaseModel):
    id: str
    title: str
    file_name: str
    file_size: int
    category: Literal["Rules & Discipline", "Mess & Dining", "Facilities & Maintenance", "Hostel Admissions", "General Notice"]
    status: Literal["processing", "indexed", "error"] = "indexed"
    chunk_count: int = 0
    error_message: Optional[str] = None
    created_at: str

# Mess Menu Schemas
class DietaryInfo(BaseModel):
    veg: bool = True
    egg: bool = False
    dairy: bool = True
    jain: bool = False

class MessMenuItem(BaseModel):
    id: str
    day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    meal_type: Literal["Breakfast", "Lunch", "Snacks", "Dinner"]
    start_time: str
    end_time: str
    items: List[str]
    dietary_info: DietaryInfo
    is_active_now: bool = False

class MessMenuUpdateRequest(BaseModel):
    day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    meal_type: Literal["Breakfast", "Lunch", "Snacks", "Dinner"]
    start_time: str
    end_time: str
    items: List[str]
    dietary_info: DietaryInfo

# Announcements Schemas
class AnnouncementItem(BaseModel):
    id: str
    title: str
    content: str
    category: Literal["General", "Maintenance", "Mess", "Urgent"]
    priority: Literal["Normal", "High", "Urgent"]
    is_pinned: bool = False
    target_audience: Literal["all", "students", "admins"] = "all"
    author_name: str
    created_at: str

class AnnouncementCreateRequest(BaseModel):
    title: str
    content: str
    category: Literal["General", "Maintenance", "Mess", "Urgent"]
    priority: Literal["Normal", "High", "Urgent"] = "Normal"
    is_pinned: bool = False
    target_audience: Literal["all", "students", "admins"] = "all"

# Complaints Schemas
ComplaintStatus = Literal["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"]
ComplaintCategory = Literal["Electrical", "Plumbing", "Carpentry", "Cleanliness", "Mess", "Internet", "Other"]
ComplaintPriority = Literal["Low", "Medium", "High", "Urgent"]

class ComplaintCreateRequest(BaseModel):
    category: ComplaintCategory
    title: str
    description: str
    priority: ComplaintPriority = "Medium"
    room_number: str
    block_name: str
    student_name: str
    student_id: Optional[str] = None

class ComplaintStatusUpdateRequest(BaseModel):
    status: ComplaintStatus
    admin_notes: Optional[str] = None

class ComplaintItem(BaseModel):
    id: str
    tracking_id: str
    student_id: Optional[str] = None
    student_name: str
    room_number: str
    block_name: str
    category: ComplaintCategory
    title: str
    description: str
    priority: ComplaintPriority
    status: ComplaintStatus
    admin_notes: Optional[str] = None
    resolved_at: Optional[str] = None
    created_at: str
    updated_at: str

# Overview & Analytics Schemas
class OperationalOverview(BaseModel):
    total_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    active_announcements: int
    indexed_documents: int
    total_chunks: int
    current_meal: Optional[MessMenuItem] = None
    recent_complaints: List[ComplaintItem] = []
    recent_announcements: List[AnnouncementItem] = []
    is_demo_mode: bool = True
