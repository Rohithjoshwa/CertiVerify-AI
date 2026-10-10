"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  ImageIcon,
  X,
  Loader2,
  Trash2,
  ChevronDown,
  Tag,
  AlertCircle,
  Hash,
} from "lucide-react";
import { MANUAL_DOC_TYPES } from "./CertificateDropzone";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface StagedFilesListProps {
  pending: File[];
  pendingDocTypes: string[];
  uploading: boolean;
  error: string | null;
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onUpdateDocType: (index: number, type: string) => void;
  onUpload: () => void;
}

export const StagedFilesList: React.FC<StagedFilesListProps> = ({
  pending,
  pendingDocTypes,
  uploading,
  error,
  onRemove,
  onClearAll,
  onUpdateDocType,
  onUpload,
}) => {
  const [previews, setPreviews] = useState<Record<number, string>>({});

  // Generate object URLs for image previews
  useEffect(() => {
    const urls: Record<number, string> = {};
    pending.forEach((file, i) => {
      if (file.type.startsWith("image/")) {
        urls[i] = URL.createObjectURL(file);
      }
    });
    setPreviews(urls);

    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [pending]);

  if (pending.length === 0) return null;

  const totalBytes = pending.reduce((acc, f) => acc + f.size, 0);
  const totalFormatted = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-[4px] bg-[#2563eb]/20 border border-[#2563eb]/40 text-[#38bdf8] text-[11px] font-mono font-bold flex items-center justify-center">
            03
          </span>
          <span className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Staged Credentials ({pending.length})
          </span>
          <span className="text-[11px] font-mono text-[#8d90a0]">· {totalFormatted} MB total</span>
        </div>
        <button
          onClick={onClearAll}
          disabled={uploading}
          className="text-xs text-[#8d90a0] hover:text-[#ffb4ab] flex items-center gap-1 font-mono transition disabled:opacity-50"
        >
          <Trash2 size={12} /> Clear Queue
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-[#93000a]/25 border border-[#ffb4ab]/30 rounded-[6px] flex items-start gap-2.5 text-xs text-[#ffb4ab]">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* List of files */}
      <div className="space-y-2.5">
        {pending.map((file, i) => {
          const isPdf = file.type === "application/pdf";
          const hasImagePreview = Boolean(previews[i]);

          return (
            <div
              key={`${file.name}-${i}`}
              className="bg-[#102034] border border-[#1b2b3f] rounded-[6px] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* File Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[4px] bg-[#0b1c30] border border-[#1b2b3f] flex items-center justify-center shrink-0 overflow-hidden">
                  {hasImagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previews[i]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : isPdf ? (
                    <FileText size={18} className="text-[#38bdf8]" />
                  ) : (
                    <ImageIcon size={18} className="text-[#4edea3]" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#d3e4fe] truncate font-sans">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#8d90a0] mt-0.5">
                    <span>{(file.size / 1024).toFixed(0)} KB</span>
                    <span>·</span>
                    <span className="uppercase">{file.type.split("/")[1] || "DOC"}</span>
                    <span>·</span>
                    <span className="text-[#38bdf8]/80 flex items-center gap-0.5">
                      <Hash size={10} /> Pending Ingest Hash
                    </span>
                  </div>
                </div>
              </div>

              {/* Classification Tag & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <select
                    value={pendingDocTypes[i] || ""}
                    onChange={(e) => onUpdateDocType(i, e.target.value)}
                    disabled={uploading}
                    className="appearance-none bg-[#0b1c30] border border-[#1b2b3f] rounded-[4px] px-2.5 py-1.5 pr-7 text-[11px] text-[#c3c6d7] focus:outline-none focus:border-[#2563eb] disabled:opacity-50 cursor-pointer"
                    aria-label={`Document type for ${file.name}`}
                  >
                    <option value="">Auto-Detect Type</option>
                    {MANUAL_DOC_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={11}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none"
                  />
                </div>

                {pendingDocTypes[i] && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono bg-[#2563eb]/15 text-[#38bdf8] border border-[#2563eb]/30 rounded-[2px] px-1.5 py-0.5">
                    <Tag size={10} />
                    {MANUAL_DOC_TYPES.find((t) => t.value === pendingDocTypes[i])?.label}
                  </span>
                )}

                <button
                  onClick={() => onRemove(i)}
                  disabled={uploading}
                  className="w-7 h-7 rounded-[4px] bg-[#0b1c30] border border-[#1b2b3f] hover:border-[#ffb4ab]/40 text-[#8d90a0] hover:text-[#ffb4ab] flex items-center justify-center transition disabled:opacity-50"
                  title="Remove from queue"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Uploading indicator */}
      {uploading && (
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#8d90a0]">
            <span className="flex items-center gap-2 text-[#38bdf8]">
              <Loader2 size={13} className="animate-spin" />
              Transferring & calculating cryptographic hashes...
            </span>
            <span>Streaming</span>
          </div>
          <ProgressBar value={85} size="xs" variant="brand" />
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onUpload}
        disabled={uploading}
        id="upload-submit-btn"
        className="w-full py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] text-xs font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(37,99,235,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {uploading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Ingesting & Hashing...
          </>
        ) : (
          `Ingest ${pending.length} Document${pending.length > 1 ? "s" : ""} to Forensic Ledger`
        )}
      </button>
    </div>
  );
};
