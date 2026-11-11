'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, User, Search, Bell, Pin, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { AnnouncementItem } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

const PRIORITY_STYLES: Record<string, { badge: string; border: string }> = {
  Urgent: { badge: 'border-[#DC143C]/30 bg-[#FDF2F2] text-[#DC143C]', border: 'border-[#DC143C]/50' },
  High: { badge: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]', border: 'border-[#3F51B5]/30' },
  Normal: { badge: 'border-[#021861]/30 bg-[#EAF4FF] text-[#021861]', border: 'border-[#021861]/30' },
};

const CATEGORY_STYLES: Record<string, string> = {
  Urgent: 'border-[#DC143C]/30 bg-[#FDF2F2] text-[#DC143C]',
  Maintenance: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]',
  Mess: 'border-[#3F51B5]/30 bg-[#EAF4FF] text-[#3F51B5]',
  General: 'border-[#021861]/30 bg-[#EAF4FF] text-[#021861]',
};

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-[#021861]" />
            <h1 className="text-base font-semibold tracking-tight text-[#101C3A]">
              Official Circulars &amp; Announcements
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#647794] leading-relaxed">
            Authoritative institutional circulars issued by the Council of Wardens, Estate Office, and Mess Council.
          </p>
        </div>
        <div className="flex gap-2 sm:ml-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-smooth ${
                selectedCategory === cat
                  ? 'bg-[#021861] text-white'
                  : 'border border-[#DCE6F2] bg-[#FFFFFF] text-[#101C3A] hover:bg-[#F5F7FF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-96">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[#647794]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search circulars..."
          className="w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] py-2 pl-9 pr-3 text-sm text-[#101C3A] placeholder:text-[#647794] focus:border-[#3F51B5] focus:outline-none focus:ring-1 focus:ring-[#3F51B5]"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-[#DC143C]/30 bg-[#FDF2F2] p-4 text-xs text-[#DC143C]">
          <div className="font-semibold">Notice Retrieval Error</div>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const priorityStyle = PRIORITY_STYLES[item.priority];
            const categoryStyle = CATEGORY_STYLES[item.category];
            return (
              <article
                key={item.id}
                className={`rounded-lg border p-5 transition-smooth ${
                  item.is_pinned
                    ? 'border-[#DC143C]/40 bg-[#FDF2F2]/30'
                    : priorityStyle.border + ' hover:border-[#3F51B5]/40 bg-[#FFFFFF]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE6F2]/60 pb-3">
                  <div className="flex items-center space-x-2">
                    {item.is_pinned && (
                      <span className="inline-flex items-center rounded border border-[#DC143C]/40 bg-[#FDF2F2] px-2 py-0.5 text-[9px] font-semibold text-[#DC143C] uppercase">
                        <Pin className="h-3 w-3" />
                        Pinned Notice
                      </span>
                    )}
                    <span className={`rounded border px-2 py-0.5 text-[9px] font-semibold ${categoryStyle}`}>
                      {item.category}
                    </span>
                    {item.priority === 'Urgent' && (
                      <span className="inline-flex items-center rounded border border-[#DC143C]/30 bg-[#FDF2F2] px-2 py-0.5 text-[9px] font-semibold text-[#DC143C] uppercase">
                        <Shield className="h-3 w-3" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-[#647794]">
                    <Calendar className="h-3 w-3" />
                    <span>{item.created_at.slice(0, 10)}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h2 className="text-sm font-semibold text-[#101C3A]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#101C3A] whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#DCE6F2]/60 pt-3 text-[10px] text-[#647794]">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-[#021861]" />
                    <span className="font-medium text-[#101C3A]">{item.author_name}</span>
                  </div>
                  <div>
                    <Badge variant="info" className="text-[9px]">
                      Target: {item.target_audience}
                    </Badge>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyState
            icon={Bell}
            title={loading ? 'Retrieving circulars...' : 'No circulars found'}
            description={
              loading
                ? 'Connecting to institutional notices database...'
                : 'There are currently no circulars matching the selected category or search filter.'
            }
            accent="indigo"
          />
        )}
      </div>
    </div>
  );
}
