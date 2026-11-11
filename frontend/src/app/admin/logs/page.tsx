'use client';

import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminLogsPage() {
  const { currentRole, currentUser } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <span className="rounded border border-[#021861]/30 bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#021861] font-mono">
            DOC_INGESTION
          </span>
        );
      case 'complaint_created':
        return (
          <span className="rounded border border-[#DC143C]/40 bg-[#FDF2F2] px-2 py-0.5 text-[10px] font-semibold text-[#DC143C] font-mono">
            COMPLAINT_FILED
          </span>
        );
      case 'complaint_status_updated':
        return (
          <span className="rounded border border-[#3F51B5]/30 bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#3F51B5] font-mono">
            STATUS_UPDATED
          </span>
        );
      case 'menu_updated':
        return (
          <span className="rounded border border-[#021861]/30 bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#021861] font-mono">
            MENU_ALTERATION
          </span>
        );
      default:
        return (
          <span className="rounded border border-[#DCE6F2] bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-semibold text-[#101C3A] font-mono">
            {eventType.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#DCE6F2] pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#101C3A] poppins">
            System Activity & Ingestion Audit Trail
          </h1>
          <p className="mt-0.5 text-xs text-[#647794]">
            Immutable system logs tracking document vectorization, database transactions, and administrative changes.
          </p>
        </div>
        <div>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#101C3A] hover:bg-[#EAF4FF]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit Logs</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-[#DC143C]/30 bg-[#FDF2F2] p-4 text-xs text-[#DC143C]">
          <div className="font-semibold">Log Retrieval Error</div>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] shadow-card">
        <div className="border-b border-[#DCE6F2] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScrollText className="h-4 w-4 text-[#101C3A]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] poppins">
              System Audit Entries ({totalEvents})
            </h2>
          </div>
          <span className="text-[11px] text-[#647794]">
            All records committed to database
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE6F2] bg-[#EAF4FF]/50 text-[11px] font-semibold uppercase text-[#647794]">
              <tr>
                <th className="px-5 py-3">Timestamp (UTC)</th>
                <th className="px-5 py-3">Event Type</th>
                <th className="px-5 py-3">Transaction Details</th>
                <th className="px-5 py-3 text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F2] font-mono text-[11px]">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F7FF] align-top">
                    <td className="px-5 py-3 text-[#647794] whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {getEventBadge(log.event_type)}
                    </td>
                    <td className="px-5 py-3 text-[#101C3A]">
                      <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-w-xl">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap font-sans">
                      <span className="inline-flex items-center space-x-1 text-[#3F51B5] font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Success</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={ScrollText}
                      title="No system log events"
                      description="No audit events have been recorded yet."
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
