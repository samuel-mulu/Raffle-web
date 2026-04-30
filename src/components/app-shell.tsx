'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  return (
    <div className="min-h-screen bg-[#fcf8fa] flex justify-center">
      <main className="w-full max-w-[430px] bg-white min-h-screen relative shadow-xl overflow-x-hidden pb-20">
        {children}
        {!isAuthPage && <BottomNav />}
      </main>
    </div>
  );
}
