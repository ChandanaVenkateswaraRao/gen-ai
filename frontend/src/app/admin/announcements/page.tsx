'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, AlertCircle, Pin, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { AnnouncementItem } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminAnnouncementsPage() {
  const { currentRole, currentUser } = useApp();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('General');
  const [priority, setPriority] = useState<string>('Normal');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [isPinned, setIsPinned] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, [currentUser]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setPublishing(true);
      setError(null);
      setPublishSuccess(null);

      await api.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        target_audience: targetAudience,
        is_pinned: isPinned,
      });

      setPublishSuccess(`Announcement "${title.trim()}" published to residential portals.`);
      setTitle('');
      setContent('');
      setIsPinned(false);
      loadAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Failed to publish announcement.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (item: AnnouncementItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete notice "${item.title}"?`);
    if (!confirmed) return;

    try {
      setError(null);
      await api.deleteAnnouncement(item.id);
      loadAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Failed to remove announcement.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-[#DCE6F2] pb-4">
        <h1 className="text-lg font-semibold tracking-tight text-[#101C3A] poppins">
          Official Circular Publisher
        </h1>
        <p className="mt-0.5 text-xs text-[#647794]">
          Broadcast authorized circulars, dining notifications, maintenance advisories, and urgent warnings.
        </p>
      </div>

      {publishSuccess && (
        <div className="rounded-md border border-[#3F51B5]/40 bg-[#EAF4FF] p-4 text-xs text-[#3F51B5] flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{publishSuccess}</span>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-[#DC143C]/30 bg-[#FDF2F2] p-4 text-xs text-[#DC143C]">
          <div className="font-semibold">Notice</div>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {/* Publisher Form */}
      <form
        onSubmit={handlePublish}
        className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 space-y-4 shadow-card"
      >
        <div className="border-b border-[#DCE6F2] pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#101C3A] poppins">
          Compose Circular
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#647794]">
              Circular Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule of Elevator Maintenance in Block B"
              required
              className="mt-1 w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-2 text-sm text-[#101C3A] focus:border-[#3F51B5] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#647794]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-2 text-sm text-[#101C3A] focus:border-[#3F51B5] focus:outline-none"
            >
              <option value="General">General</option>
              <option value="Mess">Mess & Dining</option>
              <option value="Maintenance">Maintenance & Estate</option>
              <option value="Urgent">Urgent / Safety</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#647794]">
              Priority Classification
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-2 text-sm text-[#101C3A] focus:border-[#3F51B5] focus:outline-none"
            >
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#647794]">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-2 text-sm text-[#101C3A] focus:border-[#3F51B5] focus:outline-none"
            >
              <option value="all">All Residents & Staff</option>
              <option value="students">Students Only</option>
              <option value="admins">Administration Only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#647794]">
            Official Announcement Content
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type verified instructions, effective dates, and procedural requirements..."
            required
            className="mt-1 w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-2 text-sm text-[#101C3A] focus:border-[#3F51B5] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#DCE6F2] pt-3">
          <label className="flex items-center space-x-2 text-sm text-[#101C3A] cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-[#DCE6F2] text-[#021861] focus:ring-[#3F51B5]"
            />
            <span className="font-medium">Pin this circular to top of notice board</span>
          </label>

          <button
            type="submit"
            disabled={publishing || !title.trim() || !content.trim()}
            className="rounded-lg bg-[#021861] px-4 py-2 text-xs font-medium text-white hover:bg-[#3F51B5] disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish Official Circular'}
          </button>
        </div>
      </form>

      {/* Active Circulars Management Table */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF]">
        <div className="border-b border-[#DCE6F2] px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] poppins">
            Active Published Circulars ({announcements.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE6F2] bg-[#EAF4FF]/50 text-[11px] font-semibold uppercase text-[#647794]">
              <tr>
                <th className="px-5 py-3">Title & Summary</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Audience</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F2]">
              {announcements.length > 0 ? (
                announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F7FF] align-top">
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-1.5">
                        {item.is_pinned && (
                          <span className="rounded bg-[#FDF2F2] border border-[#DC143C]/40 px-1 py-0.5 text-[9px] font-semibold text-[#DC143C] uppercase">
                            Pinned
                          </span>
                        )}
                        <span className="font-semibold text-[#101C3A]">{item.title}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#647794] line-clamp-2">
                        {item.content}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-[#647794] whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="font-medium text-[#101C3A]">{item.priority}</span>
                    </td>
                    <td className="px-5 py-3 text-[#647794] capitalize whitespace-nowrap">
                      {item.target_audience}
                    </td>
                    <td className="px-5 py-3 text-[#647794] whitespace-nowrap text-[11px]">
                      {item.created_at.slice(0, 10)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center space-x-1 rounded border border-[#DC143C]/30 bg-[#FDF2F2] px-2 py-1 text-[11px] font-medium text-[#DC143C] hover:bg-[#FDF2F2]"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Bell}
                      title="No active announcements"
                      description="No announcements have been published yet."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
