'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import EvidenceDrawer from '@/components/EvidenceDrawer';
import { Loader2 } from 'lucide-react';

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

  // Login page renders standalone (no shell)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading auth state
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-[#021861] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo flex items-center justify-center animate-pulse-slow">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
          <p className="text-xs text-[#C7D2FE]">Verifying University Session\u2026</p>
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

  // Authenticated application layout
  return (
    <div className="flex min-h-screen bg-[#EAF4FF]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto bg-[#EAF4FF]">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full w-full">
          {children}
        </main>
      </div>
      <EvidenceDrawer />
    </div>
  );
}
