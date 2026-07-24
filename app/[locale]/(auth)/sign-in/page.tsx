'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from '@/i18n/navigation';
import { signIn } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { HelpCircle, Mail, Lock } from 'lucide-react';

const FACEBOOK_AUTH_ENABLED = process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === 'true';

export default function SignInPage() {
  const glowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Incorrect email or password.');
      return;
    }
    router.push('/dashboard');
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
    <div className="relative min-h-screen bg-bg-base text-text-primary antialiased">
      <div className="pointer-events-none fixed inset-0">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-signal/5 blur-[120px]"
          style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
        />
      </div>

      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <Link href="/" className="text-headline-md font-bold tracking-tighter text-text-primary">
          poisik
        </Link>
        <button className="p-sm text-text-secondary transition-colors hover:text-accent-signal">
          <HelpCircle className="size-5" />
        </button>
      </header>

      <main className="relative flex min-h-screen items-center justify-center px-margin pt-20">
        <div className="w-full max-w-[440px] rounded-xl border border-border bg-surface p-xl shadow-2xl transition-colors hover:border-border-strong">
          <div className="mb-xl text-center">
            <h1 className="mb-xs text-3xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-base text-text-secondary">Sign in to your AI auditing dashboard</p>
          </div>

          <form className="space-y-lg" onSubmit={handleSubmit}>
            <div className="space-y-sm">
              <label htmlFor="email" className="block text-label-md text-text-secondary">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-md top-1/2 size-5 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-lg border border-border-strong bg-surface-container-low px-md pl-12 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-accent-signal focus:outline-none focus:ring-1 focus:ring-accent-signal"
                />
              </div>
            </div>

            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-label-md text-text-secondary">
                  Password
                </label>
                <a
                  href="#"
                  className="text-label-sm text-accent-signal hover:underline transition-all"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-md top-1/2 size-5 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-lg border border-border-strong bg-surface-container-low px-md pl-12 text-base text-text-primary placeholder:text-text-muted transition-all focus:border-accent-signal focus:outline-none focus:ring-1 focus:ring-accent-signal"
                />
              </div>
            </div>

            {error && <p className="text-label-sm text-accent-signal">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-accent-signal text-label-md font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-xl">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-label-sm">
              <span className="bg-surface px-md text-text-secondary">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: `/${locale}/dashboard` })}
              className="flex items-center justify-center gap-sm h-11 rounded-lg border border-border-strong bg-transparent text-label-md text-text-secondary transition-colors hover:bg-surface-container-low"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.28-2.06 4.48-1.18 1.18-3.04 2.48-6.18 2.48-5.02 0-9.1-4.08-9.1-9.1s4.08-9.1 9.1-9.1c2.72 0 4.7 1.06 6.16 2.46l2.3-2.3c-2.12-2.02-4.88-3.56-8.46-3.56-6.62 0-12 5.38-12 12s5.38 12 12 12c3.58 0 6.28-1.18 8.4-3.4 2.18-2.18 2.88-5.22 2.88-7.66 0-.48-.04-.96-.12-1.42h-8.76z" />
              </svg>
              Google
            </button>
            {FACEBOOK_AUTH_ENABLED ? (
              <button
                type="button"
                onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
                className="flex items-center justify-center gap-sm h-11 rounded-lg border border-border-strong bg-transparent text-label-md text-text-secondary transition-colors hover:bg-surface-container-low"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex items-center justify-center gap-sm h-11 rounded-lg border border-border-strong bg-transparent text-label-md text-text-secondary transition-colors hover:bg-surface-container-low cursor-not-allowed opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook — coming soon
              </button>
            )}
          </div>

          <div className="mt-xl text-center">
            <p className="text-label-md text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/sign-up"
                className="font-bold text-accent-signal hover:underline transition-all"
              >
                Get Started
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full mt-xxl border-t border-border bg-surface-container-low py-xl px-margin">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-lg md:flex-row">
          <Link href="/" className="text-headline-md font-bold lowercase text-text-primary">
            poisik
          </Link>
          <div className="flex flex-wrap justify-center gap-lg">
            <a
              href="#"
              className="text-label-md text-text-secondary hover:text-accent-signal transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-label-md text-text-secondary hover:text-accent-signal transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-label-md text-text-secondary hover:text-accent-signal transition-colors duration-200"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-label-md text-text-secondary hover:text-accent-signal transition-colors duration-200"
            >
              Support
            </a>
          </div>
          <p className="text-label-md text-text-secondary opacity-80">
            © 2024 Poisik AI. All rights reserved.
          </p>
        </div>
      </footer>

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
    </div>
  );
}
