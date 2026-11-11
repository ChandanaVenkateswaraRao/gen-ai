'use client';

import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, CheckCircle2, Shield, Search, Terminal, Clock, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminLogsPage() {
  const { currentRole, currentUser } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, [currentUser]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAuditLogs();
      setLogs(data.logs);
      setTotalEvents(data.total_events);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'document_uploaded':
        return (
          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 font-mono">
            DOC_INGESTION
          </span>
        );
      case 'complaint_created':
        return (
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 font-mono">
            COMPLAINT_FILED
          </span>
        );
      case 'complaint_status_updated':
        return (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 font-mono">
            STATUS_UPDATED
          </span>
        );
      case 'menu_updated':
        return (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
            MENU_ALTERATION
          </span>
        );
      case 'user_registered':
        return (
          <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 font-mono">
            USER_REGISTERED
          </span>
        );
      default:
        return (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
            {eventType?.toUpperCase() || 'SYSTEM_EVENT'}
          </span>
        );
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(q) ||
      (log.details ? JSON.stringify(log.details).toLowerCase() : '').includes(q) ||
      (log.user_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-slate-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Compliance &amp; System Audits
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              System Activity &amp; Ingestion Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Immutable system logs recording document vectorization, dining updates, user registrations, and administrative triage actions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadLogs}
              disabled={loading}
              className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle shrink-0 self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>Refresh Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter audit logs by action, payload keyword, or user identifier…"
          className="w-full rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-card focus:border-indigo-600 focus:outline-none"
        />
      </div>

      {/* Logs Table / Cards */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Audit Events ({filteredLogs.length} of {totalEvents})</span>
          <span className="font-mono text-[11px] text-slate-400">Chronological • UTC</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading audit trail…</div>
        ) : filteredLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {getEventBadge(log.action)}
                    <span className="font-mono text-[11px] text-slate-400 font-medium">
                      {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : '—'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {log.id ? String(log.id).slice(0, 8) : `LOG-${idx + 1}`}
                  </span>
                </div>

                {log.details && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 font-mono text-[11px] text-slate-700 whitespace-pre-wrap break-all">
                    {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ScrollText}
            title="No audit events found"
            description="Audit events will appear here automatically when actions occur in the portal."
          />
        )}
      </div>
    </div>
  );
}
