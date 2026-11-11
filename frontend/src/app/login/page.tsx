'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Lock,
  User as UserIcon,
  GraduationCap,
  Shield,
  ArrowRight,
  UserPlus,
  AlertCircle,
  Loader2,
  Sparkles,
  Home,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RoleOption {
  value: 'student' | 'admin';
  label: string;
  icon: React.ElementType;
  desc: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'student',
    label: 'Resident Student',
    icon: GraduationCap,
    desc: 'Mess menus, AI assistant, maintenance desk',
  },
  {
    value: 'admin',
    label: 'Hostel Admin',
    icon: Shield,
    desc: 'Governance, triage queue, mess editor',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, isLoadingAuth, currentUser, currentRole } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [blockName, setBlockName] = useState('Block B (Aryabhatta Hall)');
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

    if (mode === 'register') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required.';
      } else if (fullName.trim().length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters.';
      }
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (!trimmedEmail.toLowerCase().endsWith('@klu.ac.in')) {
      newErrors.email = 'Institutional email required. Both residents and admins must use an @klu.ac.in email.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      let user;
      if (mode === 'register') {
        user = await register({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
          role,
          room_number: role === 'student' ? (roomNumber.trim() || undefined) : undefined,
          block_name: role === 'student' ? (blockName.trim() || undefined) : 'Administrative Block',
        });
      } else {
        user = await login(email.trim().toLowerCase(), password, role);
      }

      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/hostel-selection');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `${mode === 'register' ? 'Registration' : 'Authentication'} failed. Please try again.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] selection:bg-indigo-500 selection:text-white">
      <main className="flex-1 relative flex">
        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full">
          {/* Left Panel: Deep Obsidian Branding (5 cols) */}
          <div className="lg:col-span-5 bg-[#070B19] text-white p-8 lg:p-14 flex flex-col justify-between border-r border-white/10 relative overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10 space-y-10">
              {/* Brand Header */}
              <div className="flex items-center space-x-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-glow">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight text-white poppins flex items-center gap-2">
                    <span>HostelIQ AI</span>
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.2 text-[9px] font-semibold text-indigo-300">
                      2.0
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Kalasalingam University
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span>Verified Institutional Access</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold poppins tracking-tight leading-tight text-white">
                  {mode === 'login' ? 'Welcome Back.' : 'Create Account.'}
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
                  {mode === 'login'
                    ? 'Sign in to access your mess schedules, AI policy intelligence, and maintenance grievances.'
                    : 'Register with your verified @klu.ac.in institutional email to access student or administrator services.'}
                </p>
              </div>

              {/* Feature Points */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <div className="h-5 w-5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-medium">Strict Domain Security</strong>
                    Both residents and administrators must authenticate with official @klu.ac.in credentials.
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <div className="h-5 w-5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-medium">Grounding Integrity</strong>
                    Policy questions answered strictly from verified handbook chunks with zero hallucinations.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="relative z-10 pt-8 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>KARE Institutional Gateway</span>
              <span>Academic Year 2026</span>
            </div>
          </div>

          {/* Right Panel: Clean Luminous Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 bg-[#F8FAFC]">
            <div className="w-full max-w-md space-y-6 animate-fade-in">
              {/* Tab Switcher */}
              <div className="flex rounded-2xl bg-slate-200/70 p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Form Heading */}
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 poppins">
                  {mode === 'login' ? 'Sign In to Portal' : 'Register New Account'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your university credentials to continue.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start space-x-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Registration only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-slate-400" />
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rohan Sharma"
                        className={`block w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 shadow-subtle transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 focus:outline-none ${
                          fieldErrors.fullName ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {fieldErrors.fullName && <p className="mt-1 text-xs text-rose-500">{fieldErrors.fullName}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Institutional Email Address
                    </label>
                    <span className="text-[11px] font-semibold text-indigo-600">@klu.ac.in</span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@klu.ac.in"
                      className={`block w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 shadow-subtle transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 focus:outline-none ${
                        fieldErrors.email ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {fieldErrors.email ? (
                    <p className="mt-1 text-xs text-rose-500">{fieldErrors.email}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Must end with <strong className="text-slate-700">@klu.ac.in</strong> for residents and administrators.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`block w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 shadow-subtle transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 focus:outline-none ${
                        fieldErrors.password ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {fieldErrors.password && <p className="mt-1 text-xs text-rose-500">{fieldErrors.password}</p>}
                </div>

                {/* Role Cards */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    {mode === 'register' ? 'Registering As' : 'Access Role'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = role === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRole(opt.value)}
                          className={`btn-press flex flex-col items-center rounded-2xl border p-3.5 text-center transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Student specific fields */}
                {mode === 'register' && role === 'student' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Room Number
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -mt-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          id="roomNumber"
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="e.g. B-304"
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 shadow-subtle focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Hostel / Block
                      </label>
                      <select
                        id="blockName"
                        value={blockName}
                        onChange={(e) => setBlockName(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 shadow-subtle focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="Block B (Aryabhatta Hall)">Block B (Aryabhatta Hall)</option>
                        <option value="Block G (Gargi Hall)">Block G (Gargi Hall)</option>
                        <option value="Block C (Ramanujan Hall)">Block C (Ramanujan Hall)</option>
                        <option value="Block D (Tagore Hall)">Block D (Tagore Hall)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-press w-full py-3.5 px-6 rounded-2xl text-xs font-semibold text-white shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    loading
                      ? 'bg-slate-700'
                      : 'bg-slate-900 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{mode === 'register' ? 'Creating account…' : 'Signing in…'}</span>
                    </>
                  ) : mode === 'register' ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Create Account</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Mode Switch Link */}
              <div className="pt-2 text-center text-xs text-slate-500">
                {mode === 'login' ? (
                  <span>
                    Need a new account?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('register')}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Register here
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('login')}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Sign in instead
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
