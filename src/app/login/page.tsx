'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors';
import { useAuthStore } from '@/stores/auth-store';
import { AuthResponse, RegisterResponse } from '@/types/api';

type AuthMode = 'login' | 'register';

const DEMO_ACCOUNTS = [
  { label: 'Buyer demo', phone: '+251911000003', role: 'Buyer' },
  { label: 'Creator demo', phone: '+251922000001', role: 'Creator' },
  { label: 'Admin demo', phone: '+251911000001', role: 'Admin' },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [mode, setMode] = useState<AuthMode>('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('123456');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasHydrated && user?.landingPath) {
      router.replace(user.landingPath);
    }
  }, [hasHydrated, router, user]);

  const loginMutation = useMutation({
    mutationFn: (data: { phone: string; code: string }) =>
      apiClient.post<AuthResponse>('/auth/login', data),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.refreshToken, data.user);
      if (data.user?.landingPath) {
        router.replace(data.user.landingPath);
      }
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Login failed'));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { phone: string; name?: string }) =>
      apiClient.post<RegisterResponse>('/auth/register', data),
    onSuccess: (data) => {
      setStatusMessage(data.message);
      setError('');
      setMode('login');
      setCode('123456');
      if (!name && data.user.name) {
        setName(data.user.name);
      }
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Registration failed'));
    },
  });

  const isBusy = loginMutation.isPending || registerMutation.isPending;
  const cardTitle = useMemo(
    () =>
      mode === 'login'
        ? 'Role-aware login'
        : 'Register as a buyer',
    [mode],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatusMessage('');

    if (mode === 'login') {
      loginMutation.mutate({ phone, code });
      return;
    }

    registerMutation.mutate({ phone, name: name || undefined });
  };

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f6d365] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden selection:bg-[#f6d365]/30">
      {/* Background blobs for premium feel */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-6 py-12 flex flex-col min-h-screen">
        {/* Header section */}
        <header className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-[#f6d365] to-[#fda085] rounded-2xl shadow-lg shadow-orange-500/20 mb-2">
            <Ticket className="h-7 w-7 text-[#0f172a]" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              ETHIO<span className="text-[#f6d365]">Raffle</span>
            </h1>
            <p className="text-white/60 text-sm font-medium">
              Premium Telegram Mini App Experience
            </p>
          </div>
        </header>

        {/* Main Content Card */}
        <main className="flex-1 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-1 shadow-2xl overflow-hidden">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1.5">
              {(['login', 'register'] as AuthMode[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    setError('');
                    setStatusMessage('');
                  }}
                  className={`relative z-10 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-[22px] ${
                    mode === value
                      ? 'bg-white text-[#0f172a] shadow-lg shadow-white/5'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {value === 'login' ? 'Sign In' : 'Join Now'}
                </button>
              ))}
            </div>

            {/* Form Section */}
            <div className="p-6 pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d365] ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Abel Bekele"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#f6d365]/50 focus:ring-4 focus:ring-[#f6d365]/10 transition-all text-sm"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d365] ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#f6d365]/50 focus:ring-4 focus:ring-[#f6d365]/10 transition-all text-sm"
                  />
                </div>

                {mode === 'login' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d365]">
                        Security Code
                      </label>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
                        Demo: 123456
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#f6d365]/50 focus:ring-4 focus:ring-[#f6d365]/10 transition-all text-sm tracking-[0.5em] text-center font-black"
                    />
                  </div>
                )}

                {statusMessage && (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 text-emerald-400 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <p className="font-medium">{statusMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3 text-rose-400 text-xs text-center justify-center">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
                >
                  {isBusy ? (
                    <div className="h-5 w-5 border-2 border-[#0f172a]/30 border-t-[#0f172a] rounded-full animate-spin" />
                  ) : (
                    mode === 'login' ? 'Access Dashboard' : 'Create My Account'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Access / Demo Accounts */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 text-center">
              Quick Test Accounts
            </h3>
            <div className="grid gap-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.phone}
                  type="button"
                  onClick={() => {
                    setPhone(account.phone);
                    setMode('login');
                    setStatusMessage('');
                    setError('');
                  }}
                  className="group flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-4 hover:bg-white/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#f6d365]/20 transition-all">
                      {account.role === 'Admin' ? <ShieldCheck className="h-4 w-4 text-[#f6d365]" /> : 
                       account.role === 'Creator' ? <Sparkles className="h-4 w-4 text-[#f6d365]" /> :
                       <Ticket className="h-4 w-4 text-[#f6d365]" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-white">
                        {account.label}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">{account.phone}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 group-hover:border-[#f6d365]/20 transition-all">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-tighter">
                      {account.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
            &copy; 2026 ETHIORaffle &bull; v1.0.0
          </p>
        </footer>
      </div>
    </div>
  );
}
