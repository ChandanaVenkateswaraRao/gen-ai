export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  room_number?: string;
  block_name?: string;
}

export interface GroundedSource {
  document_id: string;
  document_title: string;
  page_number: number;
  chunk_index: number;
  similarity: number;
  snippet: string;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  is_grounded: boolean;
  query_type: 'policy_rag' | 'structured_menu' | 'structured_complaint' | 'general';
  sources: GroundedSource[];
  generated_at: string;
  suggested_followups: string[];
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  page_number: number;
  chunk_index: number;
  similarity?: number;
  metadata?: Record<string, any>;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  file_name: string;
  file_size: number;
  category: 'Rules & Discipline' | 'Mess & Dining' | 'Facilities & Maintenance' | 'Hostel Admissions' | 'General Notice';
  status: 'processing' | 'indexed' | 'error';
  chunk_count: number;
  error_message?: string;
  created_at: string;
}

export interface DietaryInfo {
  veg: boolean;
  egg: boolean;
  dairy: boolean;
  jain: boolean;
}

export interface MessMenuItem {
  id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  meal_type: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  start_time: string;
  end_time: string;
  items: string[];
  dietary_info: DietaryInfo;
  is_active_now?: boolean;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Maintenance' | 'Mess' | 'Urgent';
  priority: 'Normal' | 'High' | 'Urgent';
  is_pinned: boolean;
  target_audience: 'all' | 'students' | 'admins';
  author_name: string;
  created_at: string;
}

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';
export type ComplaintCategory = 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleanliness' | 'Mess' | 'Internet' | 'Other';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ComplaintItem {
  id: string;
  tracking_id: string;
  student_id?: string;
  student_name: string;
  room_number: string;
  block_name: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OperationalOverview {
  total_complaints: number;
  pending_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  active_announcements: number;
  indexed_documents: number;
  total_chunks: number;
  current_meal?: MessMenuItem | null;
  recent_complaints: ComplaintItem[];
  recent_announcements: AnnouncementItem[];
  is_demo_mode: boolean;
}
