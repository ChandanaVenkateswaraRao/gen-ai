'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Filter,
  Clock,
  Home,
  User,
  AlertCircle,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { ComplaintItem, ComplaintStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminComplaintsPage() {
  const { currentRole, currentUser } = useApp();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Update modal state
  const [editingComplaint, setEditingComplaint] = useState<ComplaintItem | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter, currentUser]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getComplaints(statusFilter, categoryFilter);
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (item: ComplaintItem) => {
    setEditingComplaint(item);
    setNewStatus(item.status);
    setAdminNotes(item.admin_notes || '');
    setUpdateSuccess(null);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    try {
      setUpdating(true);
      setError(null);

      const updated = await api.updateComplaintStatus(
        editingComplaint.id,
        newStatus,
        adminNotes.trim() || undefined
      );

      setUpdateSuccess(`Tracking ID ${updated.tracking_id} updated to "${updated.status}".`);
      setEditingComplaint(null);
      loadComplaints();
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Resolved': return <Badge variant="success" dot>Resolved</Badge>;
      case 'In Progress': return <Badge variant="primary" dot>In Progress</Badge>;
      case 'Under Review': return <Badge variant="info" dot>Under Review</Badge>;
      case 'Rejected': return <Badge variant="error" dot>Rejected</Badge>;
      default: return <Badge variant="warning" dot>Submitted</Badge>;
    }
  };

  const filtered = complaints.filter((c) => {
    if (!searchTerm) return true;
    return (
      c.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const statuses: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
              Facility Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Complaint Triage &amp; Resolution Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Review resident work orders, assign maintenance technicians, advance lifecycle stages, and record official resolution notes.
            </p>
          </div>

          <button
            onClick={loadComplaints}
            disabled={loading}
            className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle shrink-0 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Sync Desk</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {updateSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-card animate-slide-down flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{updateSuccess}</span>
          </div>
          <button onClick={() => setUpdateSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down">
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by tracking ID, student name, issue title, or room…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shrink-0"
          >
            <option value="All">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Internet">Internet / LAN</option>
            <option value="Furniture">Furniture</option>
            <option value="Cleanliness">Cleanliness</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex overflow-x-auto gap-2 pt-2 border-t border-slate-100 scrollbar-none">
          {['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map((stg) => (
            <button
              key={stg}
              onClick={() => setStatusFilter(stg)}
              className={`btn-press whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                statusFilter === stg
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Work Orders Queue ({filtered.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-2 animate-pulse">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      {c.tracking_id}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {c.category}
                    </span>
                    <Badge variant={c.priority === 'Urgent' || c.priority === 'High' ? 'error' : 'neutral'}>
                      {c.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] text-slate-400 font-mono">{c.created_at.slice(0, 10)}</span>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="btn-press inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      <Sliders className="h-3 w-3" />
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{c.description}</p>
                </div>

                {c.admin_notes && (
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 text-xs text-slate-700">
                    <strong className="text-slate-900 font-semibold">Warden Remark:</strong> {c.admin_notes}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{c.student_name}</span>
                    <span>&bull;</span>
                    <Home className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.room_number} ({c.block_name})</span>
                  </div>
                  {getStatusBadge(c.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wrench}
            title="No grievances in this filter"
            description="Try changing the category or status filter above."
          />
        )}
      </div>

      {/* Update Status Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <form
            onSubmit={handleSaveStatus}
            className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-slide-down"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">{editingComplaint.tracking_id}</span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Triage &amp; Update Grievance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingComplaint(null)}
                className="btn-press rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Advance Status Stage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {statuses.map((stg) => {
                    const isSelected = newStatus === stg;
                    return (
                      <button
                        key={stg}
                        type="button"
                        onClick={() => setNewStatus(stg)}
                        className={`btn-press rounded-xl p-2.5 text-xs font-bold transition-all border text-center ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {stg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Warden Notes &amp; Assigned Technician Remarks
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Technician Ramesh assigned. Work order scheduled for completion today."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingComplaint(null)}
                className="btn-press rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="btn-press rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {updating ? 'Saving…' : 'Save Status Update'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
