'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Mail, Lock } from 'lucide-react';

const FACEBOOK_AUTH_ENABLED = process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === 'true';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const t = useTranslations('SignIn');
  const glowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side gate — no point round-tripping to the credentials
    // provider (and logging a CredentialsSignin error server-side) for
    // input that's obviously incomplete or malformed.
    if (!email.trim() || !password) {
      setError(t('errorMissingFields'));
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(t('errorInvalidEmail'));
      return;
    }

    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setLoading(false);
      setError(t('errorInvalidCredentials'));
      return;
    }
    // Leave loading=true through the navigation — resetting it here would
    // flash the button back to its idle state for a moment before the
    // dashboard route actually finishes loading.
    router.push('/dashboard?welcome=1');
  }

  function handleGoogleSignIn() {
    setGoogleLoading(true);
    signIn('google', { callbackUrl: `/${locale}/dashboard?welcome=1` });
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      glowRef.current.style.transform = `translate(${(x - 0.5) * 50}px, ${(y - 0.5) * 50}px) translate(-50%, -50%)`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-signal/5 blur-[120px]"
          style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
        />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-margin pt-20">
        <div className="w-full max-w-[440px] rounded-xl border border-border bg-surface p-lg shadow-2xl transition-colors hover:border-border-strong md:p-xl">
          <div className="mb-xl text-center">
            <h1 className="mb-xs text-3xl font-bold text-text-primary">{t('title')}</h1>
            <p className="text-base text-text-secondary">{t('subtitle')}</p>
          </div>

          <form className="space-y-lg" onSubmit={handleSubmit}>
            <div className="space-y-sm">
              <label htmlFor="email" className="block text-label-md text-text-secondary">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-md top-1/2 size-5 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-lg border border-border-strong bg-bg-elevated px-md pl-12 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-accent-signal focus:outline-none focus:ring-1 focus:ring-accent-signal"
                />
              </div>
            </div>

            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-label-md text-text-secondary">
                  {t('password')}
                </label>
                <a
                  href="#"
                  className="text-label-sm text-accent-signal hover:underline transition-all"
                >
                  {t('forgot')}
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-md top-1/2 size-5 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-lg border border-border-strong bg-bg-elevated px-md pl-12 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-accent-signal focus:outline-none focus:ring-1 focus:ring-accent-signal"
                />
              </div>
            </div>

            {error && <p className="text-label-sm text-accent-signal">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-accent-signal text-label-md font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <div className="relative my-lg">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-label-sm">
              <span className="bg-surface px-md text-text-secondary">{t('orContinueWith')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-md sm:flex-row">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex flex-1 items-center justify-center gap-sm rounded-lg border border-border-strong bg-bg-elevated px-md py-2 text-label-sm text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-accent-signal border-t-transparent" />
                  {t('connectingToGoogle')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.21-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t('google')}
                </>
              )}
            </button>
            {FACEBOOK_AUTH_ENABLED ? (
              <button
                type="button"
                onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
                className="flex flex-1 items-center justify-center gap-sm rounded-lg border border-border-strong bg-bg-elevated px-md py-2 text-label-sm text-text-secondary transition-colors hover:bg-surface-hover"
              >
                <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {t('facebook')}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="relative flex flex-1 cursor-not-allowed items-center justify-center gap-sm rounded-lg border border-border-strong bg-bg-elevated px-md py-2 text-label-sm text-text-secondary opacity-50 transition-colors hover:bg-surface-hover"
              >
                <svg
                  className="w-4 h-4 shrink-0 text-[#1877F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>{t('facebook')}</span>
                <span className="absolute right-3 rounded-full bg-border-strong px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-text-muted uppercase">
                  {t('soon')}
                </span>
              </button>
            )}
          </div>

          <div className="mt-lg text-center">
            <p className="text-label-md text-text-secondary">
              {t('noAccount')}{' '}
              <Link
                href="/sign-up"
                className="font-bold text-accent-signal hover:underline transition-all"
              >
                {t('getStarted')}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  );
}
