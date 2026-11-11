'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Building2, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

const MEN_HOSTELS = [
  { code: 'MH1', name: "Nelson Mandela Men's Hostel", icon: Building2 },
  { code: 'MH2', name: "Bhagat Singh Men's Hostel", icon: Building2 },
  { code: 'MH3', name: "Dr. S. Radhakrishnan Men's Hostel", icon: Building2 },
  { code: 'MH4', name: "Bharathi Men's Hostel", icon: Building2 },
];

const LADIES_HOSTELS = [
  { code: 'LH1', name: 'Sarojini Naidu Ladies Hostel', icon: Home },
  { code: 'LH2', name: 'Annai Teresa Ladies Hostel', icon: Home },
  { code: 'LH3', name: 'Indira Gandhi Ladies Hostel', icon: Home },
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
      // storage not available; continue anyway
    }
    router.push('/');
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      try { sessionStorage.setItem('hosteliq_hostel_selected', 'true'); } catch {}
    }
    router.push('/');
  };

  const TOTAL_HOSTELS = MEN_HOSTELS.length + LADIES_HOSTELS.length;

  return (
    <div className="min-h-screen bg-[#EAF4FF]">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#DCE6F2] bg-[#FFFFFF] px-4 md:px-6">
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-semibold tracking-wider text-[#021861] uppercase poppins">Student Portal</span>
          <span className="text-[#647794]">/</span>
          <span className="text-[#101C3A] font-semibold">Select Your Hostel</span>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold poppins tracking-tight text-[#101C3A]">
                Choose Your Residential Hostel
              </h2>
              <p className="text-base text-[#647794] leading-relaxed">
                Explore the residential hostels at Kalasalingam Academy of Research and Education.
              </p>
            </div>

            {/* Summary Section */}
            <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-6 shadow-card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#021861] poppins">Hostel Summary</h3>
                  <p className="text-xs text-[#647794]">
                    Static counts based on configured hostel list — not live occupancy data.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#647794] mb-1">
                    Total Residential Hostels
                  </div>
                  <div className="text-2xl font-bold text-[#101C3A] poppins">{TOTAL_HOSTELS}</div>
                </div>
                <div className="rounded-lg border border-[#DCE6F2] bg-[#EAF4FF] p-5 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#021861] mb-1">
                    Men&rsquo;s Hostels
                  </div>
                  <div className="text-2xl font-bold text-[#3F51B5] poppins">{MEN_HOSTELS.length}</div>
                </div>
                <div className="rounded-lg border border-[#DCE6F2] bg-[#FDF2F2] p-5 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#DC143C] mb-1">
                    Ladies&rsquo; Hostels
                  </div>
                  <div className="text-2xl font-bold text-[#DC143C] poppins">{LADIES_HOSTELS.length}</div>
                </div>
              </div>
            </div>

            {/* Men's Hostels Section */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-4 w-4 text-[#021861]" />
                <h3 className="text-sm font-semibold poppins text-[#101C3A] uppercase tracking-wider">Men&rsquo;s Hostels</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MEN_HOSTELS.map((h) => {
                  const Icon = h.icon;
                  const isSelected = selected === h.code;
                  return (
                    <button
                      key={h.code}
                      onClick={() => handleSelect(h.code)}
                      className={`flex flex-col items-center space-y-2 rounded-xl border p-5 text-center transition-smooth ${
                        isSelected
                          ? 'border-[#3F51B5] bg-[#EAF4FF] shadow-[0_0_20px_rgba(63,81,181,0.12)]'
                          : 'border-[#DCE6F2] bg-[#FFFFFF] hover:border-[#3F51B5]/50 hover:bg-[#F5F7FF]'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-smooth ${
                        isSelected
                          ? 'bg-[#3F51B5] text-white'
                          : 'bg-[#EAF4FF] text-[#021861]'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#101C3A] block">{h.code}</span>
                      <span className="text-xs text-[#647794] leading-tight block line-clamp-2">{h.name}</span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-[#3F51B5]" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Ladies' Hostels Section */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-4 w-4 text-[#3F51B5]" />
                <h3 className="text-sm font-semibold poppins text-[#101C3A] uppercase tracking-wider">Ladies&rsquo; Hostels</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LADIES_HOSTELS.map((h) => {
                  const Icon = h.icon;
                  const isSelected = selected === h.code;
                  return (
                    <button
                      key={h.code}
                      onClick={() => handleSelect(h.code)}
                      className={`flex flex-col items-center space-y-2 rounded-xl border p-5 text-center transition-smooth ${
                        isSelected
                          ? 'border-[#3F51B5] bg-[#EAF4FF] shadow-[0_0_20px_rgba(63,81,181,0.12)]'
                          : 'border-[#DCE6F2] bg-[#FFFFFF] hover:border-[#3F51B5]/50 hover:bg-[#F5F7FF]'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-smooth ${
                        isSelected
                          ? 'bg-[#3F51B5] text-white'
                          : 'bg-[#EAF4FF] text-[#021861]'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#101C3A] block">{h.code}</span>
                      <span className="text-xs text-[#647794] leading-tight block line-clamp-2">{h.name}</span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-[#3F51B5]" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Information Panel */}
            <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-6 shadow-card">
              <div className="flex items-start space-x-3 mb-3">
                <Building2 className="h-5 w-5 text-[#021861] flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-[#101C3A]">Hostel Selection</h4>
                  <p className="text-sm text-[#647794] leading-relaxed">
                    Students can optionally choose their residential hostel from the cards above before continuing to the student dashboard. Selection is stored for the current session and can be changed anytime.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-[#DCE6F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs text-[#647794]">
                  <span className="w-2 h-2 rounded-full bg-[#647794]" />
                  <span>Optional &mdash; skip to continue to dashboard</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSkip}
                    disabled={confirming}
                    className="inline-flex items-center space-x-2 rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-4 py-2 text-xs font-medium text-[#647794] hover:bg-[#F5F7FF] transition-smooth disabled:opacity-60"
                  >
                    Skip &amp; Continue
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selected || confirming}
                    className={`inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold transition-smooth disabled:opacity-60 disabled:cursor-not-allowed ${
                      !selected
                        ? 'bg-[#FFFFFF] border border-[#DCE6F2] text-[#647794]'
                        : 'bg-[#021861] text-white hover:bg-[#3F51B5] focus:outline-none focus:ring-2 focus:ring-[#3F51B5] focus:ring-offset-2'
                    }`}
                  >
                    {confirming ? (
                      <>
                        <ArrowRight className="h-3.5 w-3.5 animate-spin" />
                        <span>Continuing\u2026</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Dashboard</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Link
                  href="/login"
                  className="text-xs text-[#647794] hover:text-[#021861] underline underline-offset-4"
                >
                  Change account &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
