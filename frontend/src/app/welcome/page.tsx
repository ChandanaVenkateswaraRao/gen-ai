'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Building2, Bot, UtensilsCrossed, AlertCircle, Bell, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Hostel Assistant',
    desc: 'Ask questions about hostel information grounded in approved documents.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Smart Mess',
    desc: 'Access the weekly mess menu and dining schedules.',
  },
  {
    icon: AlertCircle,
    title: 'Digital Complaints',
    desc: 'Submit and track hostel maintenance complaints.',
  },
  {
    icon: Bell,
    title: 'Instant Announcements',
    desc: 'View official hostel notices and circulars.',
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#021861] flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-10 h-10 rounded-lg bg-indigo flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <p className="text-xs text-baby-blue">Verifying University Session\u2026</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#021861] text-white overflow-y-auto px-4 pt-8 md:pt-12 pb-8 box-border">
      {/* Main welcome content — natural document flow, no clipping */}
      <main className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl mx-auto text-center pt-4 pb-4">
        {/* Top Branding */}
        <div className="inline-flex items-center space-x-3 animate-scale-in delay-100" style={{ animationDelay: '100ms' }}>
          <div className="w-14 h-14 rounded-xl bg-[#3F51B5] flex items-center justify-center shadow-glow">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-semibold tracking-wider text-baby-blue uppercase">
              HostelIQ AI
            </div>
            <div className="text-xl font-bold poppins tracking-tight">HostelIQ AI</div>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {/* Main heading */}
          <div className="animate-fade-in-up delay-400" style={{ animationDelay: '400ms' }}>
            <h1 className="text-[clamp(1.5rem,7vw,3rem)] font-bold tracking-tight leading-[1.25] poppins text-white text-center max-w-[92%] mx-auto">
              WELCOME TO<br />
              <span className="text-baby-blue">HOSTELIQ AI</span>
            </h1>
          </div>

          {/* University name */}
          <div className="animate-fade-in-up delay-800" style={{ animationDelay: '800ms' }}>
            <h2 className="text-[clamp(0.85rem,3vw,1rem)] font-medium tracking-[0.15em] text-baby-blue uppercase max-w-[92%] mx-auto leading-relaxed">
              KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION
            </h2>
          </div>

          {/* Tagline */}
          <div className="animate-fade-in-up delay-1000" style={{ animationDelay: '1000ms' }}>
            <p className="text-[clamp(0.95rem,3.5vw,1.125rem)] text-white/90 leading-relaxed max-w-[92%] mx-auto">
              Your Hostel Life, Made Smarter.
            </p>
          </div>

          {/* GET STARTED button */}
          <div className="animate-fade-in-up delay-1300" style={{ animationDelay: '1300ms' }}>
            <button
              onClick={() => router.push('/login')}
              className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-white text-[#021861] font-bold text-[clamp(0.85rem,3vw,1rem)] tracking-wide uppercase flex items-center justify-center space-x-2 mx-auto shadow-glow hover:bg-[#3F51B5] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-baby-blue focus:ring-offset-2 focus:ring-offset-[#021861] group"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-[#021861]" />
            </button>
          </div>
        </div>

        {/* Feature section */}
        <div className="mt-10 animate-fade-in-up delay-1600" style={{ animationDelay: '1600ms' }}>
          <p className="text-[10px] font-semibold tracking-wider text-baby-blue uppercase mb-6">
            Smart Hostel Management Platform
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-md mx-auto">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex flex-col items-center space-y-2 p-3 rounded-lg border border-[#3F51B5]/20 bg-[#EAF4FF]/10 text-center hover:border-[#3F51B5]/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#021861]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-center space-y-0.5">
                    <span className="text-xs font-semibold text-white leading-tight">{f.title}</span>
                    <span className="text-[10px] text-white/80 leading-tight line-clamp-2">
                      {f.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 animate-fade-in-up delay-1800" style={{ animationDelay: '1800ms' }}>
          <p className="text-[10px] text-white/60 tracking-wide uppercase">
            Kalasalingam Academy of Research and Education
          </p>
        </div>
      </main>
    </div>
  );
}
