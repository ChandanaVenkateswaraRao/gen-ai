'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, User, Search, Bell, Pin, Shield, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { AnnouncementItem } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'General', 'Mess', 'Maintenance', 'Urgent'];

  useEffect(() => {
    loadAnnouncements();
  }, [selectedCategory]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAnnouncements(selectedCategory);
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = announcements.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <Badge variant="error" dot>Urgent Priority</Badge>;
      case 'High':
        return <Badge variant="warning" dot>High Priority</Badge>;
      default:
        return <Badge variant="neutral">Normal</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
              Campus Broadcasts
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Official Circulars &amp; Notices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Authoritative announcements issued by the Council of Wardens, Estate Office, and Student Mess Committee.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn-press rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search circulars by keyword, topic, or warden name…"
          className="w-full rounded-2xl border border-slate-200/90 bg-white py-3.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-card transition-all focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
        />
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down">
          {error}
        </div>
      )}

      {/* Circulars List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-3 animate-pulse">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => {
            const isUrgent = item.priority === 'Urgent';
            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-6 shadow-card hover-lift transition-all space-y-3 ${
                  isUrgent
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-200/90 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {item.category}
                    </span>
                    {getPriorityBadge(item.priority)}
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{(item.created_at || (item as any).published_at || '').slice(0, 10)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5 font-medium text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.author_name}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Official Notice
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={Bell}
            title="No circulars match your search"
            description="Try selecting a different category filter or clearing your search keywords."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        )}
      </div>
    </div>
  );
}
