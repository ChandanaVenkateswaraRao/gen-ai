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
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const STAT_CARDS = [
  {
    label: 'Total Complaints',
    icon: AlertCircle,
    valueKey: 'total_complaints',
    subtitle: 'Logged across residential blocks',
    badge: 'Real-time',
    gradient: 'from-blue-500/10 to-indigo-500/10',
    iconColor: 'text-indigo-600',
  },
  {
    label: 'Pending Triage',
    icon: Clock,
    valueKey: 'pending_complaints',
    subtitle: 'Awaiting warden assignment',
    badge: 'Action required',
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Resolved Issues',
    icon: CheckCircle2,
    valueKey: 'resolved_complaints',
    subtitle: 'Verified work orders completed',
    badge: 'Verified',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Indexed Documents',
    icon: FileText,
    valueKey: 'indexed_documents',
    subtitle: 'Policy chunks in knowledge base',
    badge: 'RAG Grounded',
    gradient: 'from-purple-500/10 to-pink-500/10',
    iconColor: 'text-purple-600',
  },
] as const;

const MODULES = [
  {
    href: '/ask',
    label: 'HostelIQ AI Assistant',
    icon: Bot,
    desc: 'Ask questions about regulations grounded in approved university handbooks.',
    tag: 'GenAI RAG',
    gradient: 'from-indigo-600 to-blue-600',
  },
  {
    href: '/mess-menu',
    label: 'Dining & Mess Menu',
    icon: UtensilsCrossed,
    desc: "View today's certified dining schedule and weekly 7-day meal roster.",
    tag: 'Daily Menu',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    href: '/announcements',
    label: 'Official Circulars',
    icon: Bell,
    desc: 'Stay informed with wardens council circulars and emergency hostel notices.',
    tag: 'Broadcasts',
    gradient: 'from-purple-600 to-indigo-600',
  },
  {
    href: '/complaints',
    label: 'Maintenance Grievances',
    icon: AlertCircle,
    desc: 'Submit maintenance complaints and track work order resolution stages.',
    tag: 'Tracking',
    gradient: 'from-rose-600 to-amber-600',
  },
  {
    href: '/hostel-info',
    label: 'Hostel Information',
    icon: Home,
    desc: 'Explore KARE hostels, residential blocks, amenities, and campus facilities.',
    tag: 'Directory',
    gradient: 'from-slate-700 to-slate-900',
  },
] as const;

export function OverviewPage() {
  const { currentUser } = useApp();
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
      case 'Resolved': return <Badge variant="success" dot>Resolved</Badge>;
      case 'In Progress': return <Badge variant="primary" dot>In Progress</Badge>;
      case 'Under Review': return <Badge variant="info" dot>Under Review</Badge>;
      case 'Rejected': return <Badge variant="error" dot>Rejected</Badge>;
      default: return <Badge variant="warning" dot>Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        {/* Soft radial background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-blue-500/5 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                HostelIQ AI 2.0 &bull; Student Operating System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Resident'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Kalasalingam Academy of Research and Education &mdash; Smart Hostel Portal. Access verified handbook intelligence, live mess dining rosters, and tracked maintenance work orders.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-press inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-subtle disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/ask"
              className="btn-press inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:from-indigo-500 hover:to-blue-500 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat, idx) => {
          const Icon = stat.icon;
          const value = overview ? (overview as any)[stat.valueKey] ?? '—' : '—';
          return (
            <div
              key={idx}
              className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-tight">
                  {stat.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 ${stat.iconColor} group-hover:scale-105 transition-transform`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900 poppins">
                  {loading ? '…' : value}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100/70 px-2 py-0.5 rounded-full">
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

      {/* Platform Services & Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight poppins">
              Residential Services
            </h2>
            <p className="text-xs text-slate-500">
              Direct access to essential hostel living tools and administrative desks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                href={mod.href}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all flex flex-col justify-between"
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
                  <span>Open Module</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity: Recent Complaints & Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Complaints Ticker (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Complaints</h3>
                <p className="text-[11px] text-slate-400">Latest maintenance grievance submissions</p>
              </div>
            </div>
            <Link
              href="/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading activity…</div>
          ) : overview?.recent_complaints && overview.recent_complaints.length > 0 ? (
            <div className="space-y-3">
              {overview.recent_complaints.slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-semibold text-slate-400">{c.tracking_id}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-[11px] text-slate-500">{c.category}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">
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
              No recent complaints logged in this term.
            </div>
          )}
        </div>

        {/* Live Announcements Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Circulars</h3>
                <p className="text-[11px] text-slate-400">Official wardens council alerts</p>
              </div>
            </div>
            <Link
              href="/announcements"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Priority Notice</span>
                <span className="text-[10px] text-slate-400">Wardens Council</span>
              </div>
              <div className="text-xs font-semibold text-indigo-950">
                Gate Curfew &amp; Evening Dining Regulations
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Curfew hours strictly enforced at 9:00 PM for all campus residential blocks. Ensure out-pass authorization for late entries.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Mess Committee</span>
                <span className="text-[10px] text-slate-400">Mess Council</span>
              </div>
              <div className="text-xs font-semibold text-slate-800">
                Weekend Special Dining Schedule Active
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Special South Indian and Continental dining options available this Sunday across all dining halls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
