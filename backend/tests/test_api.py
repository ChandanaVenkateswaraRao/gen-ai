import unittest
from starlette.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

class TestHostelIQAI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.student_headers = {"x-user-id": "s0000000-0000-0000-0000-000000000001"}
        cls.admin_headers = {"x-user-id": "a0000000-0000-0000-0000-000000000001"}

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "HostelIQ AI Backend")

    def test_02_operational_overview_metrics(self):
        res = self.client.get("/api/overview")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_complaints", data)
        self.assertIn("pending_complaints", data)
        self.assertIn("resolved_complaints", data)
        self.assertIn("indexed_documents", data)
        self.assertGreater(data["total_complaints"], 0)
        self.assertGreater(data["indexed_documents"], 0)
        self.assertGreater(data["total_chunks"], 0)

    def test_03_rag_grounded_policy_query(self):
        payload = {"query": "What are the main hostel gate curfew timings on weekdays and weekends?"}
        res = self.client.post("/api/rag/query", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_grounded"])
        self.assertEqual(data["query_type"], "policy_rag")
        self.assertGreater(len(data["sources"]), 0)
        # Check source citation details
        first_source = data["sources"][0]
        self.assertIn("document_title", first_source)
        self.assertIn("page_number", first_source)
        self.assertIn("snippet", first_source)
        self.assertIn("10:30 PM", data["answer"] + first_source["snippet"])

    def test_04_rag_structured_mess_routing(self):
        # Querying about mess meals should route to structured DB, avoiding hallucination
        payload = {"query": "What is for lunch today in the hostel mess?"}
        res = self.client.post("/api/rag/query", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_grounded"])
        self.assertEqual(data["query_type"], "structured_menu")
        self.assertIn("Mess Schedule for Today", data["answer"])

    def test_05_rag_structured_complaint_lookup(self):
        payload = {"query": "Check status of complaint CMP-2026-0041"}
        res = self.client.post("/api/rag/query", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_grounded"])
        self.assertEqual(data["query_type"], "structured_complaint")
        self.assertIn("CMP-2026-0041", data["answer"])

    def test_06_rag_ungrounded_policy_query(self):
        # Questions with no evidence in approved documents must not hallucinate
        payload = {"query": "Can students construct personal swimming pools on the hostel rooftop?"}
        res = self.client.post("/api/rag/query", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["is_grounded"])
        self.assertIn("could not find policy information", data["answer"].lower())
        self.assertEqual(len(data["sources"]), 0)

    def test_07_complaint_submission_and_tracking_id(self):
        payload = {
            "title": "Study room ceiling tube light flickering",
            "description": "The center tube light in study room B-304 flickers rapidly and goes dark after a few minutes.",
            "category": "Electrical",
            "priority": "Medium",
            "room_number": "B-304",
            "block_name": "Block B (Aryabhatta Hall)",
            "student_name": "Rohan Sharma"
        }
        res = self.client.post("/api/complaints", json=payload, headers=self.student_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("tracking_id", data)
        self.assertTrue(data["tracking_id"].startswith("CMP-2026-"))
        self.assertEqual(data["status"], "Submitted")
        self.assertEqual(data["category"], "Electrical")

        # Verify complaint is retrievable by tracking ID
        tracking_id = data["tracking_id"]
        lookup_res = self.client.get(f"/api/complaints/{tracking_id}")
        self.assertEqual(lookup_res.status_code, 200)
        self.assertEqual(lookup_res.json()["title"], payload["title"])

    def test_08_admin_authorization_guard(self):
        # A student should NOT be allowed to update complaint status (HTTP 403)
        res = self.client.patch(
            "/api/complaints/CMP-2026-0041/status",
            json={"status": "Resolved", "admin_notes": "Attempted by student"},
            headers=self.student_headers
        )
        self.assertEqual(res.status_code, 403)

        # An admin CAN update complaint status (HTTP 200)
        admin_res = self.client.patch(
            "/api/complaints/CMP-2026-0041/status",
            json={"status": "Resolved", "admin_notes": "Tap cartridge replaced by plumber Jagdish."},
            headers=self.admin_headers
        )
        self.assertEqual(admin_res.status_code, 200)
        self.assertEqual(admin_res.json()["status"], "Resolved")

    def test_09_mess_menu_schedule_and_admin_update(self):
        # Weekly menu
        res = self.client.get("/api/mess-menu/weekly")
        self.assertEqual(res.status_code, 200)
        weekly = res.json()
        self.assertEqual(len(weekly), 28)  # 7 days x 4 meals

        # Admin update
        update_payload = {
            "day_of_week": "Friday",
            "meal_type": "Snacks",
            "start_time": "17:00",
            "end_time": "18:15",
            "items": ["Vegetable Cutlet with Mint Chutney", "Masala Chai"],
            "dietary_info": {"veg": True, "egg": False, "dairy": True, "jain": True}
        }
        update_res = self.client.put("/api/mess-menu/update", json=update_payload, headers=self.admin_headers)
        self.assertEqual(update_res.status_code, 200)
        self.assertIn("Vegetable Cutlet with Mint Chutney", update_res.json()["items"])

    def test_10_document_inspection(self):
        res = self.client.get("/api/documents")
        self.assertEqual(res.status_code, 200)
        docs = res.json()
        self.assertGreater(len(docs), 0)
        
        # Test chunks retrieval
        first_doc_id = docs[0]["id"]
        chunks_res = self.client.get(f"/api/documents/{first_doc_id}/chunks")
        self.assertEqual(chunks_res.status_code, 200)
        chunks = chunks_res.json()
        self.assertGreater(len(chunks), 0)
        self.assertIn("content", chunks[0])

    def test_11_authentication_flow(self):
        # 1. Valid Student Login
        student_login = self.client.post("/api/auth/login", json={
            "email": "rohan.sharma@student.edu",
            "password": "student123"
        })
        self.assertEqual(student_login.status_code, 200)
        self.assertEqual(student_login.json()["role"], "student")
        self.assertEqual(student_login.json()["id"], "s0000000-0000-0000-0000-000000000001")

        # 2. Valid Admin Login
        admin_login = self.client.post("/api/auth/login", json={
            "email": "warden@university.edu",
            "password": "admin123"
        })
        self.assertEqual(admin_login.status_code, 200)
        self.assertEqual(admin_login.json()["role"], "admin")
        self.assertEqual(admin_login.json()["id"], "a0000000-0000-0000-0000-000000000001")

        # 3. Invalid Password Rejection (401)
        invalid_login = self.client.post("/api/auth/login", json={
            "email": "warden@university.edu",
            "password": "wrong_password"
        })
        self.assertEqual(invalid_login.status_code, 401)

        # 4. Unknown Account Rejection (401)
        unknown_login = self.client.post("/api/auth/login", json={
            "email": "unknown@fake.edu",
            "password": "password123"
        })
        self.assertEqual(unknown_login.status_code, 401)

if __name__ == "__main__":
    unittest.main()
