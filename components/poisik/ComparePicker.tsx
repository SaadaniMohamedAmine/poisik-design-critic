'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';

export interface CompareAnalysisItem {
  id: string;
  index: number; // 1-based, oldest = 1 — same "Audit #N" convention as the project page
  imageUrl: string;
  score: number | undefined;
  issuesCount: number;
  createdAt: Date;
}

interface ComparePickerProps {
  projectId: string;
  analyses: CompareAnalysisItem[];
}

// Design reference: design_v2/select_analyses_to_compare (Stitch mockup —
// there it's a modal over a dummy project page; here it's the whole
// /compare route, so the picker's own card grid + footer is what's
// reproduced). Kept the thumbnail-with-checkbox-overlay card, the date
// pill, and the "X of 2 selected" footer. Dropped the mockup's invented
// version names ("V1.4: Core Flow") and captions ("Critical Fixes
// Applied", "Baseline metrics") — nothing in the schema backs a version
// name or a change-log tag, so cards use the same "Audit #N" + real issue
// count already established on the project page instead.
export function ComparePicker({ projectId, analyses }: ComparePickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      // Already have 2 — brief shake instead of silently doing nothing.
      setShakeId(id);
      setTimeout(() => setShakeId(null), 300);
      return prev;
    });
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
        {analyses.map((a) => {
          const isSelected = selected.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              className={`group overflow-hidden rounded-xl border bg-surface text-left transition-all ${
                isSelected
                  ? 'border-accent-signal shadow-[inset_0_0_0_1px_var(--color-accent-signal)]'
                  : 'border-border hover:border-border-strong hover:bg-surface-hover'
              } ${shakeId === a.id ? 'animate-[shake_0.3s]' : ''}`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-bg-elevated">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset */}
                <img
                  src={a.imageUrl}
                  alt=""
                  className={`size-full object-cover transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                  }`}
                />
                <div
                  className={`absolute top-sm right-sm flex size-6 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'border-accent-signal bg-accent-signal'
                      : 'border-border-strong bg-bg-elevated/80'
                  }`}
                >
                  {isSelected && <Check className="size-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>
              <div className="p-md">
                <div className="mb-xs flex items-start justify-between gap-sm">
                  <h4 className="text-label-md font-bold text-text-primary">Audit #{a.index}</h4>
                  <span className="shrink-0 rounded bg-bg-elevated px-sm py-0.5 text-[10px] font-bold tracking-wide text-text-secondary uppercase">
                    {a.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="truncate text-label-sm text-text-secondary">
                  {a.score ?? '—'}/100 · {a.issuesCount} issue{a.issuesCount === 1 ? '' : 's'}{' '}
                  flagged
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-lg flex items-center justify-between border-t border-border pt-lg">
        <p className="text-label-md text-text-secondary">
          <span className="font-bold text-text-primary">{selected.length}</span> of 2 selected
        </p>
        <div className="flex gap-md">
          <Link
            href={`/projects/${projectId}`}
            className="rounded-xl px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
          >
            Cancel
          </Link>
          <button
            disabled={selected.length !== 2}
            onClick={() =>
              router.push(`/projects/${projectId}/compare?a=${selected[0]}&b=${selected[1]}`)
            }
            className="rounded-xl bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
