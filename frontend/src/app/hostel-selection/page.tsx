'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Building2, Home, ArrowRight, Check, Shield, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

const MEN_HOSTELS = [
  { code: 'MH1', name: "Nelson Mandela Men's Hostel", type: "Men's Hostel", rooms: 'Single & Double occupancy', icon: Building2 },
  { code: 'MH2', name: "Bhagat Singh Men's Hostel", type: "Men's Hostel", rooms: 'Double & Triple occupancy', icon: Building2 },
  { code: 'MH3', name: "Dr. S. Radhakrishnan Men's Hostel", type: "Men's Hostel", rooms: 'AC & Non-AC Blocks', icon: Building2 },
  { code: 'MH4', name: "Bharathi Men's Hostel", type: "Men's Hostel", rooms: 'Attached Bathroom suites', icon: Building2 },
];

const LADIES_HOSTELS = [
  { code: 'LH1', name: 'Sarojini Naidu Ladies Hostel', type: 'Ladies Hostel', rooms: 'Deluxe & Regular wings', icon: Home },
  { code: 'LH2', name: 'Annai Teresa Ladies Hostel', type: 'Ladies Hostel', rooms: 'Triple & Quadruple rooms', icon: Home },
  { code: 'LH3', name: 'Indira Gandhi Ladies Hostel', type: 'Ladies Hostel', rooms: 'Senior scholar suites', icon: Home },
];

export default function HostelSelectionPage() {
  const router = useRouter();
  const { currentRole, currentUser } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (currentRole === 'admin') {
      router.replace('/admin');
    }
  }, [currentRole, router]);

  const HOSTEL_KEY = 'hosteliq_selected_hostel';

  const handleSelect = (code: string) => {
    setSelected(code);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(HOSTEL_KEY, selected);
        sessionStorage.setItem('hosteliq_hostel_selected', 'true');
      }
    } catch {
      // storage not available
    }
    router.push('/');
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      try { sessionStorage.setItem('hosteliq_hostel_selected', 'true'); } catch {}
    }
    router.push('/');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
              Campus Accommodation
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Choose Your Residential Hostel
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Select your assigned hostel block at Kalasalingam Academy of Research and Education to tailor your mess menus, circulars, and grievance tickets.
            </p>
          </div>

          <button
            onClick={handleSkip}
            className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-subtle shrink-0 self-start sm:self-auto"
          >
            <span>Skip for now</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Men's Hostels Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
          <Building2 className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Men&apos;s Residential Hostels
          </h2>
          <span className="text-xs text-slate-400">({MEN_HOSTELS.length} blocks)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEN_HOSTELS.map((h) => {
            const isSelected = selected === h.code;
            const Icon = h.icon;
            return (
              <div
                key={h.code}
                onClick={() => handleSelect(h.code)}
                className={`group relative rounded-2xl border p-5 shadow-card cursor-pointer transition-all hover-lift ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600 shadow-md'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {h.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                  {h.name}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  {h.rooms}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {h.type}
                  </span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ladies Hostels Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
          <Home className="h-4 w-4 text-purple-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Ladies&apos; Residential Hostels
          </h2>
          <span className="text-xs text-slate-400">({LADIES_HOSTELS.length} blocks)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LADIES_HOSTELS.map((h) => {
            const isSelected = selected === h.code;
            const Icon = h.icon;
            return (
              <div
                key={h.code}
                onClick={() => handleSelect(h.code)}
                className={`group relative rounded-2xl border p-5 shadow-card cursor-pointer transition-all hover-lift ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600 shadow-md'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {h.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                  {h.name}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  {h.rooms}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
                    {h.type}
                  </span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Confirmation Banner */}
      {selected && (
        <div className="sticky bottom-6 z-30 animate-slide-down">
          <div className="rounded-2xl border border-indigo-200 bg-white/95 p-4 sm:p-5 shadow-panel backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-glow">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Selected Hostel
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {[...MEN_HOSTELS, ...LADIES_HOSTELS].find((h) => h.code === selected)?.name} ({selected})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelected(null)}
                className="btn-press rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Change
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="btn-press inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <span>{confirming ? 'Confirming…' : 'Confirm & Enter Dashboard'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
