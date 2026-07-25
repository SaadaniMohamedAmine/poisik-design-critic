'use client';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface ScoreTrendWidgetProps {
  scores: { score: number; date: string }[];
}

export function ScoreTrendWidget({ scores }: ScoreTrendWidgetProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-lg">
      <p className="mb-md text-label-sm text-text-secondary">Average score trend</p>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scores}>
            <YAxis domain={[0, 100]} hide />
            <Line type="monotone" dataKey="score" stroke="#6294da" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
