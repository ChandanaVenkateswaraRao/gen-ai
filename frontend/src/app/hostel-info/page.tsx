'use client';

import React from 'react';
import Link from 'next/link';
import { Home, MapPin, Building2, GraduationCap, Bell, Shield, Search, FileText, AlertCircle } from 'lucide-react';

const HOSTELS = [
  { name: 'Nelson Mandela Men\'s Hostel', code: 'MH1', type: "Men's Hostel", icon: Building2 },
  { name: 'Bhagat Singh Men\'s Hostel', code: 'MH2', type: "Men's Hostel", icon: Building2 },
  { name: 'Dr. S. Radhakrishnan Men\'s Hostel', code: 'MH3', type: "Men's Hostel", icon: Building2 },
  { name: 'Bharathi Men\'s Hostel', code: 'MH4', type: "Men's Hostel", icon: Building2 },
  { name: 'Sarojini Naidu Ladies Hostel', code: 'LH1', type: "Ladies Hostel", icon: Building2 },
  { name: 'Annai Teresa Ladies Hostel', code: 'LH2', type: "Ladies Hostel", icon: Building2 },
  { name: 'Indira Gandhi Ladies Hostel', code: 'LH3', type: "Ladies Hostel", icon: Building2 },
] as const;

const FACILITIES = [
  { name: 'Wi-Fi', icon: Search, desc: 'Campus-wide wireless internet access' },
  { name: 'Laundry & Housekeeping', icon: Bell, desc: 'On-site laundry and cleaning services' },
  { name: 'RO Drinking Water', icon: MapPin, desc: 'Reverse osmosis purified drinking water' },
  { name: 'Hostel Libraries & TV Rooms', icon: FileText, desc: 'Study spaces and recreation areas' },
  { name: 'Medical Assistance', icon: AlertCircle, desc: 'On-call medical support for residents' },
  { name: 'Student Help-desk Support', icon: GraduationCap, desc: 'Dedicated help-desk for student queries' },
  { name: 'CCTV Surveillance', icon: Shield, desc: '24/7 CCTV monitoring across hostel premises' },
  { name: 'Biometric Attendance', icon: GraduationCap, desc: 'Biometric-based attendance system' },
] as const;

export default function HostelInfoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-3">
          <Building2 className="h-5 w-5 text-[#021861]" />
          <h1 className="text-xl font-bold tracking-tight text-[#101C3A] poppins">
            KARE University Hostels
          </h1>
        </div>
        <p className="text-xs text-[#647794]">
          Kalasalingam Academy of Research and Education &mdash; Hostel and residential life information. Hostel names and facilities are based on the university's published hostel page.
        </p>
      </div>

      {/* Hostel Names Section */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5">
        <div className="border-b border-[#DCE6F2] pb-4 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] flex items-center space-x-2 poppins">
            <Home className="h-3.5 w-3.5 text-[#021861]" />
            Published Hostel Names
          </h2>
        </div>
        <p className="text-[10px] text-[#647794] mb-4">
          The following hostel names are published by Kalasalingam Academy of Research and Education:
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {HOSTELS.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.code}
                className="rounded-lg border p-4 text-center transition-smooth hover:border-[#021861]/40 text-[#101C3A] bg-[#FFFFFF]"
              >
                <Icon className={`mx-auto h-5 w-5 mb-2 text-[#021861]`} />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-[#101C3A] block mb-1">
                  {h.code}
                </span>
                <span className="text-[10px] text-[#647794] leading-tight block">
                  {h.name}
                </span>
                <span className="text-[9px] text-[#647794] block mt-1">{h.type}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[10px] text-[#647794] italic">
          Hostel room availability, prices, and operating hours are not published here. Please contact the university hostel office for current details.
        </p>
      </div>

      {/* Facilities Section */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5">
        <div className="border-b border-[#DCE6F2] pb-4 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] flex items-center space-x-2 poppins">
            <MapPin className="h-3.5 w-3.5 text-[#021861]" />
            Hostel Facilities
          </h2>
        </div>
        <p className="text-[10px] text-[#647794] mb-4">
          Published facilities available across KARE hostels:
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {FACILITIES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.name}
                className="rounded-lg border p-4 transition-smooth hover:border-[#021861]/40 text-[#101C3A] bg-[#FFFFFF]"
              >
                <Icon className="mx-auto h-5 w-5 mb-2 text-[#021861]" />
                <span className="text-[10px] font-semibold text-[#101C3A] block mb-1">
                  {f.name}
                </span>
                <span className="text-[9px] text-[#647794] block leading-tight">
                  {f.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5">
        <div className="flex items-center space-x-2 text-xs text-[#647794]">
          <AlertCircle className="h-3.5 w-3.5 text-[#DC143C]" />
          <span>Demonstration Data Notice</span>
        </div>
        <p className="mt-1 text-[10px] text-[#647794]">
          Hostel names are published by Kalasalingam Academy of Research and Education. All other data in this portal is sample demonstration data for academic purposes and does not represent official university records, occupancy figures, or current policies.
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href="/"
          className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-4 py-2 text-xs font-medium text-[#101C3A] hover:bg-[#F5F7FF] transition-smooth"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
