# HostelIQ AI — Database Architecture & MongoDB Migration

This repository uses **MongoDB** as its primary document database for student services, hostel administration, complaints management, mess schedules, announcements, and document chunk storage.

## Database Overview

- **Engine:** MongoDB (Document Store)
- **Database Name:** `hosteliq`
- **Default Connection URI:** `mongodb://localhost:27017/hosteliq`
- **Driver:** `pymongo>=4.6.0`

---

## Collections & Schemas

### 1. `users`
Stores student residents and administrative staff.
- **Indexes:** `id` (unique), `email` (unique, sparse)
- **Fields:**
  - `id` (string UUID)
  - `email` (string)
  - `full_name` (string)
  - `role` (`"student"` | `"admin"`)
  - `room_number` (string)
  - `block_name` (string)
  - `created_at` (ISO 8601 string)

### 2. `documents`
Approved university institutional policies (Hostel Rules, Mess Guidelines, Maintenance).
- **Indexes:** `id` (unique)
- **Fields:**
  - `id` (string UUID)
  - `title` (string)
  - `file_name` (string)
  - `file_size` (integer bytes)
  - `category` (`"Rules & Discipline"`, `"Mess & Dining"`, `"Facilities & Maintenance"`, etc.)
  - `status` (`"indexed"`, `"processing"`, `"error"`)
  - `chunk_count` (integer)
  - `created_at` (ISO 8601 string)

### 3. `document_chunks`
Vector chunks parsed from policy documents for Grounded RAG retrieval.
- **Indexes:** `id` (unique), `document_id`
- **Fields:**
  - `id` (string)
  - `document_id` (string)
  - `content` (string)
  - `page_number` (integer)
  - `chunk_index` (integer)
  - `embedding` (array of 768 floats for `text-embedding-004`)
  - `metadata` (object)

### 4. `mess_menus`
7-day dietary and meal scheduling matrix (28 slots: Breakfast, Lunch, Snacks, Dinner).
- **Indexes:** `id` (unique), `(day_of_week, meal_type)` (unique compound)
- **Fields:**
  - `id` (string, e.g., `menu_monday_lunch`)
  - `day_of_week` (`"Monday"` – `"Sunday"`)
  - `meal_type` (`"Breakfast"`, `"Lunch"`, `"Snacks"`, `"Dinner"`)
  - `start_time` (string HH:MM)
  - `end_time` (string HH:MM)
  - `items` (array of strings)
  - `dietary_info` (`{"veg": bool, "egg": bool, "dairy": bool, "jain": bool}`)
  - `updated_at` (ISO 8601 string)

### 5. `announcements`
Hostel warden notices, circulars, and maintenance advisories.
- **Indexes:** `id` (unique)
- **Fields:**
  - `id` (string UUID)
  - `title` (string)
  - `content` (string)
  - `category` (`"General"`, `"Maintenance"`, `"Mess"`, `"Urgent"`)
  - `priority` (`"Normal"`, `"High"`, `"Urgent"`)
  - `is_pinned` (boolean)
  - `target_audience` (`"all"`, `"students"`, `"admins"`)
  - `author_name` (string)
  - `created_at` (ISO 8601 string)

### 6. `complaints`
Student maintenance grievances and resolution lifecycle tracking.
- **Indexes:** `id` (unique), `tracking_id` (unique), `student_id`
- **Fields:**
  - `id` (string UUID)
  - `tracking_id` (string, e.g., `CMP-2026-0041`)
  - `student_id` (string UUID)
  - `student_name` (string)
  - `room_number` (string)
  - `block_name` (string)
  - `category` (`"Electrical"`, `"Plumbing"`, `"Carpentry"`, `"Cleanliness"`, `"Mess"`, `"Internet"`, `"Other"`)
  - `title` (string)
  - `description` (string)
  - `priority` (`"Low"`, `"Medium"`, `"High"`, `"Urgent"`)
  - `status` (`"Submitted"`, `"Under Review"`, `"In Progress"`, `"Resolved"`, `"Rejected"`)
  - `admin_notes` (string, optional)
  - `resolved_at` (ISO 8601 string, optional)
  - `created_at` (ISO 8601 string)
  - `updated_at` (ISO 8601 string)

### 7. `audit_logs`
Chronological audit trail for system actions and administrative operations.
- **Indexes:** `id` (unique), `timestamp` (descending)
- **Fields:**
  - `id` (string UUID)
  - `event_type` (string)
  - `details` (object)
  - `status` (string)
  - `timestamp` (ISO 8601 string)

---

## Initialization & Seeding

To initialize indexes and seed MongoDB with institutional data:

```bash
python database/mongo_setup.py
```

Or via environment variables:

```bash
MONGO_URI=mongodb://localhost:27017/hosteliq python database/mongo_setup.py
```

