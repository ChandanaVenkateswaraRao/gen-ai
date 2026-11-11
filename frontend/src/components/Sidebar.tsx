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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const STUDENT_LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hostel-selection', label: 'Hostel Selection', icon: Building2 },
  { href: '/ask', label: 'Ask HostelIQ', icon: Search },
  { href: '/mess-menu', label: 'Mess Menu', icon: UtensilsCrossed },
  { href: '/announcements', label: 'Announcements', icon: Bell },
  { href: '/complaints', label: 'My Complaints', icon: AlertCircle },
];

const ADMIN_LINKS = [
  { href: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
  { href: '/admin/documents', label: 'Approved Documents', icon: FileCheck2 },
  { href: '/admin/mess-editor', label: 'Mess Schedule Editor', icon: CalendarCheck2 },
  { href: '/admin/announcements', label: 'Publish Notices', icon: Bell },
  { href: '/admin/complaints', label: 'Complaint Resolution', icon: AlertCircle },
  { href: '/admin/logs', label: 'System & Audit Logs', icon: ScrollText },
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
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#101C3A]/35 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#1A3A8C] bg-[#021861] transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 max-md:-translate-x-full' : '-translate-x-full max-md:-translate-x-full'
        }`}
      >
        {/* Institutional Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#1A3A8C] px-4 bg-[#021861]">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3F51B5] text-white shadow-glow">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-white poppins">
                HostelIQ AI
              </div>
              <div className="text-[10px] font-medium text-[#93B8FC]">
                {isStudent ? 'Student Residential Portal' : 'Administrative Desk'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1 text-[#93B8FC] hover:bg-[#1A3A8C] md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Authenticated User Status Tag */}
        <div className="border-b border-[#1A3A8C] px-4 py-3 bg-[#021861]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] font-medium text-[#93B8FC]">
              {isStudent ? (
                <>
                  <GraduationCap className="h-3.5 w-3.5 text-[#3F51B5]" />
                  <span className="font-semibold text-white uppercase tracking-wider">Student Portal</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-[#3F51B5]" />
                  <span className="font-semibold text-[#3F51B5] uppercase tracking-wider">Admin Console</span>
                </>
              )}
            </div>
            <span className="rounded border border-[#1A3A8C] bg-[#FFFFFF] px-1.5 py-0.5 text-[10px] font-medium text-[#647794]">
              Active Term
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#93B8FC]">
            {isStudent ? 'Student Services' : 'Hostel Governance'}
          </div>

          {navLinks.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-smooth ${
                  active
                    ? 'border-r-2 border-[#3F51B5] bg-[#EAF4FF] text-[#021861] font-semibold'
                    : 'text-[#93B8FC] hover:bg-[#1A3A8C] hover:text-white'
                }`}
              >
                <IconComponent
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-[#021861]' : 'text-[#93B8FC] group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Authenticated Profile Footer */}
        {currentUser && (
          <div className="border-t border-[#1A3A8C] bg-[#021861]/80 p-3">
            <div className="rounded-lg border border-[#1A3A8C] bg-[#FFFFFF] p-2.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="truncate text-xs font-semibold text-[#101C3A]">
                      {currentUser.full_name}
                    </span>
                    {currentRole === 'admin' ? (
                      <Shield className="h-3 w-3 text-[#021861]" />
                    ) : (
                      <User className="h-3 w-3 text-[#647794]" />
                    )}
                  </div>
                  <div className="truncate text-[10px] text-[#647794]">
                    {currentUser.room_number ? `${currentUser.room_number} \u2022 ${currentUser.block_name}` : currentUser.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out of institutional terminal"
                  className="rounded-lg border border-[#DCE6F2] p-1.5 text-[#647794] hover:bg-[#FDF2F2] hover:text-[#DC143C] hover:border-[#DC143C]/40 transition-smooth"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 text-center text-[9px] text-[#647794]">
                HostelIQ \u2022 Academic Term 2026
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
