'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  XCircle,
  AlertCircle,
  Shield,
  Home,
  Tag,
  ChevronRight,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { ComplaintItem, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

const STATUS_CONFIG: Record<ComplaintStatus, { variant: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral'; icon: React.ElementType; label: string }> = {
  Submitted: { variant: 'warning', icon: Clock, label: 'Submitted' },
  'Under Review': { variant: 'info', icon: Clock, label: 'Under Review' },
  'In Progress': { variant: 'primary', icon: Wrench, label: 'In Progress' },
  Resolved: { variant: 'success', icon: CheckCircle2, label: 'Resolved' },
  Rejected: { variant: 'error', icon: XCircle, label: 'Rejected' },
};

const STAGES: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export default function ComplaintsPage() {
  const { currentUser } = useApp();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successItem, setSuccessItem] = useState<ComplaintItem | null>(null);

  const [category, setCategory] = useState<ComplaintCategory>('Plumbing');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState(currentUser?.room_number || '');
  const [blockName, setBlockName] = useState(currentUser?.block_name || '');

  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<ComplaintItem | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.room_number) setRoomNumber(currentUser.room_number);
    if (currentUser?.block_name) setBlockName(currentUser.block_name);
    loadComplaints();
  }, [currentUser]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5) {
      setError('Issue title must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 15) {
      setError('Please provide a description of at least 15 characters to assist maintenance technicians.');
      return;
    }
    if (!roomNumber.trim()) {
      setError('Room number is required.');
      return;
    }
    if (!blockName.trim()) {
      setError('Hostel block name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const created = await api.submitComplaint({
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        room_number: roomNumber.trim(),
        block_name: blockName.trim(),
        student_name: currentUser?.full_name || 'Resident Student',
      });

      setSuccessItem(created);
      setTitle('');
      setDescription('');
      setShowForm(false);
      loadComplaints();
    } catch (err: any) {
      setError(err.message || 'Failed to register maintenance complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;

    try {
      setLookupError(null);
      setLookupResult(null);
      const res = await api.getComplaint(lookupCode.trim());
      setLookupResult(res);
    } catch (err: any) {
      setLookupError(err.message || `No grievance matching tracking code "${lookupCode}".`);
    }
  };

  const getStageIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
              Student Grievance Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Maintenance Complaints &amp; Work Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              File repairs for plumbing, electrical, internet, and room fixtures. Track live warden triage and resolution status.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-press inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{showForm ? 'Close Form' : 'File New Grievance'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successItem && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-card animate-slide-down flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Complaint Registered Successfully!
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your tracking ID is <strong className="font-mono">{successItem.tracking_id}</strong>. Assigned for warden review.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessItem(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick Tracking ID Lookup Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="Track any complaint by tracking ID (e.g. CMP-2026-0041)…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="btn-press rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            Track Status
          </button>
        </form>

        {lookupError && (
          <p className="mt-2 text-xs text-rose-500 font-medium">{lookupError}</p>
        )}

        {lookupResult && (
          <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-900">{lookupResult.tracking_id}</span>
              <Badge variant={STATUS_CONFIG[lookupResult.status]?.variant || 'neutral'} dot>
                {lookupResult.status}
              </Badge>
            </div>
            <div className="text-xs font-semibold text-slate-800">{lookupResult.title}</div>
            <p className="text-[11px] text-slate-600">{lookupResult.description}</p>
            {lookupResult.admin_notes && (
              <div className="mt-2 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-indigo-100">
                <strong>Warden Note:</strong> {lookupResult.admin_notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submission Form Card */}
      {showForm && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-panel animate-slide-down space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight poppins">
              Submit Maintenance Request
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please provide accurate room details and a descriptive title for timely resolution.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Internet">Internet / LAN</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Cleanliness">Cleanliness &amp; Hygiene</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. B-304"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Hostel Block
                </label>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  placeholder="e.g. Block B (Aryabhatta Hall)"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Summary Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bathroom tap leaking continuously"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Detailed Description (15+ chars)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the exact location and severity of the issue to help technicians resolve it quickly…"
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-press rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-press rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit Grievance'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          My Active &amp; Past Work Orders ({complaints.length})
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-3 animate-pulse">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : complaints.length > 0 ? (
          complaints.map((item) => {
            const currentStageIdx = getStageIndex(item.status);
            const isRejected = item.status === 'Rejected';
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card hover-lift transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                      {item.tracking_id}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {item.category}
                    </span>
                    <Badge variant={item.priority === 'Urgent' || item.priority === 'High' ? 'error' : 'neutral'}>
                      {item.priority}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.created_at.slice(0, 10)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tracking Timeline Stepper */}
                {!isRejected && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                      <span>Status Progression</span>
                      <span className="text-indigo-600">{item.status}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {STAGES.map((stg, sIdx) => {
                        const isCompleted = sIdx <= currentStageIdx;
                        const isCurrent = sIdx === currentStageIdx;
                        return (
                          <div key={stg} className="text-center">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                isCompleted ? 'bg-indigo-600' : 'bg-slate-100'
                              }`}
                            />
                            <span
                              className={`text-[9px] mt-1 block truncate ${
                                isCurrent
                                  ? 'font-bold text-indigo-700'
                                  : isCompleted
                                  ? 'font-medium text-slate-600'
                                  : 'text-slate-300'
                              }`}
                            >
                              {stg}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {item.admin_notes && (
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-slate-700">
                    <strong className="text-slate-900 font-semibold">Warden Remarks:</strong> {item.admin_notes}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Home className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.room_number} &bull; {item.block_name}</span>
                  </div>
                  <Badge variant={STATUS_CONFIG[item.status]?.variant || 'neutral'} dot>
                    {item.status}
                  </Badge>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No grievances submitted yet"
            description="Have a plumbing, electrical, or Wi-Fi issue in your hostel room? Click below to file a tracked request."
            actionLabel="File First Grievance"
            onAction={() => setShowForm(true)}
          />
        )}
      </div>
    </div>
  );
}
