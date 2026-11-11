from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.schemas import MessMenuItem, MessMenuUpdateRequest, UserBase
from routers.auth import require_admin
from services.db import db_service

router = APIRouter(prefix="/api/mess-menu", tags=["Mess Menu Management"])

@router.get("/weekly", response_model=List[MessMenuItem])
def get_weekly_schedule():
    return db_service.get_weekly_menu()

@router.get("/today", response_model=List[MessMenuItem])
def get_today_schedule():
    import datetime
    current_day = datetime.datetime.now().strftime("%A")
    weekly = db_service.get_weekly_menu()
    return [m for m in weekly if m.day_of_week == current_day]

@router.put("/update", response_model=MessMenuItem)
def update_meal_slot(req: MessMenuUpdateRequest, admin: UserBase = Depends(require_admin)):
    return db_service.update_menu_item(
        day=req.day_of_week,
        meal=req.meal_type,
        items=req.items,
        dietary=req.dietary_info.model_dump(),
        start_time=req.start_time,
        end_time=req.end_time
    )
