'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Info,
  LogOut,
  Shield,
  Smartphone,
  User as UserIcon,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/stores/auth-store';
import { Role, User } from '@/types/api';

type AuthPayload = {
  sub: string;
  phone: string;
  role: Role;
};

export default function ProfilePage() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { user, hasHydrated } = useAuthGuard();

  const { data: freshUser, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiClient.get<AuthPayload>('/auth/me'),
    enabled: !!user,
    retry: false,
  });

  const displayUser: User | null = freshUser
    ? { id: freshUser.sub, phone: freshUser.phone, role: freshUser.role }
    : user;

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!hasHydrated || !user || isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="bg-[#fcf8fa] min-h-screen p-4 pb-24">
      <header className="py-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Profile</h1>
      </header>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white">
            <UserIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#0f172a] truncate">
              {displayUser?.phone}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  displayUser?.role === Role.ADMIN
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {displayUser?.role} Account
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest ml-1 mb-2">
            Account Settings
          </h3>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm divide-y divide-[#f1f5f9]">
            <button className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a8a]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0f172a] text-sm">Phone Number</p>
                <p className="text-xs text-[#94a3b8]">{displayUser?.phone}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:translate-x-0.5 transition-transform" />
            </button>

            {displayUser?.role === Role.ADMIN ? (
              <button
                onClick={() => router.push('/admin/campaigns')}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#0f172a] text-sm">
                    Admin Dashboard
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    Manage campaigns and payments
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest ml-1 mb-2">
            App Info
          </h3>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f6f3f5] flex items-center justify-center text-[#1e3a8a]">
                  <Info className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-[#45464d]">Version</span>
              </div>
              <span className="text-sm font-bold text-[#0f172a]">1.0.0-alpha</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f6f3f5] flex items-center justify-center text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <span className="text-sm font-medium text-[#45464d]">
                  System Status
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">Online</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-white border border-red-100 text-red-600 font-bold rounded-2xl shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <p className="text-center text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest pt-4">
          &copy; 2026 ETHIORaffle PLC
        </p>
      </div>
    </div>
  );
}
