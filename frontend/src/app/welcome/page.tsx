'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  Bot,
  UtensilsCrossed,
  AlertCircle,
  Bell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Policy Assistant',
    desc: 'Instant, authoritative answers to hostel regulations grounded exclusively in university handbooks.',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: UtensilsCrossed,
    title: 'Smart Mess Roster',
    desc: 'Real-time 7-day dining schedule with dietary filters, calorie breakdowns, and committee approvals.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: AlertCircle,
    title: 'Digital Grievances',
    desc: 'Submit and track hostel maintenance work orders with verifiable tracking IDs and progress stages.',
    gradient: 'from-rose-500/20 to-amber-500/20',
    iconColor: 'text-rose-400',
  },
  {
    icon: Bell,
    title: 'Instant Circulars',
    desc: 'Official wardens council circulars, urgent emergency alerts, and institutional notices in real-time.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
];

const METRICS = [
  { label: 'Campus Hostels', value: '7 Hostels' },
  { label: 'Policy Retrieval', value: '100% Grounded' },
  { label: 'Resolution Desk', value: '24/7 Tracking' },
  { label: 'Institutional Domain', value: '@klu.ac.in' },
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
      <div className="min-h-screen bg-[#070B19] flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-glow animate-pulse">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs text-slate-400">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#070B19] text-white relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-500/20 via-blue-500/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/15 blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-glow">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-bold poppins tracking-tight text-white flex items-center gap-2">
              <span>HostelIQ AI</span>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                2.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Kalasalingam University
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/login')}
            className="btn-press hidden sm:inline-flex items-center space-x-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
          >
            <span>Sign In</span>
          </button>
          <button
            onClick={() => router.push('/login')}
            className="btn-press inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:from-indigo-500 hover:to-blue-500 transition-all"
          >
            <span>Access Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-12 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs text-indigo-300 shadow-sm backdrop-blur-md mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-medium">Intelligent Residential Life Operating System</span>
          <ChevronRight className="h-3 w-3 text-indigo-400/60" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight poppins max-w-3xl leading-[1.15] text-white animate-fade-in-up">
          Smart Hostel Living, <br />
          <span className="bg-gradient-to-r from-indigo-300 via-blue-200 to-white bg-clip-text text-transparent">
            Powered by Generative AI.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed animate-fade-in-up delay-100">
          Grounded policy intelligence, smart dining rosters, and verifiable maintenance tracking for students and wardens at Kalasalingam Academy of Research and Education.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto animate-fade-in-up delay-200">
          <button
            onClick={() => router.push('/login')}
            className="btn-press w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-7 text-sm font-semibold text-white shadow-glow hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2.5 group"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#features"
            className="btn-press w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
          >
            Explore Platform Features
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl pt-8 border-t border-white/10 animate-fade-in-up delay-300">
          {METRICS.map((metric, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-base font-bold text-white poppins">{metric.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-16 w-full max-w-4xl text-left">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Core Capabilities</span>
            <h2 className="text-2xl font-bold poppins text-white mt-1">Built for Students & Wardens</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 hover-lift backdrop-blur-sm"
                >
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${feat.gradient} flex items-center justify-center ${feat.iconColor} border border-white/10 mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight">{feat.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#070B19]/80 py-6 px-6 text-center backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Kalasalingam Academy of Research and Education &bull; Anand Nagar, Krishnankoil
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="h-3 w-3 text-indigo-400" />
            <span>Strict institutional single sign-on (@klu.ac.in)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
