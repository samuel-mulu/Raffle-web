'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { AuthResponse } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('123456');
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasHydrated && user) {
      router.replace('/home');
    }
  }, [hasHydrated, router, user]);

  const loginMutation = useMutation({
    mutationFn: (data: { phone: string; code: string }) =>
      apiClient.post<AuthResponse>('/auth/login', data),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.refreshToken, data.user);
      router.push('/home');
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Login failed'));
    },
  });

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    loginMutation.mutate({ phone, code });
  };

  if (!hasHydrated) {
    return <div className="p-10 text-center animate-pulse">Loading...</div>;
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-6">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#94a3b8]">
            ETHIORaffle
          </p>
          <h1 className="text-3xl font-bold text-[#0f172a]">Welcome back</h1>
          <p className="text-[#45464d]">Enter your phone to continue</p>
          <div className="inline-flex rounded-full bg-[#f6f3f5] px-4 py-2 text-xs font-bold text-[#1e3a8a]">
            Demo OTP: 123456
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-[#45464d]"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+251911000003"
                className="mt-1 block w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-[#45464d]"
              >
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-xl bg-black px-4 py-3 font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
