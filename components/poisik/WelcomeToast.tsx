'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useRouter } from '@/i18n/navigation';

// Fires the "welcome back" toast exactly once per login. Persistence of the
// notification itself happens server-side in auth.ts's `events.signIn` (so
// it lands in the bell regardless of how the user signed in) — this
// component only handles the ephemeral toast, driven by a `?welcome=1` flag
// that sign-in/sign-up append to the post-login redirect.
export function WelcomeToast() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const router = useRouter();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (searchParams.get('welcome') !== '1') return;
    firedRef.current = true;

    const name = session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0];
    toast.success(`Welcome back to Poisik${name ? `, ${name}` : ''}!`);
    router.replace('/dashboard');
  }, [searchParams, session, router]);

  return null;
}
