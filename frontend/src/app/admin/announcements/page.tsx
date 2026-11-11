'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Pin,
  Calendar,
  Send,
  X,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { AnnouncementItem } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

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

      setPublishSuccess(`Notice "${title.trim()}" published to residential portals.`);
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
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">
            Official Broadcast Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
            Publish Circulars &amp; Notices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
            Broadcast emergency alerts, mess committee announcements, maintenance shutdowns, and warden council directives.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {publishSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-card animate-slide-down flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{publishSuccess}</span>
          </div>
          <button onClick={() => setPublishSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down">
          {error}
        </div>
      )}

      {/* Composer Card */}
      <form onSubmit={handlePublish} className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Create New Circular Broadcast
            </h2>
            <p className="text-[11px] text-slate-400">Published immediately to all student portals</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Circular Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mandatory Evening Curfew Notification & Out-pass Guidelines"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            >
              <option value="General">General Notice</option>
              <option value="Mess">Mess &amp; Dining</option>
              <option value="Maintenance">Maintenance &amp; Utilities</option>
              <option value="Urgent">Urgent Directive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            >
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            >
              <option value="all">All Campus Hostels</option>
              <option value="mens">Men&apos;s Hostels Only</option>
              <option value="ladies">Ladies&apos; Hostels Only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Announcement Body
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the official text of the notice, including effective dates and contact information…"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <Pin className="h-3.5 w-3.5 text-indigo-600" />
              <span>Pin to top of student portal dashboard</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={publishing || !title.trim() || !content.trim()}
            className="btn-press inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{publishing ? 'Publishing…' : 'Publish Circular'}</span>
          </button>
        </div>
      </form>

      {/* Active Notices List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Published Notices ({announcements.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card animate-pulse space-y-2">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={item.priority === 'Urgent' ? 'error' : 'primary'} dot>
                      {item.category}
                    </Badge>
                    {item.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Pin className="h-3 w-3" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] text-slate-400 font-mono">{(item.created_at || (item as any).published_at || '').slice(0, 10)}</span>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No notices published yet"
            description="Use the composer above to publish your first hostel circular."
          />
        )}
      </div>
    </div>
  );
}
