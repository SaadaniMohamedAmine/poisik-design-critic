'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GbFlag, FrFlag } from './Flags';

interface LanguageSwitcherProps {
  className?: string;
}

const LOCALES = [
  { code: 'en', label: 'English', Flag: GbFlag },
  { code: 'fr', label: 'Français', Flag: FrFlag },
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

  const CurrentFlag = LOCALES.find((l) => l.code === locale)?.Flag ?? GbFlag;

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1 rounded-full border border-border px-sm py-xs text-label-sm text-text-secondary transition-colors hover:bg-surface-hover"
      >
        <CurrentFlag className="size-3.5 rounded-[2px]" />
        {locale.toUpperCase()}
        <ChevronDown className="size-3" strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg border border-border bg-surface py-xs shadow-2xl">
          {LOCALES.map(({ code, label, Flag }) => (
            <button
              key={code}
              onClick={() => switchTo(code)}
              className="flex w-full cursor-pointer items-center justify-between px-md py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
            >
              <span className="flex items-center gap-sm">
                <Flag className="size-4 rounded-[2px]" />
                {label}
              </span>
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
