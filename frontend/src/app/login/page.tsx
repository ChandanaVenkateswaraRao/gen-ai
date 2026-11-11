'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  GraduationCap,
  Shield,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RoleOption {
  value: 'student' | 'admin';
  label: string;
  icon: React.ElementType;
  desc: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'student',
    label: 'Student / Resident',
    icon: GraduationCap,
    desc: [
      'Access mess menus and dining schedule',
      'View hostel announcements and circulars',
      'Submit and track maintenance complaints',
      'Access AI hostel assistant',
    ],
  },
  {
    value: 'admin',
    label: 'Administrator',
    icon: Shield,
    desc: [
      'Manage hostel operations and staff',
      'Upload and manage policy documents',
      'Publish official notices and circulars',
      'Resolve complaints and triage work orders',
      'Manage mess schedules and audit logs',
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoadingAuth, currentUser, currentRole } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoadingAuth && isAuthenticated && currentUser) {
      if (currentRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/hostel-selection');
      }
    }
  }, [isAuthenticated, currentUser, currentRole, isLoadingAuth, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      const user = await login(email.trim(), password, role);

      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/hostel-selection');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#EAF4FF]">
      <main className="flex-1 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo/20 blur-[120px] -top-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#021861]/10 blur-[120px] -bottom-[100px]" />

        {/* Two-column grid layout */}
        <div
          className={`relative z-10 min-h-screen w-full ${mounted ? 'animate-fade-in' : 'opacity-0'} transition-opacity duration-500`}
          style={{ animationDelay: '100ms' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left Panel: Midnight Navy Branding */}
            <div
              className="flex flex-col lg:flex-col bg-[#021861] text-white p-6 lg:p-12 justify-between border-r border-[#1F3A8C]/40 min-w-0"
            >
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo flex items-center justify-center shadow-glow">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-[#93B8FC] uppercase">HostelIQ AI</div>
                    <div className="text-xl font-bold poppins tracking-tight">HostelIQ AI</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold poppins tracking-tight leading-tight">Welcome Back!</h2>
                  <p className="text-[#C7D2FE] text-sm lg:text-base leading-relaxed max-w-md">
                    Sign in to access your HostelIQ AI portal &mdash; intelligent hostel and residential life management.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-[#93B8FC] uppercase tracking-wider mb-3">University Hostels</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 text-sm text-[#C7D2FE]">
                        <Building2 className="h-4 w-4 text-[#93B8FC] shrink-0" />
                        <div>
                          <span className="font-medium text-white">Kalasalingam Academy</span>
                          <span className="text-[10px] text-[#647794] block">of Research and Education</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-[#C7D2FE]">
                        <Building2 className="h-4 w-4 text-[#93B8FC] shrink-0" />
                        <span>7 residential hostels across campus</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1F3A8C]/40">
                    <h3 className="text-xs font-semibold text-[#93B8FC] uppercase tracking-wider mb-3">Platform Features</h3>
                    <div className="space-y-2">
                      {[
                        'AI-powered policy assistant grounded in approved documents',
                        'Smart 7-day mess menu and dining schedule',
                        'Verified complaint tracking with audit IDs',
                        'Official announcements and circulars board',
                      ].map((f, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm text-[#C7D2FE]">
                          <Sparkles className="h-3.5 w-3.5 text-[#93B8FC] shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1F3A8C]/40 pt-6">
                <p className="text-[10px] text-[#647794] tracking-wide uppercase">
                  Kalasalingam Academy of Research and Education
                </p>
              </div>
            </div>

            {/* Right Panel: Baby Blue Background with White Login Card */}
            <div
              className="flex flex-col items-center justify-center bg-[#EAF4FF] p-6 md:p-10 lg:static lg:h-full lg:p-16 lg:border-l border-[#DCE6F2] min-w-0 relative"
            >
              <div className="w-full max-w-md space-y-6">
                {/* Mobile header branding */}
                <div className="lg:hidden flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo flex items-center justify-center shadow-glow">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-indigo-light uppercase">HostelIQ AI</div>
                    <div className="text-base font-bold poppins tracking-tight">HostelIQ AI</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl lg:text-3xl font-bold poppins tracking-tight text-[#101C3A]">Welcome Back!</h2>
                  <p className="text-secondary text-sm lg:text-base">Sign in to access your HostelIQ AI portal.</p>
                </div>

                {error && (
                  <div className="flex items-start space-x-3 rounded-lg border border-[#DC143C]/30 bg-[#FDF2F2] p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC143C]" />
                    <span className="text-xs text-[#DC143C] leading-relaxed">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#101C3A] mb-2.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-[#647794]" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@university.edu"
                        className={`block w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-[#101C3A] transition-smooth focus:border-indigo focus:ring-1 focus:ring-indigo focus:outline-none ${
                          fieldErrors.email ? 'border-[#DC143C] focus:ring-[#DC143C]' : 'border-[#DCE6F2]'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1 text-xs text-[#DC143C]">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-sm font-semibold text-[#101C3A]">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-indigo hover:text-indigo-light transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-[#647794]" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`block w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-[#101C3A] transition-smooth focus:border-indigo focus:ring-1 focus:ring-indigo focus:outline-none ${
                          fieldErrors.password ? 'border-[#DC143C] focus:ring-[#DC143C]' : 'border-[#DCE6F2]'
                        }`}
                      />
                    </div>
                    {fieldErrors.password && <p className="mt-1 text-xs text-[#DC143C]">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#101C3A] mb-3">
                      I am accessing as
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ROLE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = role === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setRole(option.value)}
                            className={`flex flex-col items-center rounded-lg border p-4 min-h-[140px] transition-smooth ${
                              isSelected
                                ? 'border-indigo bg-[#EAF4FF] text-[#021861] shadow-[0_0_15px_rgba(63,81,181,0.15)]'
                                : 'border-[#DCE6F2] bg-[#FFFFFF] text-[#101C3A] hover:border-indigo/50 hover:bg-[#F5F7FC]'
                            }`}
                          >
                            <Icon className={`h-5 w-5 mb-3 ${isSelected ? 'text-[#021861]' : 'text-[#647794]'}`} />
                            <div className="flex flex-col items-center space-y-2 w-full text-center">
                              <span className="block text-sm font-semibold leading-tight">{option.label}</span>
                              <span className="block text-[10px] text-[#647794] leading-tight">{option.desc[0]}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex w-full items-center justify-center space-x-2 rounded-xl py-4 px-6 text-sm font-bold transition-smooth disabled:opacity-60 disabled:cursor-not-allowed ${
                      loading
                        ? 'bg-[#647794] text-white'
                        : 'bg-[#021861] text-white hover:bg-indigo focus:outline-none focus:ring-2 focus:ring-indigo focus:ring-offset-2'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Signing in\u2026</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="border-t border-[#DCE6F2] pt-6">
                  <p className="text-[10px] text-[#647794] text-center tracking-wide uppercase">
                    Demo session &mdash; clears on tab close
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#DCE6F2] bg-white py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs text-[#647794]">
            HostelIQ AI &mdash; Academic Demonstration Portal for Kalasalingam Academy of Research and Education
          </p>
          <p className="text-xs text-[#647794] mt-1">
            Accepts any valid email and password (8+ characters). Not for production use.
          </p>
        </div>
      </footer>
    </div>
  );
}
