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
                  <h2 className="text-3xl lg:text-4xl font-bold poppins tracking-tight leading-tight">
                    {mode === 'login' ? 'Welcome Back!' : 'Join HostelIQ AI'}
                  </h2>
                  <p className="text-[#C7D2FE] text-sm lg:text-base leading-relaxed max-w-md">
                    {mode === 'login'
                      ? 'Sign in to access your HostelIQ AI portal — intelligent hostel and residential life management.'
                      : 'Create your verified account with your institutional @klu.ac.in email to access hostel services.'}
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
                    <h3 className="text-xs font-semibold text-[#93B8FC] uppercase tracking-wider mb-3">Institutional Policy</h3>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2 text-sm text-[#C7D2FE]">
                        <CheckCircle2 className="h-4 w-4 text-[#93B8FC] shrink-0 mt-0.5" />
                        <span>All student residents and administrators must use an <strong>@klu.ac.in</strong> email address.</span>
                      </div>
                      <div className="flex items-start space-x-2 text-sm text-[#C7D2FE]">
                        <Sparkles className="h-4 w-4 text-[#93B8FC] shrink-0 mt-0.5" />
                        <span>AI-powered policy assistant grounded in official university regulations.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1F3A8C]/40 pt-6">
                <p className="text-[10px] text-[#647794] tracking-wide uppercase">
                  Kalasalingam Academy of Research and Education &bull; Institutional Authentication
                </p>
              </div>
            </div>

            {/* Right Panel: Form Card */}
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

                {/* Mode Selector Tabs */}
                <div className="flex rounded-xl bg-[#DCE6F2]/70 p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      mode === 'login'
                        ? 'bg-white text-[#021861] shadow-sm'
                        : 'text-[#647794] hover:text-[#021861]'
                    }`}
                  >
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      mode === 'register'
                        ? 'bg-white text-[#021861] shadow-sm'
                        : 'text-[#647794] hover:text-[#021861]'
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-bold poppins tracking-tight text-[#101C3A]">
                    {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
                  </h2>
                  <p className="text-secondary text-sm">
                    {mode === 'login'
                      ? 'Sign in to access your HostelIQ AI portal.'
                      : 'Register using your @klu.ac.in institutional email address.'}
                  </p>
                </div>

                {error && (
                  <div className="flex items-start space-x-3 rounded-lg border border-[#DC143C]/30 bg-[#FDF2F2] p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC143C]" />
                    <span className="text-xs text-[#DC143C] leading-relaxed">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name (Registration only) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-semibold text-[#101C3A] mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-[#647794]" />
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className={`block w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-[#101C3A] transition-smooth focus:border-indigo focus:ring-1 focus:ring-indigo focus:outline-none ${
                            fieldErrors.fullName ? 'border-[#DC143C] focus:ring-[#DC143C]' : 'border-[#DCE6F2]'
                          }`}
                        />
                      </div>
                      {fieldErrors.fullName && <p className="mt-1 text-xs text-[#DC143C]">{fieldErrors.fullName}</p>}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-[#101C3A] mb-1.5">
                      Institutional Email Address
                      <span className="ml-1 text-xs font-normal text-indigo">(@klu.ac.in)</span>
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
                        placeholder="yourname@klu.ac.in"
                        className={`block w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-[#101C3A] transition-smooth focus:border-indigo focus:ring-1 focus:ring-indigo focus:outline-none ${
                          fieldErrors.email ? 'border-[#DC143C] focus:ring-[#DC143C]' : 'border-[#DCE6F2]'
                        }`}
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p className="mt-1 text-xs text-[#DC143C]">{fieldErrors.email}</p>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#647794]">
                        Must end with <strong>@klu.ac.in</strong> for both students and staff.
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
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
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className={`block w-full rounded-lg border py-3 pl-10 pr-4 text-sm text-[#101C3A] transition-smooth focus:border-indigo focus:ring-1 focus:ring-indigo focus:outline-none ${
                          fieldErrors.password ? 'border-[#DC143C] focus:ring-[#DC143C]' : 'border-[#DCE6F2]'
                        }`}
                      />
                    </div>
                    {fieldErrors.password && <p className="mt-1 text-xs text-[#DC143C]">{fieldErrors.password}</p>}
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-[#101C3A] mb-2">
                      {mode === 'register' ? 'I am registering as' : 'I am accessing as'}
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
                            className={`flex flex-col items-center rounded-lg border p-3.5 transition-smooth ${
                              isSelected
                                ? 'border-indigo bg-[#EAF4FF] text-[#021861] shadow-[0_0_15px_rgba(63,81,181,0.15)] ring-1 ring-indigo'
                                : 'border-[#DCE6F2] bg-[#FFFFFF] text-[#101C3A] hover:border-indigo/50 hover:bg-[#F5F7FC]'
                            }`}
                          >
                            <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-[#021861]' : 'text-[#647794]'}`} />
                            <div className="flex flex-col items-center space-y-1 w-full text-center">
                              <span className="block text-sm font-semibold leading-tight">{option.label}</span>
                              <span className="block text-[10px] text-[#647794] leading-tight">{option.desc[0]}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room & Block (Registration + Student only) */}
                  {mode === 'register' && role === 'student' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-[#101C3A] mb-1">
                          Room Number
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-[#647794]" />
                          <input
                            id="roomNumber"
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="e.g. B-304"
                            className="block w-full rounded-lg border border-[#DCE6F2] py-2.5 pl-9 pr-3 text-sm text-[#101C3A] transition-smooth focus:border-indigo focus:ring-1 focus:ring-indigo focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#101C3A] mb-1">
                          Hostel / Block
                        </label>
                        <select
                          id="blockName"
                          value={blockName}
                          onChange={(e) => setBlockName(e.target.value)}
                          className="block w-full rounded-lg border border-[#DCE6F2] py-2.5 px-3 text-sm text-[#101C3A] bg-white transition-smooth focus:border-indigo focus:ring-1 focus:ring-indigo focus:outline-none"
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
                    className={`inline-flex w-full items-center justify-center space-x-2 rounded-xl py-3.5 px-6 text-sm font-bold transition-smooth disabled:opacity-60 disabled:cursor-not-allowed ${
                      loading
                        ? 'bg-[#647794] text-white'
                        : 'bg-[#021861] text-white hover:bg-indigo focus:outline-none focus:ring-2 focus:ring-indigo focus:ring-offset-2'
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
                        <span>Register Account</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Bottom Toggle */}
                <div className="border-t border-[#DCE6F2] pt-4 text-center">
                  {mode === 'login' ? (
                    <p className="text-xs text-[#647794]">
                      Don&apos;t have an account yet?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('register')}
                        className="font-semibold text-indigo hover:text-indigo-light underline underline-offset-2 transition-colors"
                      >
                        Register here
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-[#647794]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('login')}
                        className="font-semibold text-indigo hover:text-indigo-light underline underline-offset-2 transition-colors"
                      >
                        Sign in instead
                      </button>
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-[#647794] text-center tracking-wide uppercase">
                    Institutional single sign-on &bull; Kalasalingam Academy
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
            Institutional email required (<strong>@klu.ac.in</strong>) for resident students and administrators. Minimum password 8 characters.
          </p>
        </div>
      </footer>
    </div>
  );
}
