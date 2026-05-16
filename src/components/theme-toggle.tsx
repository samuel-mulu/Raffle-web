'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--foreground)] backdrop-blur-xl transition-all hover:opacity-80"
    >
      {isLight ? (
        <Moon className="h-4 w-4 text-[var(--accent)]" />
      ) : (
        <Sun className="h-4 w-4 text-[var(--accent)]" />
      )}
      <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
}
