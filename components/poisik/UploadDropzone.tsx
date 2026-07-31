'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CloudUpload, X, Eye, Verified, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';

interface UploadDropzoneProps {
  onAnalyze: (imageUrl: string) => void;
  className?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

interface FilePreview {
  file: File;
  preview: string;
}

export function UploadDropzone({ onAnalyze, className }: UploadDropzoneProps) {
  const t = useTranslations('Upload');
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res?.[0]?.url) {
        onAnalyze(res[0].url);
      }
    },
    onUploadError: () => {
      setIsUploading(false);
      setProgress(0);
      setError(t('errorUpload'));
    },
    onUploadProgress: (p) => {
      setProgress(p);
    },
  });

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return t('errorType');
      }
      if (file.size > MAX_SIZE) {
        return t('errorSize');
      }
      return null;
    },
    [t]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      const preview = URL.createObjectURL(file);
      setFilePreview({ file, preview });
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview.preview);
    }
    setFilePreview(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, [filePreview]);

  const handleUpload = useCallback(async () => {
    if (!filePreview) return;
    setIsUploading(true);
    setError(null);
    await startUpload([filePreview.file]);
  }, [filePreview, startUpload]);

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className={cn('w-full', className)}>
      {!filePreview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-xxl text-center transition-all duration-300',
            isDragOver
              ? 'border-accent-signal bg-surface-hover'
              : 'border-border-strong hover:bg-surface-hover'
          )}
        >
          <div className="mb-lg flex size-16 items-center justify-center rounded-full bg-surface transition-transform group-hover:scale-110">
            <CloudUpload className="size-8 text-accent-signal" />
          </div>
          <p className="mb-xs text-body-lg text-text-primary">{t('dropzoneText')}</p>
          <p className="text-label-sm text-text-muted">{t('dropzoneFormats')}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <div className="space-y-lg">
          <div className="flex items-center gap-lg rounded-lg border border-border-strong bg-surface p-md">
            <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-md group">
              <Image
                src={filePreview.preview}
                alt={filePreview.file.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Eye className="size-5 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <div className="mb-xs flex items-start justify-between">
                <div>
                  <p className="text-body-md font-semibold text-text-primary">
                    {filePreview.file.name}
                  </p>
                  <p className="text-label-sm text-text-muted">
                    {formatSize(filePreview.file.size)} •{' '}
                    {t('imageType', { type: filePreview.file.type.split('/')[1].toUpperCase() })}
                  </p>
                </div>
                <button
                  onClick={handleRemove}
                  className="text-text-secondary transition-colors hover:text-destructive"
                >
                  <X className="size-5" />
                </button>
              </div>
              {isUploading && (
                <div className="mt-md h-1 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent-signal transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-md border-t border-border pt-md">
            <div className="flex shrink-0 items-center gap-sm text-text-secondary">
              <Verified className="size-[18px] shrink-0 text-accent-signal" />
              <span className="text-label-md whitespace-nowrap">{t('securityScan')}</span>
            </div>
            <div className="flex w-full gap-md sm:w-auto">
              <button
                onClick={() => {
                  handleRemove();
                  inputRef.current?.click();
                }}
                className="flex-1 rounded-lg border border-border px-lg py-md text-label-md font-medium whitespace-nowrap text-text-primary transition-colors hover:bg-surface sm:flex-none"
              >
                {t('changeFile')}
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex flex-1 items-center justify-center gap-sm rounded-lg bg-accent-signal px-xl py-md text-label-md font-bold whitespace-nowrap text-white shadow-lg shadow-accent-signal/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 sm:flex-none"
              >
                <Sparkles className="size-5" />
                {isUploading ? t('uploading') : t('analyze')}
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-md rounded-lg bg-surface px-md py-sm text-label-md text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
