import { cn } from '@/lib/utils';

interface CategoryScoreBarProps {
  label: string;
  value: number;
  className?: string;
}

export function CategoryScoreBar({ label, value, className }: CategoryScoreBarProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-text-secondary">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent-signal transition-all duration-1000 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
