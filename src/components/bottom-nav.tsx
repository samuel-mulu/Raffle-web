'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  LogIn,
  Shield,
  Ticket,
  Trophy,
  User,
  Users,
  WalletCards,
  Sparkles,
} from 'lucide-react';
import { getLandingPath } from '@/lib/role-ui';
import { useAuthStore } from '@/stores/auth-store';
import { Role } from '@/types/api';

function isActivePath(pathname: string, href: string) {
  if (href === '/buyer/campaigns') {
    return (
      pathname === '/buyer/campaigns' ||
      pathname === '/home' ||
      pathname.startsWith('/campaigns')
    );
  }

  if (href === '/me/tickets') {
    return pathname === '/me/tickets' || pathname.startsWith('/payment');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isWorkspace = pathname.startsWith('/admin') || pathname.startsWith('/creator');

  // ... (items definitions remain the same)
  const buyerItems = [
    { href: '/buyer/campaigns', label: 'Explore', icon: Compass },
    { href: '/me/tickets', label: 'Tickets', icon: Ticket },
    { href: '/winners', label: 'Winners', icon: Trophy },
    {
      href: user ? '/profile' : '/login',
      label: user ? 'Profile' : 'Login',
      icon: user ? User : LogIn,
    },
  ];

  const creatorItems = [
    { href: '/creator/overview', label: 'Overview', icon: Sparkles },
    { href: '/creator/campaigns', label: 'Campaigns', icon: LayoutDashboard },
    { href: '/creator/sales', label: 'Sales', icon: Users },
    { href: '/creator/exports', label: 'Exports', icon: WalletCards },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { href: '/admin/overview', label: 'Dashboard', icon: Shield },
    { href: '/admin/campaigns', label: 'Campaigns', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: WalletCards },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const items =
    user?.role === Role.ADMIN
      ? adminItems
      : user?.role === Role.CREATOR
        ? creatorItems
        : buyerItems;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[60] flex justify-center pb-6 pointer-events-none`}>
      <nav 
        className={`pointer-events-auto flex items-center justify-around px-2 py-2 transition-all duration-300 ${
          isWorkspace 
            ? 'w-full max-w-[1100px] bg-white/90 border border-[#e2e8f0] shadow-xl rounded-[28px]' 
            : 'w-[90%] max-w-[400px] bg-[#1e293b]/90 border border-white/10 shadow-2xl rounded-[32px] backdrop-blur-2xl'
        }`}
      >
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex flex-1 flex-col items-center justify-center py-2 transition-all ${
                active
                  ? isWorkspace ? 'text-[#0f172a]' : 'text-[#f6d365]'
                  : isWorkspace ? 'text-[#94a3b8]' : 'text-white/40'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                  active
                    ? isWorkspace 
                      ? 'bg-[#0f172a] text-white shadow-lg shadow-black/10' 
                      : 'bg-[#f6d365] text-[#0f172a] shadow-lg shadow-[#f6d365]/20 scale-110'
                    : isWorkspace 
                      ? 'bg-[#f8fafc] group-hover:bg-[#f1f5f9]' 
                      : 'bg-white/5 group-hover:bg-white/10'
                }`}
              >
                <Icon className={active ? 'h-5 w-5' : 'h-4.5 w-4.5'} />
              </div>
              <span className={`mt-1.5 text-[9px] font-black uppercase tracking-[0.16em] transition-all duration-300 ${
                active ? 'opacity-100 scale-100' : 'opacity-0 scale-75 h-0 overflow-hidden'
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {active && !isWorkspace && (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#f6d365]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
