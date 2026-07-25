import { MarketingHeader, MarketingFooter } from '@/components/poisik';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
