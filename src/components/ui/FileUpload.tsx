"use client";

import { useCallback, useRef, useState } from "react";
import { cn, formatFileSize } from "@/lib/utils";
import { validateFile, type FileValidationOptions } from "@/lib/file-validation";

export type FileUploadFile = {
  id: string;
  file: File;
  previewUrl?: string;
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
  error?: string;
};

export interface FileUploadProps {
  files: FileUploadFile[];
  onChange: React.Dispatch<React.SetStateAction<FileUploadFile[]>>;
  maxFiles?: number;
  validation?: FileValidationOptions;
  accept?: string;
  capture?: "user" | "environment";
  className?: string;
  label?: string;
  helperText?: string;
  privacyNote?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FileUpload({
  files,
  onChange,
  maxFiles = 10,
  validation,
  accept = "image/*",
  capture,
  className,
  label = "Upload photos",
  helperText = "Drag and drop or click to upload. JPG, PNG, WebP, HEIC up to 10 MB each.",
  privacyNote = "Photos are kept private and only used to assess your job.",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const simulateProgress = useCallback(
    (id: string) => {
      const interval = setInterval(() => {
        onChange((prev) => {
          const file = prev.find((f) => f.id === id);
          if (!file || file.status !== "uploading") {
            clearInterval(interval);
            return prev;
          }
          const nextProgress = Math.min(file.progress + Math.random() * 20, 95);
          return prev.map((f) => (f.id === id ? { ...f, progress: nextProgress } : f));
        });
      }, 200);
    },
    [onChange]
  );

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const remainingSlots = maxFiles - files.length;
      if (remainingSlots <= 0) return;

      const toAdd: FileUploadFile[] = [];
      for (let i = 0; i < Math.min(newFiles.length, remainingSlots); i++) {
        const file = newFiles[i];
        const error = validation ? validateFile(file, validation) : null;
        const id = generateId();

        const uploadFile: FileUploadFile = {
          id,
          file,
          previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          status: error ? "error" : "uploading",
          progress: 0,
          error: error ?? undefined,
        };

        toAdd.push(uploadFile);

        if (!error) {
          simulateProgress(id);
          // Simulate completion after a short delay
          setTimeout(
            () => {
              onChange((prev) =>
                prev.map((f) => (f.id === id ? { ...f, status: "complete", progress: 100 } : f))
              );
            },
            800 + Math.random() * 1000
          );
        }
      }

      onChange([...files, ...toAdd]);
    },
    [files, maxFiles, onChange, validation, simulateProgress]
  );

  const removeFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      onChange(files.filter((f) => f.id !== id));
    },
    [files, onChange]
  );

  const retryFile = useCallback(
    (id: string) => {
      onChange(
        files.map((f) => {
          if (f.id !== id) return f;
          const error = validation ? validateFile(f.file, validation) : null;
          if (error) return { ...f, status: "error", error: error };
          simulateProgress(id);
          setTimeout(
            () => {
              onChange((prev) =>
                prev.map((pf) => (pf.id === id ? { ...pf, status: "complete", progress: 100 } : pf))
              );
            },
            800 + Math.random() * 1000
          );
          return { ...f, status: "uploading", progress: 0, error: undefined };
        })
      );
    },
    [files, onChange, validation, simulateProgress]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-text">{label}</span>
        <span className="text-xs text-brand-muted">
          {files.length} of {maxFiles}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent",
          isDragging
            ? "border-brand-accent bg-brand-accent/10"
            : "border-brand-border bg-brand-background hover:border-brand-accent"
        )}
      >
        <p className="text-sm text-brand-text/90">{helperText}</p>
        <p className="mt-1 text-xs text-brand-muted">{privacyNote}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        multiple
        className="sr-only"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = ""; // allow re-selecting same files
        }}
      />

      {files.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((file) => (
            <li
              key={file.id}
              className="relative rounded-md border border-brand-border bg-brand-surface p-2"
            >
              {file.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Preview thumbnails use temporary object URLs and are not optimized images.
                <img
                  src={file.previewUrl}
                  alt={file.file.name}
                  className="mb-2 aspect-square w-full rounded object-cover"
                />
              ) : (
                <div className="mb-2 flex aspect-square w-full items-center justify-center rounded bg-brand-background/80 text-xs text-brand-muted">
                  No preview
                </div>
              )}
              <p className="truncate text-xs font-medium text-brand-text">{file.file.name}</p>
              <p className="text-xs text-brand-muted">{formatFileSize(file.file.size)}</p>

              {file.status === "uploading" && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-background/80">
                  <div
                    className="h-full bg-brand-accent transition-all"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}

              {file.status === "error" && <p className="mt-1 text-xs text-red-700">{file.error}</p>}

              <div className="mt-2 flex items-center gap-2">
                {file.status === "error" && (
                  <button
                    type="button"
                    onClick={() => retryFile(file.id)}
                    className="text-xs font-semibold text-brand-accent hover:underline"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-xs font-semibold text-brand-muted hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              {file.status === "complete" && (
                <span className="absolute right-2 top-2 rounded-full bg-brand-primary p-1 text-brand-background">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
