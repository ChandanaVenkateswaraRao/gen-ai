from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.schemas import (
    ComplaintItem, ComplaintCreateRequest, ComplaintStatusUpdateRequest, UserBase
)
from routers.auth import get_current_user, require_admin
from services.db import db_service

router = APIRouter(prefix="/api/complaints", tags=["Complaints & Grievance Tracking"])

@router.get("", response_model=List[ComplaintItem])
def list_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    user: UserBase = Depends(get_current_user)
):
    items = list(db_service.complaints.values())
    
    # If student, limit to their own complaints
    if user.role == "student":
        items = [c for c in items if c.student_id == user.id or c.student_name == user.full_name]

    if status and status != "All":
        items = [c for c in items if c.status == status]
    if category and category != "All":
        items = [c for c in items if c.category == category]

    # Sort newest first
    items.sort(key=lambda x: x.created_at, reverse=True)
    return items

@router.post("", response_model=ComplaintItem)
def submit_complaint(
    req: ComplaintCreateRequest,
    user: UserBase = Depends(get_current_user)
):
    if not req.title.strip() or not req.description.strip():
        raise HTTPException(status_code=400, detail="Title and description are required.")

    data = req.model_dump()
    data["student_id"] = user.id
    data["student_name"] = user.full_name
    data["room_number"] = req.room_number or user.room_number or "Unassigned"
    data["block_name"] = req.block_name or user.block_name or "General Hostel Block"

    created = db_service.create_complaint(data)
    return created

@router.get("/{identifier}", response_model=ComplaintItem)
def get_complaint_by_id_or_tracking(identifier: str):
    # Try by tracking id or internal id
    for c in db_service.complaints.values():
        if c.tracking_id.lower() == identifier.lower() or c.id == identifier:
            return c
    raise HTTPException(status_code=404, detail=f"Complaint '{identifier}' not found.")

@router.patch("/{complaint_id}/status", response_model=ComplaintItem)
def update_complaint_status(
    complaint_id: str,
    req: ComplaintStatusUpdateRequest,
    admin: UserBase = Depends(require_admin)
):
    updated = db_service.update_complaint_status(
        complaint_id=complaint_id,
        status=req.status,
        admin_notes=req.admin_notes
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Complaint record not found.")
    return updated
