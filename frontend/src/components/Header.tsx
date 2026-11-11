'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Shield, User, LogOut, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const pathname = usePathname();
  const { currentRole, currentUser, logout, setMobileMenuOpen } = useApp();

  const getPageInfo = () => {
    switch (pathname) {
      case '/':
        return { title: 'Student Dashboard', section: 'Residential Life' };
      case '/hostel-selection':
        return { title: 'Hostel Selection', section: 'Accommodations' };
      case '/ask':
        return { title: 'Ask HostelIQ AI', section: 'Policy Intelligence' };
      case '/mess-menu':
        return { title: 'Mess & Dining Schedule', section: 'Dining Services' };
      case '/announcements':
        return { title: 'Circulars & Official Notices', section: 'Communications' };
      case '/complaints':
        return { title: 'Maintenance Grievances', section: 'Student Services' };
      case '/admin':
        return { title: 'Administrative Control Center', section: 'Hostel Governance' };
      case '/admin/documents':
        return { title: 'Approved Policy Documents', section: 'Knowledge Base' };
      case '/admin/mess-editor':
        return { title: 'Mess Schedule Matrix', section: 'Dining Operations' };
      case '/admin/announcements':
        return { title: 'Publish Notices & Alerts', section: 'Communications' };
      case '/admin/complaints':
        return { title: 'Complaint Triage & Resolution', section: 'Facility Operations' };
      case '/admin/logs':
        return { title: 'System Audit Trail', section: 'Compliance & Audits' };
      default:
        return { title: 'Residential Portal', section: 'HostelIQ' };
    }
  };

  const { title, section } = getPageInfo();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 md:px-6 backdrop-blur-md transition-all">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="btn-press rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Sleek Breadcrumbs */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="font-semibold text-indigo-600 tracking-wide uppercase text-[10px]">
            {section}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold text-slate-900 tracking-tight">{title}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Role & User Pill */}
        {currentUser && (
          <div className="flex items-center space-x-2 rounded-full border border-slate-200/90 bg-white px-3 py-1 text-xs shadow-subtle">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentRole === 'admin' ? (
              <span className="font-semibold text-indigo-700 text-[11px] uppercase tracking-wider">Admin</span>
            ) : (
              <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">Student</span>
            )}
            <span className="hidden text-slate-300 md:inline">•</span>
            <span className="hidden font-medium text-slate-600 md:inline truncate max-w-xs text-xs">
              {currentUser.email}
            </span>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={logout}
          title="Sign out of portal"
          className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-subtle"
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
