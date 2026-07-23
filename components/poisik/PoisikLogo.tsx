import { cn } from '@/lib/utils';

interface PoisikLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-headline-md',
  lg: 'text-display-lg',
};

export function PoisikLogo({ className, size = 'md' }: PoisikLogoProps) {
  return (
    <span
      className={cn(
        'font-sans font-bold tracking-tight lowercase text-text-primary',
        sizeClasses[size],
        className
      )}
    >
      poisik
    </span>
  );
}
