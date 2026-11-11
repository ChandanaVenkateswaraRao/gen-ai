import os
import uuid
import re
from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
from models.schemas import UserBase, UserLoginRequest, UserRegisterRequest
from services.db import db_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

CREDENTIALS_STORE = {
    "warden@klu.ac.in": ("admin_1", "admin123"),
    "admin@klu.ac.in": ("admin_1", "admin123"),
    "rohan.sharma@klu.ac.in": ("student_1", "student123"),
    "student@klu.ac.in": ("student_1", "student123"),
    "ananya.iyer@klu.ac.in": ("student_2", "student123"),
    # Legacy aliases
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

    norm = identifier.lower().strip()

    # Enforce @klu.ac.in domain constraint
    if not norm.endswith("@klu.ac.in") and norm not in CREDENTIALS_STORE:
        raise HTTPException(
            status_code=400,
            detail="Institutional email required. Email must end with @klu.ac.in"
        )

    # Validate password
    if not provided_password:
        raise HTTPException(status_code=400, detail="Password is required.")
    if len(provided_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    # Check MongoDB users collection first
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
                _mongo_id = str(user_copy.pop("_id", ""))
                user_copy.pop("_key", None)
                user_copy.pop("password", None)
                if not user_copy.get("id"):
                    user_copy["id"] = _mongo_id or str(uuid.uuid4())
                if not user_copy.get("full_name"):
                    local_part = norm.split("@")[0]
                    user_copy["full_name"] = local_part.replace(".", " ").title()
                if user_copy.get("role") not in ["student", "admin"]:
                    user_copy["role"] = requested_role if requested_role in ["student", "admin"] else "student"
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

@router.post("/register", response_model=UserBase, status_code=201)
def register(req: UserRegisterRequest):
    email = (req.email or "").strip().lower()
    password = req.password or ""
    full_name = (req.full_name or "").strip()
    requested_role = (req.role or "student").strip().lower()
    role = "admin" if requested_role == "admin" else "student"
    room_number = (req.room_number or "").strip()
    block_name = (req.block_name or "").strip()

    # 1. Validate email format & @klu.ac.in constraint
    if not email:
        raise HTTPException(status_code=400, detail="Email address is required.")
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if not email.endswith("@klu.ac.in"):
        raise HTTPException(
            status_code=400,
            detail="Institutional email required. Email must end with @klu.ac.in"
        )

    # 2. Validate password
    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    # 3. Validate full name
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required.")

    # 4. Check if user already exists
    if db_service.db is not None:
        existing = db_service.db["users"].find_one({
            "email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}
        })
        if existing:
            raise HTTPException(
                status_code=409,
                detail="An account with this email address already exists. Please sign in instead."
            )
    else:
        for u in db_service.users.values():
            if u.email.lower() == email:
                raise HTTPException(
                    status_code=409,
                    detail="An account with this email address already exists. Please sign in instead."
                )

    # 5. Create new user document
    new_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "id": new_id,
        "email": email,
        "full_name": full_name,
        "role": role,
        "room_number": room_number or ("Unassigned" if role == "student" else "Administrative Office"),
        "block_name": block_name or ("Hostel Block" if role == "student" else "Administrative Block"),
        "password": password,
        "created_at": now_iso
    }

    created_user = UserBase(
        id=new_id,
        email=email,
        full_name=full_name,
        role=role,  # type: ignore
        room_number=user_doc["room_number"],
        block_name=user_doc["block_name"]
    )

    if db_service.db is not None:
        db_service.db["users"].insert_one(user_doc)
        db_service.users._memory_cache[new_id] = created_user
    else:
        db_service.users[new_id] = created_user

    CREDENTIALS_STORE[email] = (new_id, password)
    db_service.log_audit("user_registered", {"email": email, "role": role})

    return created_user

@router.get("/me", response_model=UserBase)
def get_me(user: UserBase = Depends(get_current_user)):
    return user

@router.get("/accounts", response_model=list[UserBase])
def list_accounts():
    """Returns available institutional test accounts."""
    return list(db_service.users.values())
