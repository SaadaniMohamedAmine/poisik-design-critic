'use client';

import { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface ScorePoint {
  id: string;
  score: number;
  createdAt: string;
}

const RANGES = [
  { id: '30D' as const, days: 30 },
  { id: '90D' as const, days: 90 },
];

// Per design_v2/project_alpha_details: a big headline score + delta, a
// windowed bar chart, and 30D/90D range chips. The mockup's chips and bars
// are purely decorative (static bars, no real filtering) — here the chips
// actually filter real analyses by date and the bars plot real per-analysis
// scores, so the same visual matches without shipping a dead control.
export function ProjectScoreTrend({ analyses }: { analyses: ScorePoint[] }) {
  const [range, setRange] = useState<'30D' | '90D'>('90D');
  const [now] = useState(() => Date.now());

  const sorted = useMemo(
    () =>
      [...analyses].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [analyses]
  );

  const hasTrend = sorted.length >= 2;

  if (!hasTrend) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-sm rounded-xl border border-border bg-surface p-lg text-center">
        <span className="text-[40px] leading-none font-bold text-text-primary">
          {sorted[0]?.score ?? '—'}
          <span className="text-headline-sm font-medium text-text-muted">/100</span>
        </span>
        <p className="text-body-md text-text-secondary">Your first score is in</p>
        <p className="text-label-sm text-text-muted">
          Run one more analysis to start seeing a trend.
        </p>
      </div>
    );
  }

  const latest = sorted[sorted.length - 1]!;
  const previous = sorted[sorted.length - 2]!;
  const delta = latest.score - previous.score;

  const windowDays = RANGES.find((r) => r.id === range)!.days;
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
  const windowed = sorted.filter((a) => new Date(a.createdAt).getTime() >= cutoff);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-lg">
      <div className="mb-lg flex items-start justify-between gap-md">
        <div>
          <h3 className="text-label-sm font-bold tracking-wider text-text-secondary uppercase">
            Audit score trend
          </h3>
          <div className="mt-xs flex flex-wrap items-baseline gap-sm">
            <span className="text-[48px] leading-none font-bold text-text-primary">
              {latest.score}
            </span>
            <span
              className={`flex items-center gap-xs text-label-md font-bold ${
                delta >= 0 ? 'text-accent-signal' : 'text-text-secondary'
              }`}
            >
              {delta >= 0 ? (
                <TrendingUp className="size-3.5" strokeWidth={2} />
              ) : (
                <TrendingDown className="size-3.5" strokeWidth={2} />
              )}
              {delta > 0 ? '+' : ''}
              {delta} vs previous audit
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-xs">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`rounded px-sm py-xs text-label-sm font-bold transition-colors ${
                range === r.id
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>
      </div>

      {windowed.length > 0 ? (
        <div className="mt-md h-48 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={windowed} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="projectScoreTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-signal)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-accent-signal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={[0, 100]} hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as { createdAt?: string } | undefined;
                  return point?.createdAt
                    ? new Date(point.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '';
                }}
                formatter={(value) => [`${value}/100`, 'Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-accent-signal)"
                strokeWidth={2}
                fill="url(#projectScoreTrendFill)"
                dot={{ r: 3, fill: 'var(--color-accent-signal)', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-sm text-center">
          <BarChart3 className="size-8 text-text-muted" strokeWidth={1.5} />
          <p className="text-body-md text-text-secondary">
            No analyses in the last {windowDays} days
          </p>
        </div>
      )}
    </div>
  );
}
