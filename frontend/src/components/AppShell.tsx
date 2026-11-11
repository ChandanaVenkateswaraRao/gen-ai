'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import EvidenceDrawer from '@/components/EvidenceDrawer';
import { Building2, Loader2 } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth, currentRole } = useApp();

  const isLoginPage = pathname === '/login';
  const isWelcomePage = pathname === '/';
  const isHostelSelection = pathname === '/hostel-selection';

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated && !isLoginPage && !isWelcomePage) {
        router.replace('/');
      } else if (isAuthenticated && isLoginPage) {
        router.replace(currentRole === 'admin' ? '/admin' : '/hostel-selection');
      } else if (isAuthenticated && currentRole === 'student' && pathname.startsWith('/admin')) {
        router.replace('/');
      } else if (isAuthenticated && currentRole === 'admin' && isHostelSelection) {
        router.replace('/admin');
      }
    }
  }, [isAuthenticated, isLoadingAuth, isLoginPage, isWelcomePage, isHostelSelection, currentRole, pathname, router]);

  // Login page renders standalone
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading auth state: Sleek obsidian splash with ambient glow
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070B19] text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-glow">
            <Building2 className="h-7 w-7 text-white" />
            <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-sm -z-10 animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm font-semibold tracking-tight text-white poppins">HostelIQ AI</div>
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>Verifying university session…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: render welcome screen at root, otherwise wait for redirect
  if (!isAuthenticated) {
    if (isWelcomePage) {
      return <>{children}</>;
    }
    return null;
  }

  // Authenticated application layout: Modern SaaS with sidebar, sticky header, ambient canvas
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-y-auto bg-[#F8FAFC] relative">
        {/* Subtle ambient light gradient at the top of the app canvas */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent pointer-events-none -z-0" />
        <Header />
        <main className="relative z-10 flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
      <EvidenceDrawer />
    </div>
  );
}
