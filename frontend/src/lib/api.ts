import {
  User,
  OperationalOverview,
  RAGQueryResponse,
  DocumentChunk,
  DocumentMetadata,
  MessMenuItem,
  AnnouncementItem,
  ComplaintItem,
  ComplaintStatus
} from '@/types';

const rawApiBase = process.env.NEXT_PUBLIC_API_URL || '';
const API_BASE = rawApiBase ? rawApiBase.replace(/\/+$/, '') : '';

class ApiClient {
  private activeUserId: string = 's0000000-0000-0000-0000-000000000001';

  setActiveUser(userId: string) {
    this.activeUserId = userId;
  }

  getActiveUserId(): string {
    return this.activeUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});
    headers.set('x-user-id', this.activeUserId);

    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = 'Network request failed';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorData.message || errorDetail;
      } catch (e) {
        // use default error message
      }
      throw new Error(errorDetail);
    }

    return response.json();
  }

  // Auth & Accounts
  async login(credentials: { email: string; password?: string; role?: string }): Promise<User> {
    return this.request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'admin';
    room_number?: string;
    block_name?: string;
  }): Promise<User> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAccounts(): Promise<User[]> {
    return this.request<User[]>('/api/auth/accounts');
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Overview
  async getOverview(): Promise<OperationalOverview> {
    return this.request<OperationalOverview>('/api/overview');
  }

  // RAG
  async queryRAG(query: string, history: Array<{ role: string; content: string }> = []): Promise<RAGQueryResponse> {
    return this.request<RAGQueryResponse>('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify({ query, conversation_history: history }),
    });
  }

  async getSuggestions(): Promise<string[]> {
    const data = await this.request<{ suggestions: string[] }>('/api/rag/suggestions');
    return data.suggestions;
  }

  async getEvidence(chunkId: string): Promise<DocumentChunk> {
    return this.request<DocumentChunk>(`/api/rag/evidence/${chunkId}`);
  }

  // Mess Menu
  async getWeeklyMenu(): Promise<MessMenuItem[]> {
    return this.request<MessMenuItem[]>('/api/mess-menu/weekly');
  }

  async updateMenuItem(itemData: {
    day_of_week: string;
    meal_type: string;
    start_time: string;
    end_time: string;
    items: string[];
    dietary_info: { veg: boolean; egg: boolean; dairy: boolean; jain: boolean };
  }): Promise<MessMenuItem> {
    return this.request<MessMenuItem>('/api/mess-menu/update', {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  // Announcements
  async getAnnouncements(category?: string): Promise<AnnouncementItem[]> {
    const url = category && category !== 'All' ? `/api/announcements?category=${encodeURIComponent(category)}` : '/api/announcements';
    return this.request<AnnouncementItem[]>(url);
  }

  async createAnnouncement(data: {
    title: string;
    content: string;
    category: string;
    priority: string;
    is_pinned: boolean;
    target_audience: string;
  }): Promise<AnnouncementItem> {
    return this.request<AnnouncementItem>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/api/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // Complaints
  async getComplaints(status?: string, category?: string): Promise<ComplaintItem[]> {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (category && category !== 'All') params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<ComplaintItem[]>(`/api/complaints${qs}`);
  }

  async getComplaint(identifier: string): Promise<ComplaintItem> {
    return this.request<ComplaintItem>(`/api/complaints/${identifier}`);
  }

  async submitComplaint(data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    room_number: string;
    block_name: string;
    student_name: string;
  }): Promise<ComplaintItem> {
    return this.request<ComplaintItem>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    admin_notes?: string
  ): Promise<ComplaintItem> {
    return this.request<ComplaintItem>(`/api/complaints/${complaintId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes }),
    });
  }

  // Document Management
  async getDocuments(): Promise<DocumentMetadata[]> {
    return this.request<DocumentMetadata[]>('/api/documents');
  }

  async uploadDocument(formData: FormData): Promise<DocumentMetadata> {
    return this.request<DocumentMetadata>('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(docId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/api/documents/${docId}`, {
      method: 'DELETE',
    });
  }

  async getDocumentChunks(docId: string): Promise<DocumentChunk[]> {
    return this.request<DocumentChunk[]>(`/api/documents/${docId}/chunks`);
  }

  // Audit Logs
  async getAuditLogs(): Promise<{ logs: any[]; total_events: number }> {
    return this.request<{ logs: any[]; total_events: number }>('/api/overview/audit-logs');
  }
}

export const api = new ApiClient();
