import { Zap } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface PlanUsageWidgetProps {
  plan: string;
  remaining: number | null;
  limit: number | null;
}

export function PlanUsageWidget({ plan, remaining, limit }: PlanUsageWidgetProps) {
  const isUnlimited = limit === null;
  const used = isUnlimited ? 0 : limit - (remaining ?? 0);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-lg">
      <div className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-accent-signal/5 blur-[60px]" />

      <div className="relative z-10">
        <div className="mb-lg flex items-center justify-between">
          <span className="rounded-full border border-border-strong px-md py-1 text-label-sm font-bold tracking-widest text-text-primary uppercase">
            {plan}
          </span>
          <Zap className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <h3 className="mb-xs text-headline-sm font-bold text-text-primary">
          {isUnlimited ? 'Unlimited analyses' : 'Monthly quota'}
        </h3>
        <p className="text-label-md text-text-secondary">
          {isUnlimited
            ? "You're on a plan with no monthly analysis cap."
            : `You've used ${used} of ${limit} analyses this month.`}
        </p>
      </div>

      <div className="relative z-10 mt-xl">
        {!isUnlimited && (
          <>
            <div className="mb-xs flex justify-between text-label-sm text-text-secondary">
              <span>Analysis credits</span>
              <span className="text-text-primary">
                {used} / {limit} used
              </span>
            </div>
            <div className="mb-lg h-2 w-full overflow-hidden rounded-full border border-border bg-bg-elevated">
              <div className="h-full bg-accent-signal transition-all" style={{ width: `${pct}%` }} />
            </div>
          </>
        )}
        {plan !== 'ENTERPRISE' && (
          <Link
            href="/pricing"
            className="flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal py-md text-label-md font-bold text-white transition-opacity hover:opacity-90"
          >
            <Zap className="size-4" strokeWidth={2} />
            {plan === 'FREE' ? 'Upgrade to Pro' : 'Upgrade plan'}
          </Link>
        )}
      </div>
    </div>
  );
}
