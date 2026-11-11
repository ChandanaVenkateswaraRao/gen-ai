import os
import uuid
import re
from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Optional
from models.schemas import UserBase, UserLoginRequest
from services.db import db_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

CREDENTIALS_STORE = {
    "warden@university.edu": ("admin_1", "admin123"),
    "admin@university.edu": ("admin_1", "admin123"),
    "warden": ("admin_1", "admin123"),
    "rohan.sharma@student.edu": ("student_1", "student123"),
    "student@university.edu": ("student_1", "student123"),
    "rohan": ("student_1", "student123"),
    "ananya.iyer@student.edu": ("student_2", "student123"),
    "ananya": ("student_2", "student123"),
}

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true" or os.getenv("ENVIRONMENT", "").lower() == "demo"


def _make_demo_user(email: str, role: str) -> UserBase:
    local_part = email.split("@")[0]
    display_name = local_part.replace(".", " ").replace("_", " ").title()
    return UserBase(
        id=str(uuid.uuid4()),
        email=email,
        full_name=display_name,
        role=role,  # type: ignore
    )


def get_current_user(x_user_id: Optional[str] = Header(default="s0000000-0000-0000-0000-000000000001")) -> UserBase:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Authentication credentials required.")
    for u in db_service.users.values():
        if u.id == x_user_id:
            return u
    raise HTTPException(status_code=401, detail="Invalid user session. Please log in again.")

def require_admin(user: UserBase = Depends(get_current_user)) -> UserBase:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: Institutional Administrator privileges required.")
    return user

@router.post("/login", response_model=UserBase)
def login(req: UserLoginRequest):
    identifier = (req.email or "").strip()
    provided_password = req.password
    requested_role = (req.role or "student").strip().lower()

    # Validate email format
    if not identifier:
        raise HTTPException(status_code=400, detail="Email address is required.")
    if not EMAIL_REGEX.match(identifier):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    # Validate password
    if not provided_password:
        raise HTTPException(status_code=400, detail="Password is required.")
    if len(provided_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    # Check MongoDB users collection first
    norm = identifier.lower()
    user_doc = None
    if db_service.db is not None:
        try:
            user_doc = db_service.db["users"].find_one({
                "$or": [
                    {"email": {"$regex": f"^{re.escape(norm)}$", "$options": "i"}},
                    {"id": norm},
                    {"_key": norm}
                ]
            })
        except Exception:
            user_doc = None

    if user_doc:
        expected_password = user_doc.get("password")
        if not expected_password and norm in CREDENTIALS_STORE:
            expected_password = CREDENTIALS_STORE[norm][1]

        if expected_password:
            if provided_password == expected_password:
                user_copy = dict(user_doc)
                user_copy.pop("_id", None)
                user_copy.pop("_key", None)
                user_copy.pop("password", None)
                return UserBase(**user_copy)
            else:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid institutional credentials. Please check your email/identifier and password."
                )

    # Fallback to in-memory CREDENTIALS_STORE
    if norm in CREDENTIALS_STORE:
        user_key, valid_password = CREDENTIALS_STORE[norm]
        if provided_password == valid_password:
            user = db_service.users.get(user_key)
            if not user:
                for u in db_service.users.values():
                    if u.email.lower() == norm or u.id == user_key:
                        user = u
                        break
            if user:
                return user
        else:
            raise HTTPException(
                status_code=401,
                detail="Invalid institutional credentials. Please check your email/identifier and password."
            )

    if DEMO_MODE:
        # Development/demo mode: accept any other syntactically valid email
        # and any password with at least 8 characters. Role is client-selected.
        role = "admin" if requested_role == "admin" else "student"
        user = _make_demo_user(identifier, role)
        # Register so session-dependent routes can resolve it
        db_service.users[user.id] = user
        return user

    raise HTTPException(
        status_code=401,
        detail="Invalid institutional credentials. Please check your email/identifier and password."
    )

@router.get("/me", response_model=UserBase)
def get_me(user: UserBase = Depends(get_current_user)):
    return user

@router.get("/accounts", response_model=list[UserBase])
def list_accounts():
    """Returns available institutional test accounts."""
    return list(db_service.users.values())
