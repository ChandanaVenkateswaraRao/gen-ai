'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import WelcomePage from '@/app/welcome/page';
import { OverviewPage } from './page-dashboard';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth, currentRole } = useApp();

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && typeof window !== 'undefined') {
      if (currentRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoadingAuth, currentRole, router]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-[#021861] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-cobalt flex items-center justify-center animate-pulse-slow">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <p className="text-xs text-[#C7D2FE]">Verifying University Session\u2026</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <WelcomePage />;
  }

  return <OverviewPage />;
}
