"""
HostelIQ AI - MongoDB Initialization and Seeding Script
======================================================
This script initializes collections, sets up indexes, and seeds default
institutional records into MongoDB.

Usage:
    python database/mongo_setup.py
    # or specify custom URI:
    MONGO_URI=mongodb://localhost:27017/hosteliq python database/mongo_setup.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timezone
import pymongo
from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv

# Locate and load environment variables
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if (backend_dir / ".env").exists():
    load_dotenv(backend_dir / ".env")

MONGO_URI = os.getenv("MONGO_URI", os.getenv("MONGODB_URI", "mongodb://localhost:27017/hosteliq"))
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "hosteliq")

def setup_mongodb():
    print(f"Connecting to MongoDB at: {MONGO_URI}")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    
    # Test connection
    client.admin.command("ping")
    print("MongoDB connection successful!")
    
    db = client[MONGO_DB_NAME]
    print(f"Target Database: {MONGO_DB_NAME}")

    # 1. Ensure Indexes
    print("\nCreating indexes...")
    db["users"].create_index([("email", ASCENDING)], unique=True, sparse=True)
    db["users"].create_index([("id", ASCENDING)], unique=True)
    db["documents"].create_index([("id", ASCENDING)], unique=True)
    db["document_chunks"].create_index([("id", ASCENDING)], unique=True)
    db["document_chunks"].create_index([("document_id", ASCENDING)])
    db["mess_menus"].create_index([("id", ASCENDING)], unique=True)
    db["mess_menus"].create_index([("day_of_week", ASCENDING), ("meal_type", ASCENDING)], unique=True)
    db["announcements"].create_index([("id", ASCENDING)], unique=True)
    db["complaints"].create_index([("id", ASCENDING)], unique=True)
    db["complaints"].create_index([("tracking_id", ASCENDING)], unique=True)
    db["complaints"].create_index([("student_id", ASCENDING)])
    db["audit_logs"].create_index([("id", ASCENDING)], unique=True)
    db["audit_logs"].create_index([("timestamp", DESCENDING)])
    print("All indexes created successfully.")

    # 2. Seed Users
    print("\nSeeding Users...")
    users = [
        {
            "_key": "admin_1",
            "id": "a0000000-0000-0000-0000-000000000001",
            "email": "warden@klu.ac.in",
            "full_name": "Prof. Arthur Pendelton (Chief Warden)",
            "role": "admin",
            "room_number": "Office-101",
            "block_name": "Administrative Block",
            "password": "admin123",
            "created_at": datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc).isoformat()
        },
        {
            "_key": "student_1",
            "id": "s0000000-0000-0000-0000-000000000001",
            "email": "rohan.sharma@klu.ac.in",
            "full_name": "Rohan Sharma",
            "role": "student",
            "room_number": "B-304",
            "block_name": "Block B (Aryabhatta Hall)",
            "password": "student123",
            "created_at": datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc).isoformat()
        },
        {
            "_key": "student_2",
            "id": "s0000000-0000-0000-0000-000000000002",
            "email": "ananya.iyer@klu.ac.in",
            "full_name": "Ananya Iyer",
            "role": "student",
            "room_number": "G-112",
            "block_name": "Block G (Gargi Hall)",
            "password": "student123",
            "created_at": datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc).isoformat()
        }
    ]
    for u in users:
        db["users"].replace_one({"id": u["id"]}, u, upsert=True)
    print(f"Users seeded: {db['users'].count_documents({})}")

    # 3. Seed Policy Documents
    print("\nSeeding Policy Documents...")
    documents = [
        {
            "id": "d0000000-0000-0000-0000-000000000001",
            "title": "Hostel Rules & Regulations Handbook 2026",
            "file_name": "Hostel_Rules_and_Regulations_2026.pdf",
            "file_size": 248500,
            "category": "Rules & Discipline",
            "status": "indexed",
            "chunk_count": 4,
            "created_at": datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc).isoformat()
        },
        {
            "id": "d0000000-0000-0000-0000-000000000002",
            "title": "Mess Dining Guidelines & Rebate Policy 2026",
            "file_name": "Mess_Guidelines_and_Rebate_Policy_2026.pdf",
            "file_size": 154200,
            "category": "Mess & Dining",
            "status": "indexed",
            "chunk_count": 3,
            "created_at": datetime(2026, 1, 20, 14, 30, tzinfo=timezone.utc).isoformat()
        },
        {
            "id": "d0000000-0000-0000-0000-000000000003",
            "title": "Hostel Maintenance & Electrical Appliance Policy",
            "file_name": "Electrical_and_Maintenance_Policy.pdf",
            "file_size": 98400,
            "category": "Facilities & Maintenance",
            "status": "indexed",
            "chunk_count": 3,
            "created_at": datetime(2026, 2, 5, 9, 15, tzinfo=timezone.utc).isoformat()
        }
    ]
    for d in documents:
        db["documents"].replace_one({"id": d["id"]}, d, upsert=True)
    print(f"Documents seeded: {db['documents'].count_documents({})}")

    # 4. Seed Mess Menu (7 days x 4 meals)
    print("\nSeeding Mess Menus...")
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
            menu_doc = {
                "id": m_id,
                "day_of_week": day,
                "meal_type": meal,
                "start_time": start_t,
                "end_time": end_t,
                "items": items,
                "dietary_info": dietary,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            db["mess_menus"].replace_one({"id": m_id}, menu_doc, upsert=True)
    print(f"Mess menus seeded: {db['mess_menus'].count_documents({})}")

    # 5. Seed Announcements
    print("\nSeeding Announcements...")
    announcements = [
        {
            "id": "c0000000-0000-0000-0000-000000000001",
            "title": "Mandatory Curfew Verification & Late Entry Gate Pass Protocol",
            "content": "All resident students are reminded that the main hostel gates close strictly at 10:30 PM. Any student requiring entry after 10:30 PM for genuine academic lab work or emergency travel must submit an approved Digital Late Pass signed by their project guide and hostel warden at least 4 hours in advance.",
            "category": "Urgent",
            "priority": "Urgent",
            "is_pinned": True,
            "target_audience": "all",
            "author_name": "Prof. Arthur Pendelton (Chief Warden)",
            "created_at": datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc).isoformat()
        },
        {
            "id": "c0000000-0000-0000-0000-000000000002",
            "title": "Scheduled Electrical Maintenance in Block B & C",
            "content": "Routine maintenance and transformer testing will be conducted on Saturday between 09:00 AM and 01:00 PM. High-power appliances are strictly prohibited. Emergency elevator and corridor lighting will remain on backup inverter power.",
            "category": "Maintenance",
            "priority": "High",
            "is_pinned": False,
            "target_audience": "all",
            "author_name": "Estate Office (Electrical Wing)",
            "created_at": datetime(2026, 10, 27, 11, 30, tzinfo=timezone.utc).isoformat()
        },
        {
            "id": "c0000000-0000-0000-0000-000000000003",
            "title": "Mess Rebate Application Deadline for End-Semester Break",
            "content": "Students leaving the campus for vacation must apply for mess rebate on the student portal at least 3 days prior to departure. A minimum continuous absence of 4 days is mandatory to qualify for dining bill deductions.",
            "category": "Mess",
            "priority": "Normal",
            "is_pinned": False,
            "target_audience": "students",
            "author_name": "Mess Council Office",
            "created_at": datetime(2026, 10, 28, 8, 15, tzinfo=timezone.utc).isoformat()
        }
    ]
    for a in announcements:
        db["announcements"].replace_one({"id": a["id"]}, a, upsert=True)
    print(f"Announcements seeded: {db['announcements'].count_documents({})}")

    # 6. Seed Complaints
    print("\nSeeding Complaints...")
    complaints = [
        {
            "id": "e0000000-0000-0000-0000-000000000001",
            "tracking_id": "CMP-2026-0041",
            "student_id": "s0000000-0000-0000-0000-000000000001",
            "student_name": "Rohan Sharma",
            "room_number": "B-304",
            "block_name": "Block B (Aryabhatta Hall)",
            "category": "Plumbing",
            "title": "Bathroom tap leakage causing continuous water drip",
            "description": "The cold water washbasin faucet in room B-304 does not shut off completely, wasting water and creating continuous dripping noise.",
            "priority": "Medium",
            "status": "In Progress",
            "admin_notes": "Plumber Jagdish assigned on Oct 27; replacement ceramic cartridge requisitioned.",
            "resolved_at": None,
            "created_at": datetime(2026, 10, 26, 14, 20, tzinfo=timezone.utc).isoformat(),
            "updated_at": datetime(2026, 10, 27, 9, 45, tzinfo=timezone.utc).isoformat()
        },
        {
            "id": "e0000000-0000-0000-0000-000000000002",
            "tracking_id": "CMP-2026-0042",
            "student_id": "s0000000-0000-0000-0000-000000000001",
            "student_name": "Rohan Sharma",
            "room_number": "B-304",
            "block_name": "Block B (Aryabhatta Hall)",
            "category": "Internet",
            "title": "LAN port 2 connectivity intermittent",
            "description": "Study table wall ethernet port drops packets after 10-15 minutes of continuous connection. WiFi signal on 3rd floor west wing is also weak.",
            "priority": "Low",
            "status": "Submitted",
            "admin_notes": None,
            "resolved_at": None,
            "created_at": datetime(2026, 10, 27, 16, 50, tzinfo=timezone.utc).isoformat(),
            "updated_at": datetime(2026, 10, 27, 16, 50, tzinfo=timezone.utc).isoformat()
        },
        {
            "id": "e0000000-0000-0000-0000-000000000003",
            "tracking_id": "CMP-2026-0038",
            "student_id": "s0000000-0000-0000-0000-000000000002",
            "student_name": "Ananya Iyer",
            "room_number": "G-112",
            "block_name": "Block G (Gargi Hall)",
            "category": "Electrical",
            "title": "Ceiling fan regulator sparking on speed 3",
            "description": "The ceiling fan speed regulator is sparking when turned to speeds 3 and 4. Needs immediate replacement before use.",
            "priority": "High",
            "status": "Resolved",
            "admin_notes": "Electrician Mohan replaced faulty rotary switch with modular dimmer on Oct 26. Verified working safely.",
            "resolved_at": datetime(2026, 10, 26, 17, 30, tzinfo=timezone.utc).isoformat(),
            "created_at": datetime(2026, 10, 25, 11, 10, tzinfo=timezone.utc).isoformat(),
            "updated_at": datetime(2026, 10, 26, 17, 30, tzinfo=timezone.utc).isoformat()
        }
    ]
    for c in complaints:
        db["complaints"].replace_one({"id": c["id"]}, c, upsert=True)
    print(f"Complaints seeded: {db['complaints'].count_documents({})}")

    print("\n==============================================")
    print(f"MongoDB database '{MONGO_DB_NAME}' setup completed successfully!")
    print("==============================================")

if __name__ == "__main__":
    setup_mongodb()

