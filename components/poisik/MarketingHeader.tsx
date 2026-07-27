'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Menu, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { PoisikLogo } from './PoisikLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserDropdown } from './UserDropdown';
import { NotificationBell } from './NotificationBell';

export function MarketingHeader() {
  const n = useTranslations('Navigation');
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center border-b border-border bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-margin">
          <div className="flex items-center gap-xl">
            <Link href="/" className="cursor-pointer text-2xl">
              <PoisikLogo
                size="md"
                className="text-display-lg font-black capitalize text-accent-signal"
              />
            </Link>
            <nav className="hidden items-center gap-lg md:flex">
              <Link
                href="/#features"
                className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
              >
                {n('features')}
              </Link>
              <Link
                href="/#beyond-critique"
                className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
              >
                {n('beyondCritique')}
              </Link>
              <Link
                href="/pricing"
                className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
              >
                {n('pricing')}
              </Link>
              <Link
                href="/demo"
                className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
              >
                {n('demo')}
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-md md:flex">
            <LanguageSwitcher />
            {session?.user ? (
              <>
                <NotificationBell />
                <Link
                  href="/dashboard"
                  className="rounded-md bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
                >
                  Dashboard
                </Link>
                <UserDropdown name={session.user.name} image={session.user.image} />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-label-md font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  {n('signIn')}
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
                >
                  {n('signUp')}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex cursor-pointer items-center justify-center rounded-md p-sm text-text-primary md:hidden"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 z-60 bg-black/60 md:hidden"
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 right-0 z-70 h-full w-80 max-w-[85%] overflow-y-auto border-l border-border bg-bg-elevated md:hidden"
            >
              <div className="flex h-20 items-center justify-between border-b border-border px-margin">
                <span className="text-label-sm font-bold uppercase tracking-widest text-text-secondary">
                  Menu
                </span>
                <button
                  onClick={closeMobile}
                  aria-label="Close menu"
                  className="flex cursor-pointer items-center justify-center rounded-md p-sm text-text-primary"
                >
                  <X className="size-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-lg p-margin">
                <Link
                  href="/#features"
                  onClick={closeMobile}
                  className="text-headline-md font-medium text-text-primary"
                >
                  {n('features')}
                </Link>
                <Link
                  href="/pricing"
                  onClick={closeMobile}
                  className="text-headline-md font-medium text-text-primary"
                >
                  {n('pricing')}
                </Link>
                <Link
                  href="/#beyond-critique"
                  onClick={closeMobile}
                  className="text-headline-md font-medium text-text-primary"
                >
                  {n('beyondCritique')}
                </Link>
                <Link
                  href="/demo"
                  onClick={closeMobile}
                  className="text-headline-md font-medium text-text-primary"
                >
                  {n('demo')}
                </Link>

                <div className="my-md border-t border-border" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <LanguageSwitcher />
                    {session?.user && <NotificationBell />}
                  </div>
                  {session?.user && (
                    <UserDropdown name={session.user.name} image={session.user.image} />
                  )}
                </div>

                {session?.user && (
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="rounded-md bg-accent-signal px-lg py-md text-center text-label-md font-bold text-white"
                  >
                    Dashboard
                  </Link>
                )}

                {!session?.user && (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={closeMobile}
                      className="text-label-md font-medium text-text-secondary"
                    >
                      {n('signIn')}
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={closeMobile}
                      className="rounded-md bg-accent-signal px-lg py-md text-center text-label-md font-bold text-white"
                    >
                      {n('signUp')}
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
