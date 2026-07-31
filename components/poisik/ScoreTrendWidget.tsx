'use client';

import { useTranslations } from 'next-intl';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, LineChart as LineChartIcon } from 'lucide-react';

interface ScoreTrendWidgetProps {
  scores: { score: number; date: string }[];
  subtitle?: string;
}

export function ScoreTrendWidget({ scores, subtitle }: ScoreTrendWidgetProps) {
  const t = useTranslations('ScoreTrendWidget');
  const hasData = scores.length > 0;
  // A line chart with exactly one point renders nothing (dot={false}, and a
  // line needs 2+ points) — a near-empty box that reads as broken, not as
  // "not enough data yet". Treat it as its own state instead of lumping it
  // in with the 2+ line-chart case.
  const hasTrend = scores.length >= 2;
  const delta = hasTrend ? scores[scores.length - 1].score - scores[0].score : 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-lg">
      <div className="mb-lg flex items-start justify-between">
        <div>
          <h3 className="text-headline-sm font-bold text-text-primary">{t('title')}</h3>
          <p className="mt-xs text-label-sm text-text-secondary">{subtitle ?? t('subtitle')}</p>
        </div>
        {hasTrend && (
          <div
            className={`flex shrink-0 items-center gap-xs rounded-lg px-md py-sm text-label-md font-bold ${
              delta >= 0
                ? 'bg-accent-soft-bg text-accent-signal'
                : 'bg-bg-elevated text-text-secondary'
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="size-4" strokeWidth={2} />
            ) : (
              <TrendingDown className="size-4" strokeWidth={2} />
            )}
            {delta > 0 ? '+' : ''}
            {delta}
          </div>
        )}
      </div>

      {hasTrend ? (
        <div className="h-64 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scores} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="scoreTrendFill" x1="0" y1="0" x2="0" y2="1">
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
                labelFormatter={() => ''}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-accent-signal)"
                strokeWidth={2}
                fill="url(#scoreTrendFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : hasData ? (
        <div className="flex h-64 flex-1 flex-col items-center justify-center gap-sm text-center">
          <span className="text-[40px] leading-none font-bold text-text-primary">
            {scores[0].score}
            <span className="text-headline-sm font-medium text-text-muted">/100</span>
          </span>
          <p className="text-body-md text-text-secondary">{t('firstScoreIn')}</p>
          <p className="text-label-sm text-text-muted">{t('runOneMore')}</p>
        </div>
      ) : (
        <div className="flex h-64 flex-1 flex-col items-center justify-center gap-sm text-center">
          <LineChartIcon className="size-8 text-text-muted" strokeWidth={1.5} />
          <p className="text-body-md text-text-secondary">{t('noScoredAnalyses')}</p>
          <p className="text-label-sm text-text-muted">{t('runFirstAnalysis')}</p>
        </div>
      )}
    </div>
  );
}
