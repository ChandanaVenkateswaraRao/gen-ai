from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.schemas import AnnouncementItem, AnnouncementCreateRequest, UserBase
from routers.auth import require_admin
from services.db import db_service

router = APIRouter(prefix="/api/announcements", tags=["Announcements & Circulars"])

@router.get("", response_model=List[AnnouncementItem])
def list_announcements(category: Optional[str] = None):
    items = list(db_service.announcements.values())
    if category and category != "All":
        items = [i for i in items if i.category == category]
    # Sort pinned first, then newest created_at
    items.sort(key=lambda x: (not x.is_pinned, x.created_at), reverse=False)
    return items

@router.post("", response_model=AnnouncementItem)
def create_announcement(req: AnnouncementCreateRequest, admin: UserBase = Depends(require_admin)):
    data = req.model_dump()
    data["author_name"] = admin.full_name
    return db_service.create_announcement(data)

@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: str, admin: UserBase = Depends(require_admin)):
    success = db_service.delete_announcement(announcement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    return {"status": "success", "message": "Announcement removed."}
