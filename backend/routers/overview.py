from fastapi import APIRouter, Depends
from models.schemas import OperationalOverview, UserBase
from routers.auth import require_admin
from services.db import db_service

router = APIRouter(prefix="/api/overview", tags=["Operational Overview & System Metrics"])

@router.get("", response_model=OperationalOverview)
def get_operational_overview():
    """Returns actual counts and activity calculated directly from database records."""
    return db_service.get_overview()

@router.get("/audit-logs")
def get_audit_logs(admin: UserBase = Depends(require_admin)):
    """Returns audit log trail for administrator monitoring."""
    return {
        "logs": sorted(db_service.audit_logs, key=lambda x: x["timestamp"], reverse=True),
        "total_events": len(db_service.audit_logs)
    }
