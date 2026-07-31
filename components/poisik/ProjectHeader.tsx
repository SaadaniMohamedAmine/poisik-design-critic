'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { FolderOpen, Pencil, Trash2, Check, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectHeaderProps {
  projectId: string;
  initialName: string;
  analysisCount: number;
  children?: ReactNode;
}

// Rename + delete call the existing GET/PATCH/DELETE /api/projects/[id]
// route (already ownership-checked server-side) — this component just adds
// the interactive chrome (inline rename, delete confirmation dialog) that
// nothing in the app was wired up to yet.
export function ProjectHeader({
  projectId,
  initialName,
  analysisCount,
  children,
}: ProjectHeaderProps) {
  const t = useTranslations('ProjectHeader');
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveName() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) {
      setEditing(false);
      setDraft(name);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error();
      setName(trimmed);
      setEditing(false);
      toast.success(t('toastRenamed'));
    } catch {
      toast.error(t('toastRenameFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(t('toastDeleted'));
      router.push('/projects');
    } catch {
      toast.error(t('toastDeleteFailed'));
      setDeleting(false);
    }
  }

  return (
    <div className="mb-xl flex flex-col gap-lg md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <FolderOpen className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          {editing ? (
            <div className="flex items-center gap-sm">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setEditing(false);
                    setDraft(name);
                  }
                }}
                className="rounded-lg border border-accent-signal bg-bg-elevated px-md py-xs text-headline-lg font-bold text-text-primary focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                aria-label={t('saveNameAria')}
                className="rounded-lg p-xs text-accent-signal transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <Check className="size-4" strokeWidth={2} />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(name);
                }}
                aria-label={t('cancelRenameAria')}
                className="rounded-lg p-xs text-text-secondary transition-colors hover:bg-surface-hover"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-wrap items-center gap-xs">
              <Link
                href="/projects"
                className="shrink-0 text-body-md text-text-secondary transition-colors hover:text-text-primary"
              >
                {t('breadcrumb')}
              </Link>
              <h1 className="truncate text-headline-lg font-bold text-text-primary">{name}</h1>
              <button
                onClick={() => setEditing(true)}
                aria-label={t('renameProjectAria')}
                className="shrink-0 rounded-lg p-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <Pencil className="size-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                aria-label={t('deleteProjectAria')}
                className="shrink-0 rounded-lg p-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
          <p className="mt-xs text-body-md text-text-secondary">
            {t('analysesRun', { count: analysisCount })}
          </p>
        </div>
      </div>

      {children && <div className="flex shrink-0 flex-wrap items-center gap-sm">{children}</div>}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialogTitle', { name })}</DialogTitle>
            <DialogDescription>{t('deleteDialogDesc', { count: analysisCount })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {deleting ? t('deleting') : t('confirmDelete')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
