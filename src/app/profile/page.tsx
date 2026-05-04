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
  Settings,
  Bell,
  CreditCard,
  Ticket as TicketIcon,
  Star,
  Award,
  ExternalLink,
  Tv,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/stores/auth-store';
import { Role, User } from '@/types/api';

type AuthPayload = {
  sub: string;
  phone: string;
  role: Role;
  name?: string;
  avatarUrl?: string;
  bio?: string;
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
    ? { 
        id: freshUser.sub, 
        phone: freshUser.phone, 
        role: freshUser.role,
        name: freshUser.name,
        avatarUrl: freshUser.avatarUrl,
        bio: freshUser.bio,
        roleLabel: freshUser.role === Role.ADMIN ? 'Admin' : freshUser.role === Role.CREATOR ? 'Creator' : 'Member',
        landingPath: freshUser.role === Role.ADMIN ? '/admin/campaigns' : freshUser.role === Role.CREATOR ? '/creator' : '/buyer/campaigns'
      }
    : user;

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="h-48 bg-gray-100 animate-pulse" />
        <div className="px-6 -mt-12 space-y-6">
          <div className="w-24 h-24 rounded-[32px] bg-gray-200 animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-40 w-full bg-gray-50 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Dynamic Profile Header */}
      <div className="h-48 bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-400 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-4 right-6 flex gap-2">
          <button 
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-[#1e3a8a] to-purple-500 p-[3px] shadow-2xl">
            <div className="w-full h-full rounded-[34px] bg-white p-[3px]">
              <div className="w-full h-full rounded-[32px] bg-gray-100 overflow-hidden flex items-center justify-center">
                {displayUser?.avatarUrl ? (
                  <img src={displayUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-300" />
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            <button className="px-5 py-2.5 bg-black text-white text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0f172a]">
              {displayUser?.name || 'New Participant'}
            </h1>
            {displayUser?.role === Role.ADMIN && (
              <div className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest border border-purple-200">
                Admin
              </div>
            )}
          </div>
          <p className="text-sm font-bold text-[#94a3b8] flex items-center gap-1">
            {displayUser?.phone} • Joined May 2026
          </p>
          <p className="text-sm font-medium text-[#45464d] mt-3 leading-relaxed max-w-xs">
            {displayUser?.bio || 'Passionate about digital raffles and winning big with ETHIORaffle! 🍀'}
          </p>
        </div>

        {/* User Stats Bar */}
        <div className="flex gap-3 mt-8">
          {[
            { label: 'Raffles', value: '12', icon: <TicketIcon className="w-3.5 h-3.5" /> },
            { label: 'Wins', value: '2', icon: <Award className="w-3.5 h-3.5" /> },
            { label: 'Score', value: '940', icon: <Star className="w-3.5 h-3.5" /> },
          ].map((stat, i) => (
            <div key={i} className="flex-1 bg-[#fcf8fa] rounded-2xl p-4 border border-gray-100 flex flex-col items-center justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">
                {stat.icon} {stat.label}
              </div>
              <p className="text-xl font-black text-[#0f172a]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Unified Smart Dashboard Button */}
        <div className="mt-8">
          <button
            onClick={() => {
              if (displayUser?.role === Role.ADMIN) router.push('/admin/campaigns');
              else if (displayUser?.role === Role.CREATOR) router.push('/creator');
              else router.push('/me/tickets');
            }}
            className="w-full p-6 bg-black rounded-[32px] shadow-2xl shadow-gray-200 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                {displayUser?.role === Role.ADMIN ? (
                  <Shield className="w-6 h-6" />
                ) : displayUser?.role === Role.CREATOR ? (
                  <Tv className="w-6 h-6" />
                ) : (
                  <TicketIcon className="w-6 h-6" />
                )}
              </div>
              <div className="text-left">
                <p className="text-white font-black text-lg leading-none mb-1">
                  {displayUser?.role === Role.ADMIN 
                    ? 'Admin Control' 
                    : displayUser?.role === Role.CREATOR 
                      ? 'Creator Studio' 
                      : 'My Tickets'}
                </p>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                  {displayUser?.role === Role.ADMIN 
                    ? 'Platform Management' 
                    : displayUser?.role === Role.CREATOR 
                      ? 'Manage your drops' 
                      : 'View your entries'}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Dashboard Sections */}
        <div className="mt-10 space-y-8">
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-[#94a3b8] uppercase tracking-[0.2em] ml-1">
              Account Settings
            </h3>
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-[#0f172a] text-base leading-none mb-1">Wallet & History</p>
                    <p className="text-xs font-bold text-[#94a3b8]">Manage payments and transactions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-[#94a3b8] uppercase tracking-[0.2em] ml-1">
              Preferences
            </h3>
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-[#0f172a] text-base leading-none mb-1">Notifications</p>
                    <p className="text-xs font-bold text-[#94a3b8]">Draw results and promotion alerts</p>
                  </div>
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </button>
              
              <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-[#0f172a] text-base leading-none mb-1">Help Center</p>
                    <p className="text-xs font-bold text-[#94a3b8]">FAQ and platform support</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </section>

          <button
            onClick={handleLogout}
            className="w-full py-5 bg-[#fcf8fa] text-red-600 text-base font-black rounded-3xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-red-50"
          >
            <LogOut className="w-6 h-6" />
            Sign Out
          </button>

          <div className="text-center space-y-2 pt-4">
            <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-[0.3em]">
              ETHIORaffle • Version 1.0.0-PRO
            </p>
            <div className="flex justify-center gap-4">
              <span className="text-[10px] font-bold text-gray-300">Privacy</span>
              <span className="text-[10px] font-bold text-gray-300">Terms</span>
              <span className="text-[10px] font-bold text-gray-300">Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

