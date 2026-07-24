import { PoisikLogo, LanguageSwitcher, UserDropdown } from '@/components/poisik';
import { Link } from '@/i18n/navigation';

interface TopBarAuthProps {
  userName?: string | null;
  userImage?: string | null;
}

export function TopBarAuth({ userName, userImage }: TopBarAuthProps) {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
      <Link href="/dashboard">
        <PoisikLogo size="md" />
      </Link>
      <div className="flex items-center gap-md">
        <LanguageSwitcher />
        <UserDropdown name={userName} image={userImage} />
      </div>
    </header>
  );
}
