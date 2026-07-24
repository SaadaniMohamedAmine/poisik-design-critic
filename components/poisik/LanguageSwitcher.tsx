'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
] as const;

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function switchTo(code: string) {
    router.replace(pathname, { locale: code });
    setOpen(false);
  }

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full border border-border px-sm py-xs text-label-sm text-text-secondary transition-colors hover:bg-surface-hover"
      >
        <Globe className="size-3.5" strokeWidth={1.5} />
        {locale.toUpperCase()}
        <ChevronDown className="size-3" strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg border border-border bg-surface py-xs shadow-2xl">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => switchTo(code)}
              className="flex w-full items-center justify-between px-md py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
            >
              {label}
              {locale === code && (
                <Check className="size-3.5 text-accent-signal" strokeWidth={1.5} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
