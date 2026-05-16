'use client';

import { AppLanguage, useLanguageStore } from '@/stores/language-store';

const languages: Array<{ value: AppLanguage; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'am', label: 'አማ' },
  { value: 'ti', label: 'ትግ' },
];

export function LanguageToggle() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <div className="inline-flex rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-1 backdrop-blur-xl">
      {languages.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setLanguage(item.value)}
          className={`rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] transition-all ${
            language === item.value
              ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
              : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
