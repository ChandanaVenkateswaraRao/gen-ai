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
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { OperationalOverview } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

const ADMIN_STAT_CARDS = [
  {
    label: 'Total Complaints',
    icon: AlertCircle,
    valueKey: 'total_complaints',
    subtitle: 'All submitted resident grievances',
    badge: 'Registry',
    iconColor: 'text-rose-600',
  },
  {
    label: 'Unresolved / Triage',
    icon: Clock,
    valueKey: 'pending_complaints',
    subtitle: 'Awaiting warden assignment',
    badge: 'Action Needed',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Approved Documents',
    icon: FileCheck2,
    valueKey: 'indexed_documents',
    subtitle: 'Vector chunks in knowledge base',
    badge: 'RAG Grounded',
    iconColor: 'text-indigo-600',
  },
  {
    label: 'Active Circulars',
    icon: Bell,
    valueKey: 'active_announcements',
    subtitle: 'Broadcasted to student portal',
    badge: 'Live',
    iconColor: 'text-emerald-600',
  },
] as const;

const ADMIN_MODULES = [
  {
    href: '/admin/complaints',
    label: 'Complaint Triage Desk',
    icon: AlertCircle,
    desc: 'Review incoming grievances, assign technicians, and record resolution remarks.',
    tag: 'Maintenance',
    gradient: 'from-rose-600 to-amber-600',
  },
  {
    href: '/admin/documents',
    label: 'Document Ingestion & RAG',
    icon: FileCheck2,
    desc: 'Upload institutional policy PDFs, inspect chunk vectors, and manage index.',
    tag: 'Knowledge Base',
    gradient: 'from-indigo-600 to-blue-600',
  },
  {
    href: '/admin/mess-editor',
    label: 'Mess Schedule Matrix',
    icon: UtensilsCrossed,
    desc: 'Modify weekly meal schedules, timings, and dietary flags for all hostels.',
    tag: 'Dining Ops',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    href: '/admin/announcements',
    label: 'Publish Circulars',
    icon: Bell,
    desc: 'Broadcast emergency alerts, maintenance schedules, and official notices.',
    tag: 'Broadcasting',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    href: '/admin/logs',
    label: 'System & Audit Logs',
    icon: ScrollText,
    desc: 'Review immutable audit trails, user logins, and document vectorization trails.',
    tag: 'Compliance',
    gradient: 'from-slate-700 to-slate-900',
  },
] as const;

export default function AdminOverviewPage() {
  const { currentRole, currentUser } = useApp();
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
      setError(err.message || 'Failed to load administrative overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved': return <Badge variant="success" dot>Resolved</Badge>;
      case 'In Progress': return <Badge variant="primary" dot>In Progress</Badge>;
      case 'Under Review': return <Badge variant="info" dot>Under Review</Badge>;
      case 'Rejected': return <Badge variant="error" dot>Rejected</Badge>;
      default: return <Badge variant="warning" dot>Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                HostelIQ AI &bull; Administrative Control Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Welcome, {currentUser?.full_name || 'Hostel Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Kalasalingam Academy of Research and Education &mdash; Residential Governance Console. Manage approved rulebook vectorization, weekly dining rosters, and student work orders.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-press inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-subtle disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>Sync Metrics</span>
            </button>
            <Link
              href="/admin/complaints"
              className="btn-press inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Triage Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_STAT_CARDS.map((stat, idx) => {
          const Icon = stat.icon;
          const value = overview ? (overview as any)[stat.valueKey] ?? '—' : '—';
          return (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-tight">
                  {stat.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 ${stat.iconColor}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900 poppins">
                  {loading ? '…' : value}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {stat.badge}
                </span>
              </div>

              <p className="mt-2 text-[11px] text-slate-400 leading-snug">
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Governance Desks Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight poppins">
          Hostel Governance Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADMIN_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                href={mod.href}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${mod.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {mod.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {mod.label}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Open Desk</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Grievance Queue for Triage */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pending Grievances Awaiting Action</h3>
              <p className="text-[11px] text-slate-400">Incoming resident maintenance reports needing review</p>
            </div>
          </div>
          <Link
            href="/admin/complaints"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            <span>Open Triage Queue</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading triage queue…</div>
        ) : overview?.recent_complaints && overview.recent_complaints.length > 0 ? (
          <div className="space-y-3">
            {overview.recent_complaints.slice(0, 5).map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                      {c.tracking_id}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-[11px] font-medium text-slate-600">{c.room_number} &bull; {c.block_name}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 truncate mt-1">
                    {c.title}
                  </div>
                </div>
                <div>
                  {getStatusBadge(c.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            All maintenance grievances have been reviewed and assigned.
          </div>
        )}
      </div>
    </div>
  );
}
