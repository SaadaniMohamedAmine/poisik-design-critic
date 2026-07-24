export interface Benchmark {
  name: string;
  score: number;
}

export const BENCHMARKS: Benchmark[] = [
  { name: 'Stripe Checkout', score: 96 },
  { name: 'Linear Dashboard', score: 92 },
  { name: 'Vercel Dashboard', score: 90 },
  { name: 'Notion', score: 85 },
  { name: 'Linear App', score: 88 },
  { name: 'GitHub Mobile', score: 78 },
];

export function getClosestBenchmark(
  score: number
): { benchmark: Benchmark; diff: number; isAbove: boolean } | null {
  if (BENCHMARKS.length === 0) return null;

  let closest = BENCHMARKS[0];
  let minDiff = Math.abs(score - closest.score);

  for (const b of BENCHMARKS) {
    const diff = Math.abs(score - b.score);
    if (diff < minDiff) {
      minDiff = diff;
      closest = b;
    }
  }

  return {
    benchmark: closest,
    diff: minDiff,
    isAbove: score > closest.score,
  };
}
