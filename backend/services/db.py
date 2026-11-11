import os
import re
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Type, TypeVar, Generic, Iterator
import numpy as np

import pymongo
from pymongo import MongoClient, ASCENDING, DESCENDING

from config import settings
from models.schemas import (
    UserBase, DocumentMetadata, DocumentChunk, GroundedSource,
    MessMenuItem, DietaryInfo, AnnouncementItem, ComplaintItem,
    ComplaintStatus, OperationalOverview
)

logger = logging.getLogger("hosteliq.db")

T = TypeVar("T")

class MongoCollectionDict(Generic[T]):
    """
    Dict-like wrapper backed by a MongoDB collection.
    Provides backward-compatibility with dict syntax (.values(), [k], get(), pop())
    while persisting all operations directly to MongoDB.
    Falls back gracefully to an in-memory dictionary if MongoDB is disconnected.
    """
    def __init__(self, collection: Optional[pymongo.collection.Collection], model_class: Optional[Type[T]] = None, key_field: str = "id"):
        self.collection = collection
        self.model_class = model_class
        self.key_field = key_field
        self._memory_cache: Dict[str, Any] = {}

    def _to_model(self, doc: Dict[str, Any]) -> Any:
        if not doc:
            return None
        doc_copy = dict(doc)
        doc_copy.pop("_id", None)
        _key = doc_copy.pop("_key", None)
        if self.model_class:
            try:
                return self.model_class(**doc_copy)
            except Exception:
                return doc_copy
        return doc_copy

    def _to_doc(self, value: Any, key: str) -> Dict[str, Any]:
        if hasattr(value, "model_dump"):
            data = value.model_dump()
        elif hasattr(value, "dict"):
            data = value.dict()
        elif isinstance(value, dict):
            data = dict(value)
        else:
            data = {"value": value}
        data["_key"] = key
        if self.key_field not in data or not data[self.key_field]:
            data[self.key_field] = key
        return data

    def __getitem__(self, key: str) -> T:
        if self.collection is not None:
            try:
                doc = self.collection.find_one({"$or": [{self.key_field: key}, {"_key": key}]})
                if doc:
                    return self._to_model(doc)
            except Exception as e:
                logger.warning(f"MongoDB read error for key {key}: {e}")
        if key in self._memory_cache:
            return self._memory_cache[key]
        raise KeyError(key)

    def __setitem__(self, key: str, value: Any):
        self._memory_cache[key] = value
        if self.collection is not None:
            try:
                doc = self._to_doc(value, key)
                self.collection.replace_one(
                    {"$or": [{self.key_field: key}, {"_key": key}]},
                    doc,
                    upsert=True
                )
            except Exception as e:
                logger.warning(f"MongoDB write error for key {key}: {e}")

    def __delitem__(self, key: str):
        self._memory_cache.pop(key, None)
        if self.collection is not None:
            try:
                self.collection.delete_one({"$or": [{self.key_field: key}, {"_key": key}]})
            except Exception as e:
                logger.warning(f"MongoDB delete error for key {key}: {e}")

    def __contains__(self, key: str) -> bool:
        if key in self._memory_cache:
            return True
        if self.collection is not None:
            try:
                count = self.collection.count_documents({"$or": [{self.key_field: key}, {"_key": key}]}, limit=1)
                return count > 0
            except Exception:
                pass
        return False

    def __len__(self) -> int:
        if self.collection is not None:
            try:
                return self.collection.count_documents({})
            except Exception:
                pass
        return len(self._memory_cache)

    def get(self, key: str, default: Any = None) -> Optional[T]:
        try:
            return self[key]
        except KeyError:
            return default

    def values(self) -> List[T]:
        if self.collection is not None:
            try:
                cursor = self.collection.find({})
                return [self._to_model(doc) for doc in cursor]
            except Exception as e:
                logger.warning(f"MongoDB values error: {e}")
        return list(self._memory_cache.values())

    def items(self) -> List[tuple[str, T]]:
        if self.collection is not None:
            try:
                cursor = self.collection.find({})
                items = []
                for doc in cursor:
                    k = doc.get("_key") or doc.get(self.key_field)
                    items.append((k, self._to_model(doc)))
                return items
            except Exception as e:
                logger.warning(f"MongoDB items error: {e}")
        return list(self._memory_cache.items())

    def keys(self) -> List[str]:
        if self.collection is not None:
            try:
                cursor = self.collection.find({}, {self.key_field: 1, "_key": 1})
                return [doc.get("_key") or doc.get(self.key_field) for doc in cursor]
            except Exception:
                pass
        return list(self._memory_cache.keys())

    def pop(self, key: str, default: Any = None) -> Optional[T]:
        val = self.get(key, default)
        if key in self:
            del self[key]
        return val

    def clear(self):
        self._memory_cache.clear()
        if self.collection is not None:
            try:
                self.collection.delete_many({})
            except Exception:
                pass


class MongoAuditLogList:
    """Wrapper for audit_logs collection that behaves like a list."""
    def __init__(self, collection: Optional[pymongo.collection.Collection]):
        self.collection = collection
        self._memory_list: List[Dict[str, Any]] = []

    def append(self, item: Dict[str, Any]):
        self._memory_list.append(item)
        if self.collection is not None:
            try:
                item_copy = dict(item)
                item_copy.pop("_id", None)
                self.collection.insert_one(item_copy)
            except Exception as e:
                logger.warning(f"MongoDB audit log insert error: {e}")

    def __iter__(self) -> Iterator[Dict[str, Any]]:
        if self.collection is not None:
            try:
                cursor = self.collection.find({}).sort("timestamp", DESCENDING)
                results = []
                for doc in cursor:
                    doc.pop("_id", None)
                    results.append(doc)
                return iter(results)
            except Exception:
                pass
        return iter(self._memory_list)

    def __len__(self) -> int:
        if self.collection is not None:
            try:
                return self.collection.count_documents({})
            except Exception:
                pass
        return len(self._memory_list)

    def __getitem__(self, index: int) -> Dict[str, Any]:
        return list(self)[index]


class MongoChunkVectors:
    """Stores vectors in memory for fast similarity computations and persists to MongoDB."""
    def __init__(self, chunks_col: Optional[pymongo.collection.Collection]):
        self.chunks_col = chunks_col
        self._vectors: Dict[str, np.ndarray] = {}

    def __getitem__(self, key: str) -> np.ndarray:
        if key in self._vectors:
            return self._vectors[key]
        if self.chunks_col is not None:
            try:
                doc = self.chunks_col.find_one({"id": key}, {"embedding": 1})
                if doc and "embedding" in doc and doc["embedding"]:
                    vec = np.array(doc["embedding"], dtype=np.float32)
                    self._vectors[key] = vec
                    return vec
            except Exception:
                pass
        raise KeyError(key)

    def __setitem__(self, key: str, value: np.ndarray):
        self._vectors[key] = value
        if self.chunks_col is not None:
            try:
                emb_list = value.tolist() if hasattr(value, "tolist") else list(value)
                self.chunks_col.update_one({"id": key}, {"$set": {"embedding": emb_list}})
            except Exception:
                pass

    def get(self, key: str, default: Any = None) -> Optional[np.ndarray]:
        try:
            return self[key]
        except KeyError:
            return default

    def pop(self, key: str, default: Any = None) -> Optional[np.ndarray]:
        val = self._vectors.pop(key, default)
        if self.chunks_col is not None:
            try:
                self.chunks_col.update_one({"id": key}, {"$unset": {"embedding": ""}})
            except Exception:
                pass
        return val

    def items(self):
        return self._vectors.items()


class DatabaseService:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[pymongo.database.Database] = None
        self.is_connected: bool = False
        self._init_mongo_connection()

        # Initialize collections proxies
        users_col = self.db["users"] if self.db is not None else None
        docs_col = self.db["documents"] if self.db is not None else None
        chunks_col = self.db["document_chunks"] if self.db is not None else None
        menus_col = self.db["mess_menus"] if self.db is not None else None
        announcements_col = self.db["announcements"] if self.db is not None else None
        complaints_col = self.db["complaints"] if self.db is not None else None
        audit_col = self.db["audit_logs"] if self.db is not None else None

        self.users: MongoCollectionDict[UserBase] = MongoCollectionDict(users_col, UserBase, key_field="id")
        self.documents: MongoCollectionDict[DocumentMetadata] = MongoCollectionDict(docs_col, DocumentMetadata, key_field="id")
        self.document_chunks: MongoCollectionDict[DocumentChunk] = MongoCollectionDict(chunks_col, DocumentChunk, key_field="id")
        self.chunk_vectors: MongoChunkVectors = MongoChunkVectors(chunks_col)
        self.mess_menus: MongoCollectionDict[MessMenuItem] = MongoCollectionDict(menus_col, MessMenuItem, key_field="id")
        self.announcements: MongoCollectionDict[AnnouncementItem] = MongoCollectionDict(announcements_col, AnnouncementItem, key_field="id")
        self.complaints: MongoCollectionDict[ComplaintItem] = MongoCollectionDict(complaints_col, ComplaintItem, key_field="id")
        self.audit_logs: MongoAuditLogList = MongoAuditLogList(audit_col)

        self._init_defaults()

    def _init_mongo_connection(self):
        mongo_uri = settings.MONGO_URI or "mongodb://localhost:27017/hosteliq"
        db_name = settings.MONGO_DB_NAME or "hosteliq"
        
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2500)
            # Test connectivity
            self.client.admin.command("ping")
            self.db = self.client[db_name]
            self.is_connected = True
            logger.info(f"Connected to MongoDB database '{db_name}' at {mongo_uri}")
            self._ensure_indexes()
        except Exception as e:
            logger.warning(f"Could not connect to MongoDB ({e}). Running with in-memory persistence fallback.")
            self.client = None
            self.db = None
            self.is_connected = False

    def _ensure_indexes(self):
        if self.db is None:
            return
        try:
            self.db["users"].create_index([("email", ASCENDING)], unique=True, sparse=True)
            self.db["users"].create_index([("id", ASCENDING)], unique=True)
            self.db["documents"].create_index([("id", ASCENDING)], unique=True)
            self.db["document_chunks"].create_index([("id", ASCENDING)], unique=True)
            self.db["document_chunks"].create_index([("document_id", ASCENDING)])
            self.db["mess_menus"].create_index([("id", ASCENDING)], unique=True)
            self.db["mess_menus"].create_index([("day_of_week", ASCENDING), ("meal_type", ASCENDING)], unique=True)
            self.db["announcements"].create_index([("id", ASCENDING)], unique=True)
            self.db["complaints"].create_index([("id", ASCENDING)], unique=True)
            self.db["complaints"].create_index([("tracking_id", ASCENDING)], unique=True)
            self.db["complaints"].create_index([("student_id", ASCENDING)])
            self.db["audit_logs"].create_index([("id", ASCENDING)], unique=True)
            self.db["audit_logs"].create_index([("timestamp", DESCENDING)])
        except Exception as e:
            logger.warning(f"Error creating MongoDB indexes: {e}")

    def _init_defaults(self):
        # 1. Users
        if len(self.users) == 0:
            self.users["admin_1"] = {
                "id": "a0000000-0000-0000-0000-000000000001",
                "email": "warden@university.edu",
                "full_name": "Prof. Arthur Pendelton (Chief Warden)",
                "role": "admin",
                "room_number": "Office-101",
                "block_name": "Administrative Block",
                "password": "admin123"
            }
            self.users["student_1"] = {
                "id": "s0000000-0000-0000-0000-000000000001",
                "email": "rohan.sharma@student.edu",
                "full_name": "Rohan Sharma",
                "role": "student",
                "room_number": "B-304",
                "block_name": "Block B (Aryabhatta Hall)",
                "password": "student123"
            }
            self.users["student_2"] = {
                "id": "s0000000-0000-0000-0000-000000000002",
                "email": "ananya.iyer@student.edu",
                "full_name": "Ananya Iyer",
                "role": "student",
                "room_number": "G-112",
                "block_name": "Block G (Gargi Hall)",
                "password": "student123"
            }

        # 2. Approved Documents
        if len(self.documents) == 0:
            d1_id = "d0000000-0000-0000-0000-000000000001"
            self.documents[d1_id] = DocumentMetadata(
                id=d1_id,
                title="Hostel Rules & Regulations Handbook 2026",
                file_name="Hostel_Rules_and_Regulations_2026.pdf",
                file_size=248500,
                category="Rules & Discipline",
                status="indexed",
                chunk_count=4,
                created_at=datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc).isoformat()
            )

            d2_id = "d0000000-0000-0000-0000-000000000002"
            self.documents[d2_id] = DocumentMetadata(
                id=d2_id,
                title="Mess Dining Guidelines & Rebate Policy 2026",
                file_name="Mess_Guidelines_and_Rebate_Policy_2026.pdf",
                file_size=154200,
                category="Mess & Dining",
                status="indexed",
                chunk_count=3,
                created_at=datetime(2026, 1, 20, 14, 30, tzinfo=timezone.utc).isoformat()
            )

            d3_id = "d0000000-0000-0000-0000-000000000003"
            self.documents[d3_id] = DocumentMetadata(
                id=d3_id,
                title="Hostel Maintenance & Electrical Appliance Policy",
                file_name="Electrical_and_Maintenance_Policy.pdf",
                file_size=98400,
                category="Facilities & Maintenance",
                status="indexed",
                chunk_count=3,
                created_at=datetime(2026, 2, 5, 9, 15, tzinfo=timezone.utc).isoformat()
            )

        # 3. Seed Mess Menus (7 days x 4 meals)
        if len(self.mess_menus) == 0:
            days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            sample_schedule = {
                "Monday": {
                    "Breakfast": (["Idli & Medu Vada", "Coconut Chutney & Sambar", "Bread Butter Jam", "Tea & Coffee", "Boiled Eggs / Banana"], {"veg": True, "egg": True, "dairy": True, "jain": True}, "07:30", "09:30"),
                    "Lunch": (["Rajma Masala (Punjabi style)", "Jeera Rice", "Whole Wheat Chapati", "Aloo Gobhi Sabzi", "Boondi Raita", "Green Salad"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "12:15", "14:15"),
                    "Snacks": (["Vegetable Poha", "Roasted Peanuts & Sev", "Ginger Tea & Coffee"], {"veg": True, "egg": False, "dairy": True, "jain": True}, "17:00", "18:15"),
                    "Dinner": (["Dal Tadka", "Steamed Basmati Rice", "Paneer Butter Masala", "Mix Veg Korma", "Tawa Roti", "Gulab Jamun (1 pc)"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "19:45", "21:45")
                },
                "Tuesday": {
                    "Breakfast": (["Aloo Paratha with Curd", "Pickle", "Sprouts Salad", "Bread Butter", "Tea & Coffee"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "07:30", "09:30"),
                    "Lunch": (["Chole Masala", "Bhature / Steamed Rice", "Yellow Moong Dal", "Cucumber Onion Salad", "Sweet Lassi"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "12:15", "14:15"),
                    "Snacks": (["Bread Pakoda with Mint Chutney", "Biscuits", "Masala Tea & Coffee"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "17:00", "18:15"),
                    "Dinner": (["Egg Curry (non-veg) / Kadhai Paneer (veg)", "Dal Makhani", "Jeera Rice", "Phulka Roti", "Ice Cream Cup"], {"veg": True, "egg": True, "dairy": True, "jain": False}, "19:45", "21:45")
                },
                "Wednesday": {
                    "Breakfast": (["Masala Dosa with Sambar", "Tomato Chutney", "Oatmeal Porridge", "Boiled Eggs", "Tea & Coffee"], {"veg": True, "egg": True, "dairy": True, "jain": True}, "07:30", "09:30"),
                    "Lunch": (["Kadhi Pakora", "Khichdi & Steamed Rice", "Bhindi Do Pyaza", "Papad", "Pudina Raita"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "12:15", "14:15"),
                    "Snacks": (["Corn Chaat (Butter Salt & Pepper)", "Filter Coffee & Green Tea"], {"veg": True, "egg": False, "dairy": True, "jain": True}, "17:00", "18:15"),
                    "Dinner": (["Chicken Curry (non-veg) / Malai Kofta (veg)", "Dal Fry", "Peas Pulao", "Tandoori Roti", "Fruit Custard"], {"veg": True, "egg": True, "dairy": True, "jain": False}, "19:45", "21:45")
                },
                "Thursday": {
                    "Breakfast": (["Poori with Aloo Bhaji", "Suji Halwa", "Cut Fresh Papaya", "Tea & Coffee"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "07:30", "09:30"),
                    "Lunch": (["Dal Palak", "Veg Kolhapuri", "Steamed Rice", "Chapati", "Plain Curd", "Kachumber Salad"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "12:15", "14:15"),
                    "Snacks": (["Veg Cutlet with Tomato Ketchup", "Tea & Coffee"], {"veg": True, "egg": False, "dairy": True, "jain": True}, "17:00", "18:15"),
                    "Dinner": (["Sambar", "Curd Rice & Lemon Rice", "Potato Fry (Sukha)", "Chapati", "Semiyan Kheer"], {"veg": True, "egg": False, "dairy": True, "jain": True}, "19:45", "21:45")
                },
                "Friday": {
                    "Breakfast": (["Veg Upma with Coconut Chutney", "Boiled Chana Chaat", "Bread Omelette / Jam", "Tea & Coffee"], {"veg": True, "egg": True, "dairy": True, "jain": False}, "07:30", "09:30"),
                    "Lunch": (["Veg Biryani with Mirchi ka Salan", "Dal Tadka", "Raita", "Chapati", "Roasted Papad"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "12:15", "14:15"),
                    "Snacks": (["Samosa with Tamarind Chutney", "Chai & Lemon Tea"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "17:00", "18:15"),
                    "Dinner": (["Fish Curry / Shahi Paneer", "Dal Makhani", "Jeera Rice", "Butter Roti", "Moong Dal Halwa"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "19:45", "21:45")
                },
                "Saturday": {
                    "Breakfast": (["Uttapam (Onion & Tomato)", "Sambar & Chutney", "Boiled Eggs / Bananas", "Tea & Coffee"], {"veg": True, "egg": True, "dairy": True, "jain": True}, "07:30", "10:00"),
                    "Lunch": (["Kashmiri Dum Aloo", "Panchratan Dal", "Steamed Rice", "Phulka Roti", "Dahi Vada"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "12:15", "14:30"),
                    "Snacks": (["Bhelpuri / Sev Puri", "Tea & Coffee"], {"veg": True, "egg": False, "dairy": False, "jain": False}, "17:00", "18:15"),
                    "Dinner": (["Pav Bhaji with Butter Pav", "Veg Pulao with Raita", "Green Salad", "Rasgulla (1 pc)"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "19:45", "21:45")
                },
                "Sunday": {
                    "Breakfast": (["Paneer Paratha & Butter", "Curd & Pickle", "Cornflakes with Milk", "Tea & Coffee"], {"veg": True, "egg": False, "dairy": True, "jain": False}, "08:00", "10:30"),
                    "Lunch": (["Hyderabadi Chicken Biryani / Paneer Dum Biryani", "Mirchi Ka Salan", "Mix Veg Raita", "Onion Lemon Salad", "Gulab Jamun"], {"veg": True, "egg": True, "dairy": True, "jain": False}, "12:30", "14:45"),
                    "Snacks": (["Biscuits & Rusks", "Filter Coffee & Masala Chai"], {"veg": True, "egg": False, "dairy": True, "jain": True}, "17:00", "18:15"),
                    "Dinner": (["Light Khichdi / Steamed Rice", "Yellow Moong Dal", "Aloo Beans Sabzi", "Tawa Phulka", "Seasonal Fresh Fruit"], {"veg": True, "egg": False, "dairy": True, "jain": True}, "19:45", "21:45")
                }
            }

            for day in days:
                for meal, (items, dietary, start_t, end_t) in sample_schedule[day].items():
                    m_id = f"menu_{day.lower()}_{meal.lower()}"
                    self.mess_menus[m_id] = MessMenuItem(
                        id=m_id,
                        day_of_week=day, # type: ignore
                        meal_type=meal, # type: ignore
                        start_time=start_t,
                        end_time=end_t,
                        items=items,
                        dietary_info=DietaryInfo(**dietary)
                    )

        # 4. Announcements
        if len(self.announcements) == 0:
            a1_id = "c0000000-0000-0000-0000-000000000001"
            self.announcements[a1_id] = AnnouncementItem(
                id=a1_id,
                title="Mandatory Curfew Verification & Late Entry Gate Pass Protocol",
                content="All resident students are reminded that the main hostel gates close strictly at 10:30 PM. Any student requiring entry after 10:30 PM for genuine academic lab work or emergency travel must submit an approved Digital Late Pass signed by their project guide and hostel warden at least 4 hours in advance.",
                category="Urgent",
                priority="Urgent",
                is_pinned=True,
                target_audience="all",
                author_name="Prof. Arthur Pendelton (Chief Warden)",
                created_at=datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc).isoformat()
            )

            a2_id = "c0000000-0000-0000-0000-000000000002"
            self.announcements[a2_id] = AnnouncementItem(
                id=a2_id,
                title="Scheduled Electrical Maintenance in Block B & C",
                content="Routine maintenance and transformer testing will be conducted on Saturday between 09:00 AM and 01:00 PM. High-power appliances are strictly prohibited. Emergency elevator and corridor lighting will remain on backup inverter power.",
                category="Maintenance",
                priority="High",
                is_pinned=False,
                target_audience="all",
                author_name="Estate Office (Electrical Wing)",
                created_at=datetime(2026, 10, 27, 11, 30, tzinfo=timezone.utc).isoformat()
            )

            a3_id = "c0000000-0000-0000-0000-000000000003"
            self.announcements[a3_id] = AnnouncementItem(
                id=a3_id,
                title="Mess Rebate Application Deadline for End-Semester Break",
                content="Students leaving the campus for vacation must apply for mess rebate on the student portal at least 3 days prior to departure. A minimum continuous absence of 4 days is mandatory to qualify for dining bill deductions.",
                category="Mess",
                priority="Normal",
                is_pinned=False,
                target_audience="students",
                author_name="Mess Council Office",
                created_at=datetime(2026, 10, 28, 8, 15, tzinfo=timezone.utc).isoformat()
            )

        # 5. Complaints
        if len(self.complaints) == 0:
            c1_id = "e0000000-0000-0000-0000-000000000001"
            self.complaints[c1_id] = ComplaintItem(
                id=c1_id,
                tracking_id="CMP-2026-0041",
                student_id="s0000000-0000-0000-0000-000000000001",
                student_name="Rohan Sharma",
                room_number="B-304",
                block_name="Block B (Aryabhatta Hall)",
                category="Plumbing",
                title="Bathroom tap leakage causing continuous water drip",
                description="The cold water washbasin faucet in room B-304 does not shut off completely, wasting water and creating continuous dripping noise.",
                priority="Medium",
                status="In Progress",
                admin_notes="Plumber Jagdish assigned on Oct 27; replacement ceramic cartridge requisitioned.",
                resolved_at=None,
                created_at=datetime(2026, 10, 26, 14, 20, tzinfo=timezone.utc).isoformat(),
                updated_at=datetime(2026, 10, 27, 9, 45, tzinfo=timezone.utc).isoformat()
            )

            c2_id = "e0000000-0000-0000-0000-000000000002"
            self.complaints[c2_id] = ComplaintItem(
                id=c2_id,
                tracking_id="CMP-2026-0042",
                student_id="s0000000-0000-0000-0000-000000000001",
                student_name="Rohan Sharma",
                room_number="B-304",
                block_name="Block B (Aryabhatta Hall)",
                category="Internet",
                title="LAN port 2 connectivity intermittent",
                description="Study table wall ethernet port drops packets after 10-15 minutes of continuous connection. WiFi signal on 3rd floor west wing is also weak.",
                priority="Low",
                status="Submitted",
                admin_notes=None,
                resolved_at=None,
                created_at=datetime(2026, 10, 27, 16, 50, tzinfo=timezone.utc).isoformat(),
                updated_at=datetime(2026, 10, 27, 16, 50, tzinfo=timezone.utc).isoformat()
            )

            c3_id = "e0000000-0000-0000-0000-000000000003"
            self.complaints[c3_id] = ComplaintItem(
                id=c3_id,
                tracking_id="CMP-2026-0038",
                student_id="s0000000-0000-0000-0000-000000000002",
                student_name="Ananya Iyer",
                room_number="G-112",
                block_name="Block G (Gargi Hall)",
                category="Electrical",
                title="Ceiling fan regulator sparking on speed 3",
                description="The ceiling fan speed regulator is sparking when turned to speeds 3 and 4. Needs immediate replacement before use.",
                priority="High",
                status="Resolved",
                admin_notes="Electrician Mohan replaced faulty rotary switch with modular dimmer on Oct 26. Verified working safely.",
                resolved_at=datetime(2026, 10, 26, 17, 30, tzinfo=timezone.utc).isoformat(),
                created_at=datetime(2026, 10, 25, 11, 10, tzinfo=timezone.utc).isoformat(),
                updated_at=datetime(2026, 10, 26, 17, 30, tzinfo=timezone.utc).isoformat()
            )

    # ------------------ Operational Overview ------------------
    def get_overview(self) -> OperationalOverview:
        complaints_list = list(self.complaints.values())
        total = len(complaints_list)
        pending = sum(1 for c in complaints_list if c.status in ["Submitted", "Under Review"])
        in_prog = sum(1 for c in complaints_list if c.status == "In Progress")
        resolved = sum(1 for c in complaints_list if c.status == "Resolved")
        active_announcements = len(self.announcements)
        indexed_docs = sum(1 for d in self.documents.values() if d.status == "indexed")
        total_chunks = len(self.document_chunks)
        
        # Sort complaints by created_at descending
        recent_cmp = sorted(complaints_list, key=lambda x: x.created_at, reverse=True)[:5]
        recent_ann = sorted(list(self.announcements.values()), key=lambda x: (not x.is_pinned, x.created_at), reverse=False)[:5]

        # Determine current meal
        now = datetime.now()
        current_day = now.strftime("%A")
        current_time_str = now.strftime("%H:%M")
        current_meal = None

        for item in self.mess_menus.values():
            if item.day_of_week == current_day:
                if item.start_time <= current_time_str <= item.end_time:
                    current_meal = item.model_copy()
                    current_meal.is_active_now = True
                    break
        if not current_meal:
            # Default to next upcoming or lunch if outside range
            for item in self.mess_menus.values():
                if item.day_of_week == current_day and item.meal_type == "Lunch":
                    current_meal = item.model_copy()
                    break

        return OperationalOverview(
            total_complaints=total,
            pending_complaints=pending,
            in_progress_complaints=in_prog,
            resolved_complaints=resolved,
            active_announcements=active_announcements,
            indexed_documents=indexed_docs,
            total_chunks=total_chunks,
            current_meal=current_meal,
            recent_complaints=recent_cmp,
            recent_announcements=recent_ann,
            is_demo_mode=not self.is_connected
        )

    # ------------------ Complaints CRUD ------------------
    def create_complaint(self, data: Dict[str, Any]) -> ComplaintItem:
        # Generate sequential tracking code
        year = datetime.now().year
        next_seq = len(self.complaints) + 43
        tracking_id = f"CMP-{year}-{next_seq:04d}"
        now_iso = datetime.now(timezone.utc).isoformat()
        c_id = str(uuid.uuid4())

        item = ComplaintItem(
            id=c_id,
            tracking_id=tracking_id,
            student_id=data.get("student_id", "s0000000-0000-0000-0000-000000000001"),
            student_name=data["student_name"],
            room_number=data["room_number"],
            block_name=data["block_name"],
            category=data["category"],
            title=data["title"],
            description=data["description"],
            priority=data.get("priority", "Medium"),
            status="Submitted",
            admin_notes=None,
            resolved_at=None,
            created_at=now_iso,
            updated_at=now_iso
        )
        self.complaints[c_id] = item
        self.log_audit("complaint_created", {"tracking_id": tracking_id, "category": data["category"]})
        return item

    def update_complaint_status(self, complaint_id: str, status: ComplaintStatus, admin_notes: Optional[str]) -> Optional[ComplaintItem]:
        item = self.complaints.get(complaint_id)
        if not item:
            # check by tracking id
            for c in self.complaints.values():
                if c.tracking_id == complaint_id:
                    item = c
                    break
        if not item:
            return None

        now_iso = datetime.now(timezone.utc).isoformat()
        resolved_at = now_iso if status == "Resolved" else None
        updated_item = item.model_copy(update={
            "status": status,
            "admin_notes": admin_notes if admin_notes is not None else item.admin_notes,
            "resolved_at": resolved_at,
            "updated_at": now_iso
        })
        self.complaints[item.id] = updated_item
        self.log_audit("complaint_status_updated", {"tracking_id": item.tracking_id, "new_status": status})
        return updated_item

    # ------------------ Mess Menu CRUD ------------------
    def get_weekly_menu(self) -> List[MessMenuItem]:
        days_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        meals_order = ["Breakfast", "Lunch", "Snacks", "Dinner"]
        now = datetime.now()
        current_day = now.strftime("%A")
        current_time_str = now.strftime("%H:%M")

        results = []
        for day in days_order:
            for meal in meals_order:
                m_id = f"menu_{day.lower()}_{meal.lower()}"
                item = self.mess_menus.get(m_id)
                if item:
                    item_copy = item.model_copy()
                    if day == current_day and (item_copy.start_time <= current_time_str <= item_copy.end_time):
                        item_copy.is_active_now = True
                    results.append(item_copy)
        return results

    def update_menu_item(self, day: str, meal: str, items: List[str], dietary: Dict[str, Any], start_time: str, end_time: str) -> MessMenuItem:
        m_id = f"menu_{day.lower()}_{meal.lower()}"
        item = MessMenuItem(
            id=m_id,
            day_of_week=day, # type: ignore
            meal_type=meal, # type: ignore
            start_time=start_time,
            end_time=end_time,
            items=items,
            dietary_info=DietaryInfo(**dietary)
        )
        self.mess_menus[m_id] = item
        self.log_audit("menu_updated", {"day": day, "meal": meal})
        return item

    # ------------------ Announcements CRUD ------------------
    def create_announcement(self, data: Dict[str, Any]) -> AnnouncementItem:
        a_id = str(uuid.uuid4())
        item = AnnouncementItem(
            id=a_id,
            title=data["title"],
            content=data["content"],
            category=data["category"],
            priority=data.get("priority", "Normal"),
            is_pinned=data.get("is_pinned", False),
            target_audience=data.get("target_audience", "all"),
            author_name=data.get("author_name", "Hostel Administration"),
            created_at=datetime.now(timezone.utc).isoformat()
        )
        self.announcements[a_id] = item
        self.log_audit("announcement_created", {"title": item.title, "priority": item.priority})
        return item

    def delete_announcement(self, a_id: str) -> bool:
        if a_id in self.announcements:
            del self.announcements[a_id]
            self.log_audit("announcement_deleted", {"id": a_id})
            return True
        return False

    # ------------------ Audit & Logs ------------------
    def log_audit(self, event_type: str, details: Dict[str, Any], status: str = "success"):
        self.audit_logs.append({
            "id": str(uuid.uuid4()),
            "event_type": event_type,
            "details": details,
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

db_service = DatabaseService()
