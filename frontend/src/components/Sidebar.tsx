'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  Search,
  UtensilsCrossed,
  Bell,
  AlertCircle,
  CalendarCheck2,
  FileCheck2,
  ScrollText,
  ShieldCheck,
  GraduationCap,
  LogOut,
  X,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const STUDENT_LINKS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/hostel-selection', label: 'Hostel Selection', icon: Building2 },
  { href: '/ask', label: 'Ask HostelIQ AI', icon: Sparkles },
  { href: '/mess-menu', label: 'Mess & Dining', icon: UtensilsCrossed },
  { href: '/announcements', label: 'Circulars & Notices', icon: Bell },
  { href: '/complaints', label: 'Maintenance Desk', icon: AlertCircle },
];

const ADMIN_LINKS = [
  { href: '/admin', label: 'Control Center', icon: ShieldCheck },
  { href: '/admin/documents', label: 'Approved Documents', icon: FileCheck2 },
  { href: '/admin/mess-editor', label: 'Mess Schedule Matrix', icon: CalendarCheck2 },
  { href: '/admin/announcements', label: 'Publish Circulars', icon: Bell },
  { href: '/admin/complaints', label: 'Complaint Resolution', icon: AlertCircle },
  { href: '/admin/logs', label: 'Audit Trail & Logs', icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole, currentUser, logout, mobileMenuOpen, setMobileMenuOpen } = useApp();

  const navLinks = currentRole === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;
  const isStudent = currentRole === 'student';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop with Blur */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#070B19] text-white transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5 bg-[#070B19]">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-glow">
              <Building2 className="h-5 w-5" />
              <div className="absolute -inset-0.5 rounded-xl bg-indigo-500/20 blur-sm -z-10" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white poppins flex items-center gap-1.5">
                <span>HostelIQ AI</span>
                <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-300">
                  2.0
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                {isStudent ? 'Student Residential Portal' : 'Administrative Console'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white md:hidden transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Tag */}
        <div className="border-b border-white/[0.06] px-5 py-3 bg-[#0A1128]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px] font-medium text-slate-300">
              {isStudent ? (
                <>
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-200 uppercase tracking-wider">Resident</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-200 uppercase tracking-wider">Warden Staff</span>
                </>
              )}
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400">
              Term 2026
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {isStudent ? 'Residential Life' : 'Campus Governance'}
          </div>

          {navLinks.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group relative flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-150 ${
                  active
                    ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/10 backdrop-blur-md'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-indigo-400 shadow-glow" />
                )}
                <IconComponent
                  className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                    active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Authenticated User Footer */}
        {currentUser && (
          <div className="border-t border-white/[0.08] bg-[#070B19] p-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="truncate text-xs font-semibold text-white">
                      {currentUser.full_name}
                    </span>
                    {currentRole === 'admin' ? (
                      <Shield className="h-3 w-3 text-indigo-400 shrink-0" />
                    ) : (
                      <User className="h-3 w-3 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div className="truncate text-[10px] text-slate-400">
                    {currentUser.room_number ? `${currentUser.room_number} • ${currentUser.block_name}` : currentUser.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out of portal"
                  className="btn-press rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all shrink-0"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 text-center text-[9px] text-slate-400/80 tracking-wide">
                Kalasalingam University
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
