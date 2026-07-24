'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ReportView } from '@/components/poisik/ReportView';
import type { AnalysisResult } from '@/lib/schemas';

interface AnalysisData {
  id: string;
  result: AnalysisResult;
  imageUrl: string;
  isPublic: boolean;
}

export default function ReportPage() {
  const params = useParams();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/analyses/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((json) => setData(json.analysis))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="size-8 animate-spin rounded-full border-2 border-accent-signal border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base text-text-primary">
        <p className="text-headline-md text-text-secondary">Analysis not found</p>
        <Link href="/" className="mt-md text-label-md text-accent-signal hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  return <ReportView result={data.result} isReadOnly={data.isPublic} />;
}
