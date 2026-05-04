'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLandingPath } from '@/lib/role-ui';
import { useAuthStore } from '@/stores/auth-store';
import { Role } from '@/types/api';

type UseAuthGuardOptions = {
  required?: boolean;
  roles?: Role[];
};

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const required = options.required ?? true;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (required && !user) {
      router.replace('/login');
      return;
    }

    if (user && options.roles && !options.roles.includes(user.role)) {
      router.replace(getLandingPath(user));
    }
  }, [hasHydrated, options.roles, pathname, required, router, user]);

  return {
    user,
    hasHydrated,
    isAuthenticated: !!user,
  };
}
