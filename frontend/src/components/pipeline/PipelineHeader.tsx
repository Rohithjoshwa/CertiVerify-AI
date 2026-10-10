"use client";

import React, { useState } from "react";
import { ArrowLeft, RefreshCw, Copy, Check, Hash, FileText, ImageIcon, ShieldCheck } from "lucide-react";
import { CertificateResponse, PipelineStatusResponse } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

interface PipelineHeaderProps {
  certificate?: CertificateResponse | null;
  cert?: CertificateResponse | null;
  pipeline?: PipelineStatusResponse | null;
  overallStatus?: "FULLY_COMPLETE" | "PARTIALLY_COMPLETE" | "NOT_STARTED" | string;
  completionPct?: number;
  onBack?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
}

export const PipelineHeader: React.FC<PipelineHeaderProps> = ({
  certificate,
  cert,
  pipeline,
  overallStatus,
  completionPct,
  onBack,
  onRefresh,
  refreshing = false,
  loading = false,
}) => {
  const activeCert = cert ?? certificate;
  const isRefreshing = refreshing || loading;
  const activeOverallStatus = pipeline?.overall_status ?? overallStatus;
  const activeCompletionPct = pipeline?.completion_pct ?? completionPct ?? 0;

  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    if (!activeCert?.sha256_hash) return;
    navigator.clipboard.writeText(activeCert.sha256_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPdf = activeCert?.file_type?.toLowerCase() === "pdf";

  const getStatusBadge = () => {
    if (activeOverallStatus === "FULLY_COMPLETE") {
      return (
        <span className="px-2.5 py-1 rounded-[2px] bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] text-[10px] font-mono font-semibold tracking-wider">
          LEDGER VERIFIED · 100%
        </span>
      );
    }
    if (overallStatus === "PARTIALLY_COMPLETE") {
      return (
        <span className="px-2.5 py-1 rounded-[2px] bg-[#ffb95f]/10 border border-[#ffb95f]/30 text-[#ffb95f] text-[10px] font-mono font-semibold tracking-wider">
          PIPELINE ACTIVE · {completionPct ? `${Math.round(completionPct)}%` : "IN PROGRESS"}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-[2px] bg-[#8d90a0]/10 border border-[#8d90a0]/30 text-[#8d90a0] text-[10px] font-mono font-semibold tracking-wider">
        READY FOR INFERENCE
      </span>
    );
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-[#8d90a0] hover:text-[#d3e4fe] font-mono transition"
          >
            <ArrowLeft size={14} /> Back to Repository
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#38bdf8]" />
            <span className="text-xs font-mono text-[#d3e4fe] font-semibold">CertiVerify Pipeline Cockpit</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-[#c3c6d7] hover:text-[#d3e4fe] rounded-[4px] text-xs font-mono transition disabled:opacity-50"
              title="Refresh Pipeline Telemetry"
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin text-[#38bdf8]" : ""} />
              <span>Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Certificate Telemetry Row */}
      {activeCert && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-[6px] bg-[#102034] border border-[#1b2b3f] flex items-center justify-center text-[#38bdf8] shrink-0">
              {isPdf ? <FileText size={22} /> : <ImageIcon size={22} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-[#d3e4fe] truncate font-sans">
                  {activeCert.original_filename}
                </h1>
                <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#2563eb]/20 text-[#38bdf8] border border-[#2563eb]/40">
                  {activeCert.file_type}
                </span>
              </div>
              <p className="text-xs text-[#8d90a0] font-mono mt-0.5">
                <span>{(activeCert.file_size_bytes / 1024).toFixed(0)} KB</span>
                <span className="mx-2">·</span>
                <span>Uploaded {new Date(activeCert.uploaded_at).toLocaleString()}</span>
                <span className="mx-2">·</span>
                <span>ID: {activeCert.id}</span>
              </p>
            </div>
          </div>

          {/* Real Cryptographic Fingerprint */}
          <div className="flex items-center gap-2 p-2 bg-[#000f21] border border-[#1b2b3f] rounded-[4px] shrink-0 max-w-full lg:max-w-md">
            <Hash size={12} className="text-[#4edea3] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono uppercase text-[#8d90a0]">FIPS 180-4 SHA-256 Digest</p>
              <code className="text-[11px] font-mono text-[#38bdf8] truncate block select-all">
                {activeCert.sha256_hash}
              </code>
            </div>
            <button
              onClick={handleCopyHash}
              className="p-1.5 text-[#8d90a0] hover:text-[#d3e4fe] hover:bg-[#102034] rounded transition shrink-0"
              title="Copy SHA-256 Hash"
            >
              {copied ? <Check size={13} className="text-[#4edea3]" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
