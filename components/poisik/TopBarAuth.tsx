import { PoisikLogo, LanguageSwitcher, UserDropdown } from '@/components/poisik';
import { Link } from '@/i18n/navigation';

interface TopBarAuthProps {
  userName?: string | null;
  userImage?: string | null;
}

export function TopBarAuth({ userName, userImage }: TopBarAuthProps) {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center border-b border-border bg-bg-base">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center">
        <div className="flex h-full w-64 shrink-0 items-center px-md">
          <Link href="/" className="cursor-pointer text-2xl">
            <PoisikLogo
              size="md"
              className="text-display-lg font-black capitalize text-accent-signal"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-md px-margin">
          <LanguageSwitcher />
          <UserDropdown name={userName} image={userImage} />
        </div>
      </div>
    </header>
  );
}
