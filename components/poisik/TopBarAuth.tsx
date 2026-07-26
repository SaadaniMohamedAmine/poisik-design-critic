import { PoisikLogo, LanguageSwitcher, UserDropdown, NotificationBell } from '@/components/poisik';
import { Link } from '@/i18n/navigation';

interface TopBarAuthProps {
  userName?: string | null;
  userImage?: string | null;
}

export function TopBarAuth({ userName, userImage }: TopBarAuthProps) {
  return (
    // No max-w/mx-auto here: Sidebar is `fixed left-0` at the true viewport
    // edge and the dashboard's <main> has no max-width either, so both flow
    // edge-to-edge. Centering this row inside a capped container (as it
    // used to) shifted the logo and icons inward on anything wider than
    // that cap, misaligning them against the sidebar/content edges below.
    <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center border-b border-border bg-bg-base">
      <div className="flex h-full w-64 shrink-0 items-center px-md">
        <Link href="/" className="cursor-pointer text-2xl">
          <PoisikLogo
            size="md"
            className="text-display-lg font-black capitalize text-accent-signal"
          />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-md px-margin">
        <NotificationBell />
        <LanguageSwitcher />
        <UserDropdown name={userName} image={userImage} />
      </div>
    </header>
  );
}
