'use client';

import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, LineChart as LineChartIcon } from 'lucide-react';

interface ScoreTrendWidgetProps {
  scores: { score: number; date: string }[];
}

export function ScoreTrendWidget({ scores }: ScoreTrendWidgetProps) {
  const hasData = scores.length > 0;
  const delta = scores.length >= 2 ? scores[scores.length - 1].score - scores[0].score : 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-lg">
      <div className="mb-lg flex items-start justify-between">
        <div>
          <h3 className="text-headline-sm font-bold text-text-primary">Score trend</h3>
          <p className="mt-xs text-label-sm text-text-secondary">
            Performance progression across all projects
          </p>
        </div>
        {hasData && scores.length >= 2 && (
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

      {hasData ? (
        <div className="h-64 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scores} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
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
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-accent-signal)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-64 flex-1 flex-col items-center justify-center gap-sm text-center">
          <LineChartIcon className="size-8 text-text-muted" strokeWidth={1.5} />
          <p className="text-body-md text-text-secondary">No scored analyses yet</p>
          <p className="text-label-sm text-text-muted">
            Run your first analysis to start tracking your score over time.
          </p>
        </div>
      )}
    </div>
  );
}
