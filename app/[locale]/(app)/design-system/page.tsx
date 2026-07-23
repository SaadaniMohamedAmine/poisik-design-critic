import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PoisikLogo, CircularGauge, CategoryScoreBar } from '@/components/poisik';

const colorTokens = [
  { name: 'bg-base', var: '--color-bg-base', hex: '#0a0f16' },
  { name: 'bg-elevated', var: '--color-bg-elevated', hex: '#0d131c' },
  { name: 'surface', var: '--color-surface', hex: '#121a27' },
  { name: 'surface-hover', var: '--color-surface-hover', hex: '#162131' },
  { name: 'border', var: '--color-border', hex: '#1d2b3f' },
  { name: 'border-strong', var: '--color-border-strong', hex: '#263954' },
  { name: 'text-muted', var: '--color-text-muted', hex: '#4b6c9b' },
  { name: 'text-secondary', var: '--color-text-secondary', hex: '#87a1c5' },
  { name: 'text-primary', var: '--color-text-primary', hex: '#e3e9f2' },
  { name: 'accent-signal', var: '--color-accent-signal', hex: '#6294da' },
  { name: 'accent-signal-hover', var: '--color-accent-signal-hover', hex: '#78a4e3' },
  { name: 'accent-glow', var: '--color-accent-glow', hex: '#5f9cf2' },
  { name: 'accent-soft-bg', var: '--color-accent-soft-bg', hex: '#182639' },
];

const typographyTokens = [
  { name: 'display-lg', size: '48px', weight: 600, lh: 1.1, ls: '-0.04em' },
  { name: 'headline-lg', size: '32px', weight: 600, lh: 1.2, ls: '-0.03em' },
  { name: 'headline-md', size: '24px', weight: 500, lh: 1.3, ls: '-0.02em' },
  { name: 'body-lg', size: '18px', weight: 400, lh: 1.6, ls: '0em' },
  { name: 'body-md', size: '16px', weight: 400, lh: 1.6, ls: '0em' },
  { name: 'label-md', size: '14px', weight: 500, lh: 1.4, ls: '0.01em' },
  { name: 'label-sm', size: '12px', weight: 600, lh: 1.2, ls: '0.05em' },
];

const spacingTokens = [
  { name: 'xs', value: '4px' },
  { name: 'sm', value: '8px' },
  { name: 'md', value: '16px' },
  { name: 'lg', value: '24px' },
  { name: 'xl', value: '48px' },
  { name: 'xxl', value: '80px' },
  { name: 'margin', value: '32px' },
  { name: 'gutter', value: '24px' },
];

export default function DesignSystemPreview() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <div className="mx-auto max-w-5xl px-margin py-xxl">
        <header className="mb-xxl">
          <PoisikLogo size="lg" />
          <p className="mt-md text-body-md text-text-secondary">
            Design system reference — every token, component, and variant.
          </p>
        </header>

        {/* Colors */}
        <section className="mb-xxl">
          <h2 className="mb-xl text-headline-lg font-semibold">Colors</h2>
          <div className="grid grid-cols-2 gap-md sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {colorTokens.map((token) => (
              <div key={token.name} className="space-y-2">
                <div
                  className="h-20 rounded-xl border border-border"
                  style={{ backgroundColor: token.hex }}
                />
                <div>
                  <p className="text-label-sm font-semibold text-text-primary">{token.name}</p>
                  <p className="text-label-sm text-text-muted">{token.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-xxl">
          <h2 className="mb-xl text-headline-lg font-semibold">Typography</h2>
          <div className="space-y-lg">
            {typographyTokens.map((t) => (
              <div key={t.name} className="border-b border-border pb-md">
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: t.size,
                    fontWeight: t.weight,
                    lineHeight: t.lh,
                    letterSpacing: t.ls,
                  }}
                  className="text-text-primary"
                >
                  {t.name} — The quick brown fox jumps over the lazy dog.
                </p>
                <p className="mt-1 text-label-sm text-text-muted">
                  {t.size} / Weight {t.weight} / Line Height {t.lh} / Letter Spacing {t.ls}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-xxl">
          <h2 className="mb-xl text-headline-lg font-semibold">Spacing</h2>
          <div className="space-y-md">
            {spacingTokens.map((s) => (
              <div key={s.name} className="flex items-center gap-md">
                <span className="w-16 text-label-sm font-semibold text-text-primary">{s.name}</span>
                <div className="h-6 rounded bg-accent-signal/30" style={{ width: s.value }} />
                <span className="text-label-sm text-text-muted">{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Shadcn Components */}
        <section className="mb-xxl">
          <h2 className="mb-xl text-headline-lg font-semibold">shadcn/ui Components</h2>

          {/* Buttons */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>Button</CardTitle>
              <CardDescription>All variants and sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-lg">
              <div className="flex flex-wrap gap-md">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap items-center gap-md">
                <Button size="xs">XS</Button>
                <Button size="sm">SM</Button>
                <Button size="default">Default</Button>
                <Button size="lg">LG</Button>
                <Button size="icon">IC</Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>Badge</CardTitle>
              <CardDescription>Variants</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-md">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge variant="link">Link</Badge>
            </CardContent>
          </Card>

          {/* Card */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>Default card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-md text-text-secondary">
                Card content goes here. This is the default card with header, content, and footer
                sections.
              </p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          {/* Tabs */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="pt-md">
                  Content for tab 1
                </TabsContent>
                <TabsContent value="tab2" className="pt-md">
                  Content for tab 2
                </TabsContent>
                <TabsContent value="tab3" className="pt-md">
                  Content for tab 3
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Skeleton */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>Loading placeholders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex items-center gap-md">
                <Skeleton className="size-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-[125px] w-full rounded-xl" />
            </CardContent>
          </Card>
        </section>

        {/* Custom Poisik Components */}
        <section className="mb-xxl">
          <h2 className="mb-xl text-headline-lg font-semibold">Poisik Components</h2>

          {/* PoisikLogo */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>PoisikLogo</CardTitle>
              <CardDescription>Wordmark logo — sm, md, lg</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-md">
              <PoisikLogo size="sm" />
              <PoisikLogo size="md" />
              <PoisikLogo size="lg" />
            </CardContent>
          </Card>

          {/* CircularGauge */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>CircularGauge</CardTitle>
              <CardDescription>Overall score ring</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-xl">
              <CircularGauge value={84} />
              <CircularGauge value={62} />
              <CircularGauge value={95} size={120} />
            </CardContent>
          </Card>

          {/* CategoryScoreBar */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>CategoryScoreBar</CardTitle>
              <CardDescription>Horizontal score bars — signal blue fill only</CardDescription>
            </CardHeader>
            <CardContent className="space-y-md">
              <CategoryScoreBar label="Visual Hierarchy" value={90} />
              <CategoryScoreBar label="Contrast" value={65} />
              <CategoryScoreBar label="Spacing" value={78} />
              <CategoryScoreBar label="Typography" value={82} />
              <CategoryScoreBar label="Accessibility" value={70} />
              <CategoryScoreBar label="Consistency" value={95} />
            </CardContent>
          </Card>

          {/* Severity Badge Convention */}
          <Card className="mb-xl">
            <CardHeader>
              <CardTitle>Severity Badges</CardTitle>
              <CardDescription>Critical, Warning, Suggestion — per design spec</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-md">
              <span className="rounded-full bg-accent-signal px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Critical
              </span>
              <span className="rounded-full bg-accent-signal/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-primary">
                Warning
              </span>
              <span className="rounded-full border border-border-strong px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-muted">
                Suggestion
              </span>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
