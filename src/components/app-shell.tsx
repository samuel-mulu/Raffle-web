'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { getLandingPath, getRequiredWorkspaceRole, isAuthScreen, isWorkspacePath } from '@/lib/role-ui';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { ThemeToggle } from './theme-toggle';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const theme = useThemeStore((state) => state.theme);
  const authPage = isAuthScreen(pathname);
  const workspacePath = isWorkspacePath(pathname);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
    <div className="min-h-screen bg-[var(--shell-background)] sm:px-4 flex justify-center transition-colors">
      <main
        className={`w-full min-h-screen relative overflow-x-hidden ${
          workspacePath 
            ? 'max-w-[1180px] app-page' 
            : 'max-w-[430px] app-page'
        } ${!authPage && 'shadow-2xl border-x border-[var(--card-border)]'}`}
      >
        {!authPage ? (
          <div className="fixed right-4 top-4 z-[70]">
            <ThemeToggle />
          </div>
        ) : null}
        {children}
        {!authPage && <BottomNav />}
      </main>
    </div>
  );
}
