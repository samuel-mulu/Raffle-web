'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function useAuthGuard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace('/login');
    }
  }, [hasHydrated, router, user]);

  return {
    user,
    hasHydrated,
    isAuthenticated: !!user,
  };
}
