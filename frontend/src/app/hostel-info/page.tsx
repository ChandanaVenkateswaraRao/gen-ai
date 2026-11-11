'use client';

import React from 'react';
import Link from 'next/link';
import { Home, MapPin, Building2, GraduationCap, Bell, Shield, Search, FileText, AlertCircle, Phone, Clock, Sparkles } from 'lucide-react';

const HOSTELS = [
  { name: 'Nelson Mandela Men\'s Hostel', code: 'MH1', type: "Men's Hostel", capacity: '520 Residents', icon: Building2 },
  { name: 'Bhagat Singh Men\'s Hostel', code: 'MH2', type: "Men's Hostel", capacity: '480 Residents', icon: Building2 },
  { name: 'Dr. S. Radhakrishnan Men\'s Hostel', code: 'MH3', type: "Men's Hostel", capacity: '610 Residents', icon: Building2 },
  { name: 'Bharathi Men\'s Hostel', code: 'MH4', type: "Men's Hostel", capacity: '390 Residents', icon: Building2 },
  { name: 'Sarojini Naidu Ladies Hostel', code: 'LH1', type: "Ladies Hostel", capacity: '450 Residents', icon: Home },
  { name: 'Annai Teresa Ladies Hostel', code: 'LH2', type: "Ladies Hostel", capacity: '580 Residents', icon: Home },
  { name: 'Indira Gandhi Ladies Hostel', code: 'LH3', type: "Ladies Hostel", capacity: '400 Residents', icon: Home },
] as const;

const FACILITIES = [
  { name: 'High-Speed Wi-Fi', icon: Search, desc: 'Campus-wide wireless internet access across all rooms and study corridors.' },
  { name: 'Laundry & Housekeeping', icon: Bell, desc: 'Automated on-site laundromat and daily common area sanitation.' },
  { name: 'RO Drinking Water', icon: MapPin, desc: 'Multi-stage reverse osmosis purified water dispensers on every floor.' },
  { name: 'Hostel Libraries & TV Rooms', icon: FileText, desc: 'Air-conditioned study lounges and common entertainment spaces.' },
  { name: '24/7 Medical Assistance', icon: AlertCircle, desc: 'On-call university medical center and emergency ambulance support.' },
  { name: 'Student Help-desk Support', icon: GraduationCap, desc: 'Dedicated resident help-desk for queries and room maintenance.' },
  { name: 'CCTV Surveillance', icon: Shield, desc: 'Continuous 24/7 perimeter monitoring across all hostel gates and corridors.' },
  { name: 'Biometric Attendance', icon: GraduationCap, desc: 'Automated biometric touch-points for verified evening attendance logging.' },
] as const;

export default function HostelInfoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
            Campus Accommodation Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
            KARE University Hostels &amp; Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Kalasalingam Academy of Research and Education &mdash; Comprehensive guide to the 7 residential hostels, campus living infrastructure, and resident amenities.
          </p>
        </div>
      </div>

      {/* Published Hostels Grid */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
          <Building2 className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Official Residential Hostels
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOSTELS.map((h) => {
            const Icon = h.icon;
            const isLadies = h.type.includes('Ladies');
            return (
              <div
                key={h.code}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isLadies ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'
                  } group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 rounded-md px-2 py-0.5">
                    {h.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                  {h.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Approx. {h.capacity}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isLadies ? 'text-purple-600' : 'text-indigo-600'
                  }`}>
                    {h.type}
                  </span>
                  <span className="text-[10px] text-slate-400">Campus Block</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facilities Showcase */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Resident Amenities &amp; Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FACILITIES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover-lift transition-all space-y-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  {f.name}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warden Office & Emergency Contacts */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Phone className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Hostel Helpdesk &amp; Warden Administration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Chief Warden Desk</span>
            <div className="font-semibold text-slate-900">Office-101, Admin Block</div>
            <div className="text-[11px] text-slate-500 mt-0.5">warden@klu.ac.in</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Emergency Help-line</span>
            <div className="font-semibold text-slate-900">24/7 Campus Security</div>
            <div className="text-[11px] text-slate-500 mt-0.5">+91 (04563) 289-042</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Gate Curfew Hours</span>
            <div className="font-semibold text-slate-900">9:00 PM (Daily)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Requires Out-pass Authorization</div>
          </div>
        </div>
      </div>
    </div>
  );
}
