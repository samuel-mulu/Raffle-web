'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { getLandingPath, getRequiredWorkspaceRole, isAuthScreen, isWorkspacePath } from '@/lib/role-ui';
import { useAuthStore } from '@/stores/auth-store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const authPage = isAuthScreen(pathname);
  const workspacePath = isWorkspacePath(pathname);

  useEffect(() => {
    if (!hasHydrated || !user) {
      return;
    }

    const requiredRole = getRequiredWorkspaceRole(pathname);

    if (requiredRole && user.role !== requiredRole) {
      router.replace(getLandingPath(user));
    }
  }, [hasHydrated, pathname, router, user]);

  return (
    <div className="min-h-screen bg-[#0f172a] sm:px-4 flex justify-center">
      <main
        className={`w-full min-h-screen relative overflow-x-hidden ${
          workspacePath 
            ? 'max-w-[1180px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(252,248,250,0.98)_100%)]' 
            : 'max-w-[430px] bg-[#0f172a]'
        } ${!authPage && 'shadow-2xl border-x border-white/5'}`}
      >
        {children}
        {!authPage && <BottomNav />}
      </main>
    </div>
  );
}
