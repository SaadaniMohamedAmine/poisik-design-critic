'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-label-sm font-medium',
        className
      )}
    >
      <button
        onClick={() => switchLocale('en')}
        className={`rounded px-2 py-1 transition-colors ${
          locale === 'en'
            ? 'bg-accent-soft-bg text-accent-signal'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        disabled={isPending}
      >
        EN
      </button>
      <span className="text-text-muted">/</span>
      <button
        onClick={() => switchLocale('fr')}
        className={`rounded px-2 py-1 transition-colors ${
          locale === 'fr'
            ? 'bg-accent-soft-bg text-accent-signal'
            : 'text-text-secondary hover:text-text-primary'
        }`}
        disabled={isPending}
      >
        FR
      </button>
    </div>
  );
}
