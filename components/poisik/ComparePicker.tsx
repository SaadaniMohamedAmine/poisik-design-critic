'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

interface AnalysisThumb {
  id: string;
  imageUrl: string;
}

interface ComparePickerProps {
  projectId: string;
  analyses: AnalysisThumb[];
}

export function ComparePicker({ projectId, analyses }: ComparePickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  }

  return (
    <div>
      <div className="mb-lg grid grid-cols-2 gap-md md:grid-cols-4">
        {analyses.map((a) => (
          <button
            key={a.id}
            onClick={() => toggle(a.id)}
            className={`overflow-hidden rounded-lg border-2 transition-colors ${selected.includes(a.id) ? 'border-accent-signal' : 'border-transparent'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL */}
            <img src={a.imageUrl} alt="" className="h-24 w-full object-cover" />
          </button>
        ))}
      </div>
      <button
        disabled={selected.length !== 2}
        onClick={() =>
          router.push(`/projects/${projectId}/compare?a=${selected[0]}&b=${selected[1]}`)
        }
        className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Compare
      </button>
    </div>
  );
}
