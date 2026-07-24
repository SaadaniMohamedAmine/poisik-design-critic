'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

interface UserDropdownProps {
  name?: string | null;
  image?: string | null;
}

export function UserDropdown({ name, image }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="size-9 overflow-hidden rounded-full border border-border bg-accent-soft-bg"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar source is an arbitrary external OAuth-provider URL, not a static local asset
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-label-sm text-text-primary">
            {name?.[0]?.toUpperCase() ?? 'U'}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-border bg-surface py-xs shadow-2xl">
          <Link
            href="/settings"
            className="block px-md py-sm text-label-md text-text-primary hover:bg-surface-hover"
          >
            Account
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full px-md py-sm text-left text-label-md text-text-primary hover:bg-surface-hover"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
