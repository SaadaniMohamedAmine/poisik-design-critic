'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Mail, Lock } from 'lucide-react';

const FACEBOOK_AUTH_ENABLED = process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === 'true';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function SignUpPage() {
  const t = useTranslations('SignUp');
  const glowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side gate — matches the /api/register rules (email present,
    // password >= 8 chars) so obviously-invalid input never round-trips
    // to the server at all.
    if (!email.trim() || !password) {
      setError(t('errorMissingFields'));
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(t('errorInvalidEmail'));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('errorPasswordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }

    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? t('errorGeneric'));
      setLoading(false);
      return;
    }

    await signIn('credentials', { email, password, redirect: false });
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
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      glowRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(98, 148, 218, 0.08) 0%, transparent 70%)`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        className="fixed inset-0 rounded-full bg-accent-signal/5 blur-[120px] pointer-events-none"
        style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-margin pt-32 pb-xl">
        <div className="w-full max-w-110 z-10">
          <div className="rounded-xl border border-border bg-surface p-lg shadow-2xl md:p-xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-text-primary">{t('title')}</h1>
              <p className="mt-xs text-base text-text-secondary">{t('subtitle')}</p>
            </div>

            <form className="mt-lg flex flex-col gap-md" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-xs">
                <label htmlFor="email" className="ml-xs text-label-md text-text-secondary">
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

              <div className="flex flex-col gap-xs">
                <label htmlFor="password" className="ml-xs text-label-md text-text-secondary">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-md top-1/2 size-5 -translate-y-1/2 text-text-muted" />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-lg border border-border-strong bg-bg-elevated px-md pl-12 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-accent-signal focus:outline-none focus:ring-1 focus:ring-accent-signal"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label
                  htmlFor="confirm-password"
                  className="ml-xs text-label-md text-text-secondary"
                >
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-md top-1/2 size-5 -translate-y-1/2 text-text-muted" />
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 w-full rounded-lg border border-border-strong bg-bg-elevated px-md pl-12 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-accent-signal focus:outline-none focus:ring-1 focus:ring-accent-signal"
                  />
                </div>
              </div>

              {error && <p className="text-label-sm text-accent-signal">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-sm rounded-lg bg-accent-signal py-sm px-md text-label-md font-bold uppercase tracking-wider text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t('signingUp') : t('signUp')}
              </button>
            </form>

            <div className="relative mt-lg flex items-center">
              <div className="flex-grow border-t border-border" />
              <span className="flex-shrink mx-md text-label-sm uppercase tracking-widest text-text-secondary">
                {t('orSignUpWith')}
              </span>
              <div className="flex-grow border-t border-border" />
            </div>

            <div className="mt-lg flex flex-col gap-md sm:flex-row">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="flex flex-1 items-center justify-center gap-sm rounded-lg border border-border-strong bg-bg-elevated px-md py-2 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleLoading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-accent-signal border-t-transparent" />
                    <span className="text-label-sm text-text-secondary">
                      {t('connectingToGoogle')}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
                    <span className="text-label-sm text-text-secondary">{t('google')}</span>
                  </>
                )}
              </button>
              {FACEBOOK_AUTH_ENABLED ? (
                <button
                  type="button"
                  onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
                  className="flex flex-1 items-center justify-center gap-sm rounded-lg border border-border-strong bg-bg-elevated px-md py-2 transition-colors hover:bg-surface-hover"
                >
                  <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-label-sm text-text-secondary">{t('facebook')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="relative flex flex-1 cursor-not-allowed items-center justify-center gap-sm rounded-lg border border-border-strong bg-bg-elevated px-md py-2 opacity-50 transition-colors hover:bg-surface-hover"
                >
                  <svg
                    className="w-4 h-4 shrink-0 text-[#1877F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-label-sm text-text-secondary">{t('facebook')}</span>
                  <span className="absolute right-3 rounded-full bg-border-strong px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-text-muted uppercase">
                    {t('soon')}
                  </span>
                </button>
              )}
            </div>

            <p className="mt-sm text-center text-label-md text-text-secondary">
              {t('haveAccount')}{' '}
              <Link href="/sign-in" className="text-accent-signal hover:underline transition-all">
                {t('logIn')}
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
