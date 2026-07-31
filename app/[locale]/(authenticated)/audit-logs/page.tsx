import { History } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { AuditLogsList, type AuditLogItem } from '@/components/poisik';
import type { AnalysisResult } from '@/lib/schemas';

// New sidebar destination (previously only reachable per-project via
// Project Detail's own analyses list): a single chronological feed of every
// analysis the account has ever run, across every project, newest first.
export default async function AuditLogsPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const t = await getTranslations('AuditLogs');

  const analyses = await prisma.analysis.findMany({
    where: { project: { userId } },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  if (analyses.length === 0) {
    return (
      <div className="mx-auto mt-24 max-w-112 text-center">
        <div className="mx-auto mb-lg flex size-14 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <History className="size-6 text-accent-signal" strokeWidth={1.5} />
        </div>
        <h1 className="mb-sm text-headline-md font-semibold text-text-primary">
          {t('emptyTitle')}
        </h1>
        <p className="mb-lg text-body-md text-text-secondary">{t('emptyDesc')}</p>
        <Link
          href="/projects/new-analysis"
          className="inline-flex items-center justify-center gap-sm rounded-xl bg-accent-signal px-lg py-md font-bold text-white transition-opacity hover:opacity-90"
        >
          {t('runFirstAnalysis')}
        </Link>
      </div>
    );
  }

  const projectCount = new Set(analyses.map((a) => a.project.id)).size;

  const items: AuditLogItem[] = analyses.map((a) => {
    const result = a.result as AnalysisResult | undefined;
    return {
      id: a.id,
      projectId: a.project.id,
      projectName: a.project.name,
      score: result?.overall_score,
      issuesCount: result?.issues.length ?? 0,
      imageUrl: a.imageUrl,
      createdAt: a.createdAt,
    };
  });

  return (
    <div>
      <div className="mb-xl flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <History className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">{t('title')}</h1>
          <p className="mt-xs text-body-md text-text-secondary">
            {t('subtitle', { auditCount: analyses.length, projectCount })}
          </p>
        </div>
      </div>

      <AuditLogsList items={items} />
    </div>
  );
}
