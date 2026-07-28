'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Command as CommandIcon } from 'lucide-react';
import { PoisikLogo } from '@/components/poisik/PoisikLogo';
import { LanguageSwitcher } from '@/components/poisik/LanguageSwitcher';
import { UserDropdown } from '@/components/poisik/UserDropdown';
import { NotificationBell } from '@/components/poisik/NotificationBell';
import { SidebarNav } from '@/components/poisik/SidebarNav';
import { openCommandPalette } from '@/components/poisik/CommandPalette';
import { Link } from '@/i18n/navigation';

interface TopBarAuthProps {
  userName?: string | null;
  userImage?: string | null;
  usage: { remaining: number | null; limit: number | null; plan: string };
}

export function TopBarAuth({ userName, userImage, usage }: TopBarAuthProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* lg:ml-64 shifts this flex-1 wrapper right by the Sidebar's own
          width, exactly like main's own `flex-1 p-xl lg:ml-64` below —
          same offset before centering means the mx-auto max-w-7xl box
          here lines up with the one wrapping the dashboard's content,
          instead of centering across the full viewport (which the
          Sidebar doesn't participate in, being `fixed`). */}
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center border-b border-border bg-bg-base">
        <div className="flex-1 px-md lg:ml-64 lg:px-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="cursor-pointer">
              <PoisikLogo
                size="md"
                className="text-display-lg font-black capitalize text-accent-signal"
              />
            </Link>

            <div className="flex items-center gap-md">
              <button
                onClick={openCommandPalette}
                aria-label="Open command palette"
                title="Search (⌘K)"
                className="hidden items-center gap-xs rounded-full border-2 border-transparent p-2 text-text-secondary transition duration-150 ease-in-out hover:text-text-primary focus:text-text-primary focus:outline-none lg:flex"
              >
                <CommandIcon className="size-5" strokeWidth={1.5} />
                <span className="text-label-sm text-text-muted">⌘K</span>
              </button>
              <button
                onClick={openCommandPalette}
                aria-label="Open command palette"
                className="flex items-center justify-center rounded-full border-2 border-transparent p-2 text-text-secondary transition duration-150 ease-in-out hover:text-text-primary focus:text-text-primary focus:outline-none lg:hidden"
              >
                <CommandIcon className="size-5" strokeWidth={1.5} />
              </button>
              <NotificationBell />
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>
              <UserDropdown name={userName} image={userImage} />
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="flex cursor-pointer items-center justify-center rounded-md p-sm text-text-primary lg:hidden"
              >
                <Menu className="size-6" />
              </button>
            </div>
          </div>
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
              className="fixed inset-0 z-60 bg-black/60 lg:hidden"
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 right-0 z-70 flex h-full w-72 max-w-[85%] flex-col overflow-y-auto border-l border-border bg-surface px-md py-lg lg:hidden"
            >
              <div className="mb-lg flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <LanguageSwitcher />
                  <button
                    onClick={() => {
                      closeMobile();
                      openCommandPalette();
                    }}
                    aria-label="Open command palette"
                    className="flex items-center justify-center rounded-full border-2 border-transparent p-2 text-text-secondary transition duration-150 ease-in-out hover:text-text-primary focus:text-text-primary focus:outline-none"
                  >
                    <CommandIcon className="size-5" strokeWidth={1.5} />
                  </button>
                </div>
                <button
                  onClick={closeMobile}
                  aria-label="Close menu"
                  className="flex cursor-pointer items-center justify-center rounded-md p-sm text-text-primary"
                >
                  <X className="size-6" />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <SidebarNav usage={usage} onNavigate={closeMobile} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
