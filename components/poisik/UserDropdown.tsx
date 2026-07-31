'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface UserDropdownProps {
  name?: string | null;
  image?: string | null;
}

export function UserDropdown({ name, image }: UserDropdownProps) {
  const t = useTranslations('UserDropdown');
  const [open, setOpen] = useState(false);
  // OAuth-provider avatar URLs sometimes 404/expire — without this, a
  // broken <img> (alt="") just renders as an empty circle instead of
  // falling back to the initial.
  const [imageFailed, setImageFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // The session (and its auth cookie) is still valid here, right before
  // signOut() tears it down — so this is the only reliable place to persist
  // a "goodbye" notification for next time the user logs back in. Delaying
  // signOut slightly lets the toast actually render before the page
  // navigates away.
  function handleSignOut() {
    toast.info(t('signOutToast'));
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'GOODBYE',
        title: 'Signed out',
        message: 'You signed out of Poisik. See you soon!',
      }),
    }).catch(() => {});
    setTimeout(() => signOut({ callbackUrl: '/' }), 400);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        id="tour-avatar"
        onClick={() => setOpen((o) => !o)}
        className="size-9 overflow-hidden rounded-full border border-border bg-accent-soft-bg"
      >
        {image && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar source is an arbitrary external OAuth-provider URL, not a static local asset
          <img
            src={image}
            alt=""
            className="size-full object-cover"
            onError={() => setImageFailed(true)}
          />
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
            {t('account')}
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full px-md py-sm text-left text-label-md text-text-primary hover:bg-surface-hover"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
