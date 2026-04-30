'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogIn, Ticket, Trophy, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

function isActivePath(pathname: string, href: string) {
  if (href === '/home') {
    return pathname === '/home' || pathname.startsWith('/campaigns');
  }

  if (href === '/me/tickets') {
    return pathname === '/me/tickets' || pathname.startsWith('/payment');
  }

  return pathname === href;
}

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const items = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/me/tickets', label: 'My Tickets', icon: Ticket },
    { href: '/winners', label: 'Winners', icon: Trophy },
    {
      href: user ? '/profile' : '/login',
      label: user ? 'Profile' : 'Login',
      icon: user ? User : LogIn,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t border-[#e2e8f0] flex items-center justify-around px-4 z-50 rounded-t-xl shadow-[0_-4px_6px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 group ${
              active ? 'text-[#1e3a8a]' : 'text-[#94a3b8]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
