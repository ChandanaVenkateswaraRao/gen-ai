'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { OperationalOverview } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import {
  AlertCircle,
  FileText,
  UtensilsCrossed,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Home,
  Bot,
  Building2,
  Loader2,
} from 'lucide-react';

const STAT_CARDS = [
  {
    label: 'Total Complaints',
    icon: AlertCircle,
    valueKey: 'total_complaints',
    subtitle: 'Logged across residential blocks',
    highlight: false,
  },
  {
    label: 'Pending Triage',
    icon: Clock,
    valueKey: 'pending_complaints',
    subtitle: 'Requires warden review',
    highlight: true,
  },
  {
    label: 'Resolved Issues',
    icon: CheckCircle2,
    valueKey: 'resolved_complaints',
    subtitle: 'Verified work orders completed',
    highlight: false,
  },
  {
    label: 'Indexed Documents',
    icon: FileText,
    valueKey: 'indexed_documents',
    subtitle: 'Vector chunks in knowledge base',
    highlight: false,
  },
] as const;

const HOSTELS = [
  { name: 'Nelson Mandela Men\'s Hostel', code: 'MH1', type: "Men's Hostel" },
  { name: 'Bhagat Singh Men\'s Hostel', code: 'MH2', type: "Men's Hostel" },
  { name: 'Dr. S. Radhakrishnan Men\'s Hostel', code: 'MH3', type: "Men's Hostel" },
  { name: 'Bharathi Men\'s Hostel', code: 'MH4', type: "Men's Hostel" },
  { name: 'Sarojini Naidu Ladies Hostel', code: 'LH1', type: "Ladies Hostel" },
  { name: 'Annai Teresa Ladies Hostel', code: 'LH2', type: "Ladies Hostel" },
  { name: 'Indira Gandhi Ladies Hostel', code: 'LH3', type: "Ladies Hostel" },
] as const;

const MODULES = [
  { href: '/ask', label: 'HostelIQ AI Assistant', icon: Bot, desc: 'Ask about hostel policies grounded in approved documents.' },
  { href: '/mess-menu', label: 'Mess Menu', icon: UtensilsCrossed, desc: "View today's dining schedule and the 7-day meal roster." },
  { href: '/announcements', label: 'Announcements', icon: Bell, desc: 'Check official circulars and wardens\' updates.' },
  { href: '/complaints', label: 'Complaints', icon: AlertCircle, desc: 'Submit maintenance grievances and track work orders.' },
  { href: '/hostel-info', label: 'Hostel Information', icon: Home, desc: 'View KARE hostel names, blocks, and campus facilities.' },
] as const;

export function OverviewPage() {
  const { currentUser, currentRole } = useApp();
  const [overview, setOverview] = useState<OperationalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOverview();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved': return <Badge variant="success">Resolved</Badge>;
      case 'In Progress': return <Badge variant="primary">In Progress</Badge>;
      case 'Under Review': return <Badge variant="info">Under Review</Badge>;
      case 'Rejected': return <Badge variant="error">Rejected</Badge>;
      default: return <Badge variant="warning">Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col lg:flex-shrink-0">
          <div className="flex items-center space-x-2.5 mb-1">
            <Building2 className="h-4 w-4 text-[#021861]" />
            <h1 className="text-base font-semibold tracking-tight text-[#101C3A] poppins">HostelIQ AI</h1>
          </div>
          <p className="text-xs text-[#647794] leading-relaxed">
            Kalasalingam Academy of Research and Education &mdash; Smart Hostel &amp; Residential Life Assistant. Daily mess dining, verified policy intelligence, and grievance management.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0 lg:ml-4">
          <span className="inline-flex items-center rounded border border-[#3F51B5]/30 bg-[#EAF4FF] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#021861] uppercase">
            {currentRole === 'admin' ? 'Administrator' : 'Student Resident'}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#101C3A] hover:bg-[#EAF4FF] transition-smooth disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Portal</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-[#DC143C]/30 bg-[#FDF2F2] p-4 text-xs text-[#DC143C]">
          <div className="font-semibold">Backend Connection Notice</div>
          <p className="mt-0.5">{error}. Ensure the backend server is running at port 8000.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 hover:border-[#3F51B5]/40 transition-smooth ${stat.highlight ? 'border-[#DC143C]/40' : ''}`}
          >
            <div className="flex items-center justify-between text-[#647794] mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.highlight ? 'text-[#DC143C]' : 'text-[#021861]'}`} />
            </div>
            <div className={`mt-1 text-2xl font-semibold tracking-tight text-[#101C3A] ${stat.highlight ? 'text-[#DC143C]' : ''}`}>
              {loading ? '\u2014' : (overview as any)[stat.valueKey] ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-[#647794]">{loading ? '\u2014' : stat.subtitle}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <Link key={mod.href} href={mod.href} className="group rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 hover:border-[#3F51B5]/40 transition-smooth">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF4FF] text-[#021861] group-hover:bg-[#3F51B5] group-hover:text-white transition-colors">
                <mod.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#647794] group-hover:text-[#3F51B5] transition-colors" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] mb-1">{mod.label}</h2>
            <p className="text-xs text-[#647794] leading-relaxed mb-4">{mod.desc}</p>
            <div className="h-1 w-full rounded-full bg-[#DCE6F2] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#021861] to-[#3F51B5] w-1/2" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5">
        <div className="border-b border-[#DCE6F2] pb-3 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] flex items-center space-x-2 poppins">
            <Home className="h-3.5 w-3.5 text-[#021861]" />
            KARE University Hostels
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {HOSTELS.map((h) => (
            <div key={h.code} className="rounded-lg border p-3 text-center transition-smooth hover:border-[#021861]/40 text-[#101C3A]">
              <Building2 className="mx-auto h-4 w-4 mb-1.5 text-[#021861]" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[#101C3A] block mb-1">{h.code}</span>
              <span className="text-[9px] text-[#647794] leading-tight block">{h.name.split(' ').slice(0, 3).join(' ')}</span>
              <span className="text-[9px] text-[#647794] block mt-1">{h.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5">
          <div className="flex items-center justify-between border-b border-[#DCE6F2] pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-[#021861]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A]">Official Circulars</h2>
            </div>
            <Link href="/announcements" className="text-[10px] font-medium text-[#021861] hover:underline">View All Notices \u2192</Link>
          </div>
          <div className="divide-y divide-[#DCE6F2]">
            {overview?.recent_announcements && overview.recent_announcements.length > 0 ? (
              overview.recent_announcements.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-2">
                    {item.is_pinned && (
                      <span className="rounded border border-[#DC143C]/40 bg-[#FDF2F2] px-1.5 py-0.2 text-[9px] font-semibold text-[#DC143C] uppercase">Pinned</span>
                    )}
                    <span className="text-[10px] font-medium text-[#647794]">{item.category}</span>
                    <span className="text-[#647794]">\u2022</span>
                    <span className="text-[10px] text-[#647794]">{item.created_at.slice(0, 10)}</span>
                  </div>
                  <h3 className="mt-1 text-xs font-semibold text-[#101C3A]">{item.title}</h3>
                  <p className="mt-1 text-[10px] leading-normal text-[#647794] line-clamp-2">{item.content}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#647794]">No active announcements published.</div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5">
          <div className="flex items-center justify-between border-b border-[#DCE6F2] pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-[#021861]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A]">Active Maintenance Records</h2>
            </div>
            <Link href="/complaints" className="text-[10px] font-medium text-[#021861] hover:underline">Submit / Track Complaints \u2192</Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DCE6F2] text-[10px] font-semibold uppercase text-[#647794]">
                  <th className="pb-2">Tracking ID</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2]">
                {overview?.recent_complaints && overview.recent_complaints.length > 0 ? (
                  overview.recent_complaints.slice(0, 4).map((c) => (
                    <tr key={c.id} className="hover:bg-[#F5F7FF]">
                      <td className="py-2.5 font-mono text-[10px] font-medium text-[#101C3A]">{c.tracking_id}</td>
                      <td className="py-2.5 text-[10px] text-[#647794]">{c.category}</td>
                      <td className="py-2.5 font-medium text-[#101C3A] truncate max-w-[160px]">{c.title}</td>
                      <td className="py-2.5 text-right">{getStatusBadge(c.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4">
                      <EmptyState icon={AlertCircle} title="No complaints logged" description="There are currently no active maintenance work orders in the database." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
