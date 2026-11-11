'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  FileCheck2,
  UtensilsCrossed,
  Bell,
  Clock,
  ArrowRight,
  RefreshCw,
  Shield,
  Building2,
  ScrollText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { OperationalOverview } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';

const ADMIN_STAT_CARDS = [
  {
    label: 'Total Complaints',
    icon: AlertCircle,
    valueKey: 'total_complaints',
    subtitle: 'All submitted work orders',
    highlight: false,
  },
  {
    label: 'Unresolved / Triage',
    icon: Clock,
    valueKey: 'pending_complaints',
    subtitle: 'Requires warden assignment',
    highlight: true,
  },
  {
    label: 'Approved Documents',
    icon: FileCheck2,
    valueKey: 'indexed_documents',
    subtitle: 'Vector chunks in knowledge base',
    highlight: false,
  },
  {
    label: 'Active Circulars',
    icon: Bell,
    valueKey: 'active_announcements',
    subtitle: 'Published to residential portal',
    highlight: false,
  },
] as const;

const ADMIN_MODULES = [
  {
    href: '/admin/complaints',
    label: 'Complaint Triage Desk',
    icon: AlertCircle,
    desc: 'Update repair statuses, assign technicians, and record resolution remarks.',
  },
  {
    href: '/admin/documents',
    label: 'Document Ingestion',
    icon: FileCheck2,
    desc: 'Upload institutional policy PDFs, inspect chunk vectors, and manage index.',
  },
  {
    href: '/admin/mess-editor',
    label: 'Mess Schedule Matrix',
    icon: UtensilsCrossed,
    desc: 'Modify weekly meal schedules, timings, and dietary flags.',
  },
  {
    href: '/admin/announcements',
    label: 'Publish Circulars',
    icon: Bell,
    desc: 'Broadcast emergency alerts, maintenance schedules, and notices.',
  },
  {
    href: '/admin/logs',
    label: 'System & Audit Logs',
    icon: ScrollText,
    desc: 'Review immutable audit and ingestion trail.',
  },
] as const;

export default function AdminOverviewPage() {
  const { currentRole, currentUser } = useApp();
  const [overview, setOverview] = useState<OperationalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOverview();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to administrative metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col lg:flex-shrink-0">
          <div className="flex items-center space-x-2.5 mb-1">
            <Shield className="h-4 w-4 text-[#021861]" />
            <span className="inline-flex items-center rounded border border-[#3F51B5]/30 bg-[#EAF4FF] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#021861] uppercase">
              Role: Chief Warden / Administrator
            </span>
          </div>
          <h1 className="mt-1 text-base font-semibold tracking-tight text-[#101C3A] poppins">
            KARE Administrative Control Center
          </h1>
          <p className="text-xs text-[#647794] leading-relaxed">
            Institutional oversight for residential rules, mess schedule matrices, documents ingestion, and maintenance triage.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0 lg:ml-4">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#101C3A] hover:bg-[#EAF4FF] transition-smooth disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-[#DC143C]/30 bg-[#FDF2F2] p-4 text-xs text-[#DC143C]">
          <div className="font-semibold">Administrative Access Error</div>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {/* Real Metric Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ADMIN_STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 hover:border-[#3F51B5]/40 transition-smooth ${stat.highlight ? 'border-[#DC143C]/40' : ''}`}
          >
            <div className="flex items-center justify-between text-[#647794] mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {stat.label}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.highlight ? 'text-[#DC143C]' : 'text-[#021861]'}`} />
            </div>
            <div className={`mt-1 text-2xl font-semibold tracking-tight text-[#101C3A] ${stat.highlight ? 'text-[#DC143C]' : ''}`}>
              {loading ? '\u2014' : (overview as any)[stat.valueKey] ?? 0}
            </div>
            <div className="mt-1 text-[10px] text-[#647794]">
              {loading ? '\u2014' : stat.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Administration Modules */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ADMIN_MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 hover:border-[#3F51B5]/40 transition-smooth"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF4FF] text-[#021861] group-hover:bg-[#3F51B5] group-hover:text-white transition-colors">
                <mod.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#647794] group-hover:text-[#3F51B5] transition-colors" />
            </div>
            <h2 className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#101C3A]">
              {mod.label}
            </h2>
            <p className="mt-1.5 text-[10px] text-[#647794] leading-relaxed">
              {mod.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Unresolved Complaints Triage Preview */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF]">
        <div className="flex items-center justify-between border-b border-[#DCE6F2] px-5 py-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-[#DC143C]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A]">
              Pending Grievances Requiring Action
            </h2>
          </div>
          <Link
            href="/admin/complaints"
            className="text-[10px] font-medium text-[#021861] hover:underline"
          >
            Open Full Triage Desk \u2192
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE6F2] bg-[#EAF4FF]/50 text-[10px] font-semibold uppercase text-[#647794]">
              <tr>
                <th className="px-5 py-3">Tracking ID</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Room / Block</th>
                <th className="px-5 py-3">Issue Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F2]">
              {overview?.recent_complaints && overview.recent_complaints.filter((c) => c.status !== 'Resolved').length > 0 ? (
                overview.recent_complaints
                  .filter((c) => c.status !== 'Resolved')
                  .slice(0, 5)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-[#F5F7FF]">
                      <td className="px-5 py-3 font-mono font-medium text-[#101C3A]">
                        {c.tracking_id}
                      </td>
                      <td className="px-5 py-3 font-medium text-[#101C3A]">
                        {c.student_name}
                      </td>
                      <td className="px-5 py-3 text-[#647794]">
                        {c.room_number}, {c.block_name}
                      </td>
                      <td className="px-5 py-3 text-[#647794]">
                        {c.category}
                      </td>
                      <td className="px-5 py-3 font-medium text-[#101C3A]">
                        <span className={c.priority === 'Urgent' ? 'text-[#DC143C]' : c.priority === 'High' ? 'text-[#B80E00]' : 'text-[#101C3A]'}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded border border-[#DC143C]/40 bg-[#FDF2F2] px-2 py-0.5 text-[10px] font-medium text-[#B80E00]">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={AlertCircle}
                      title="No pending complaints"
                      description="There are no unresolved complaints in the database queue."
                      accent="crimson"
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
