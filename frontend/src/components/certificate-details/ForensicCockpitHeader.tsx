"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  ScanLine,
  Zap,
  Download,
  FileText,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  FileCode,
  HardDrive,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";
import {
  CertificateResponse,
  PipelineStatusResponse,
  FinalPredictionResponse,
  VerificationReportResponse,
} from "@/lib/api";

interface ForensicCockpitHeaderProps {
  cert: CertificateResponse | null;
  pipeline: PipelineStatusResponse | null;
  prediction: FinalPredictionResponse | null;
  report: VerificationReportResponse | null;
  activeTab: "pipeline" | "cockpit";
  onTabChange: (tab: "pipeline" | "cockpit") => void;
  onRefresh: () => void;
  onRunOcr: () => void;
  onVerifyAll: () => void;
  onGenerateReport: () => void;
  onDownloadReport: () => void;
  loadingPipeline: boolean;
  runningOcr: boolean;
  verifyingAll: boolean;
  generatingReport: boolean;
  downloadingReport: boolean;
}

export const ForensicCockpitHeader: React.FC<ForensicCockpitHeaderProps> = ({
  cert,
  pipeline,
  prediction,
  report,
  activeTab,
  onTabChange,
  onRefresh,
  onRunOcr,
  onVerifyAll,
  onGenerateReport,
  onDownloadReport,
  loadingPipeline,
  runningOcr,
  verifyingAll,
  generatingReport,
  downloadingReport,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const copyToClipboard = (text: string, type: "hash" | "id") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Navigation & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 bg-[#0b1c30] hover:bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe] rounded-[4px] border border-[#1b2b3f] transition"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-[#d3e4fe] tracking-tight">
                {cert?.original_filename || "Certificate Inspection"}
              </h1>
              {prediction && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wide border ${
                    prediction.label === "genuine"
                      ? "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30"
                      : prediction.label === "suspicious"
                      ? "bg-[#ffb95f]/10 text-[#ffb95f] border-[#ffb95f]/30"
                      : "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30"
                  }`}
                >
                  {prediction.label === "genuine" && "✓ "}
                  {prediction.label === "suspicious" && "⚠ "}
                  {prediction.label === "fake" && "✗ "}
                  {prediction.label}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8d90a0] mt-0.5">
              AI Forensic Cockpit • Full Integrity & Cryptographic Verification Audit
            </p>
          </div>
        </div>

        {/* Global Action Cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefresh}
            disabled={loadingPipeline}
            className="px-3 py-2 text-xs font-medium bg-[#0b1c30] hover:bg-[#102034] text-[#c3c6d7] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded-[4px] transition flex items-center gap-1.5 disabled:opacity-50"
            title="Reload telemetry and records"
          >
            <RefreshCw
              size={13}
              className={loadingPipeline ? "animate-spin text-[#38bdf8]" : "text-[#8d90a0]"}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={onRunOcr}
            disabled={runningOcr}
            className="px-3 py-2 text-xs font-medium bg-[#102034] hover:bg-[#1b2b3f] text-[#c3c6d7] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded-[4px] transition flex items-center gap-1.5 disabled:opacity-50"
            title="Re-run optical character recognition"
          >
            {runningOcr ? (
              <Loader2 size={13} className="animate-spin text-[#38bdf8]" />
            ) : (
              <ScanLine size={13} className="text-[#38bdf8]" />
            )}
            <span>Run OCR</span>
          </button>

          <button
            onClick={onVerifyAll}
            disabled={verifyingAll}
            className="px-3.5 py-2 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            title="Execute QR, Blockchain, Tampering, Duplicate, Fraud, and Trust verification"
          >
            {verifyingAll ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Zap size={13} />
            )}
            <span>{verifyingAll ? "Verifying..." : "Verify All"}</span>
          </button>

          {report ? (
            <button
              onClick={onDownloadReport}
              disabled={downloadingReport}
              className="px-3 py-2 text-xs font-medium bg-[#0b1c30] hover:bg-[#102034] text-[#4edea3] border border-[#4edea3]/30 rounded-[4px] transition flex items-center gap-1.5 disabled:opacity-50"
              title="Download authenticated audit PDF"
            >
              {downloadingReport ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              <span>Download PDF</span>
            </button>
          ) : (
            <button
              onClick={onGenerateReport}
              disabled={generatingReport}
              className="px-3 py-2 text-xs font-medium bg-[#0b1c30] hover:bg-[#102034] text-[#c3c6d7] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded-[4px] transition flex items-center gap-1.5 disabled:opacity-50"
              title="Generate comprehensive forensic report"
            >
              {generatingReport ? (
                <Loader2 size={13} className="animate-spin text-[#38bdf8]" />
              ) : (
                <FileText size={13} className="text-[#8d90a0]" />
              )}
              <span>Generate Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Metadata Pill Banner */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-3 text-xs text-[#c3c6d7] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-center">
        {/* Certificate ID */}
        <div className="flex items-center gap-2 min-w-0">
          <FileCode size={14} className="text-[#8d90a0] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-[#8d90a0] uppercase font-mono">Certificate ID</p>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[#d3e4fe] truncate">
                {cert?.id ? `${cert.id.slice(0, 8)}…` : "—"}
              </span>
              {cert?.id && (
                <button
                  onClick={() => copyToClipboard(cert.id, "id")}
                  className="text-[#8d90a0] hover:text-[#d3e4fe] transition"
                  title="Copy ID"
                >
                  {copiedId ? <Check size={11} className="text-[#4edea3]" /> : <Copy size={11} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* File Format & Size */}
        <div className="flex items-center gap-2">
          <HardDrive size={14} className="text-[#8d90a0] shrink-0" />
          <div>
            <p className="text-[10px] text-[#8d90a0] uppercase font-mono">Format & Size</p>
            <p className="text-[#d3e4fe] font-mono">
              {(cert?.file_type || "PDF").toUpperCase()} • {formatFileSize(cert?.file_size_bytes)}
            </p>
          </div>
        </div>

        {/* Upload Date */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#8d90a0] shrink-0" />
          <div>
            <p className="text-[10px] text-[#8d90a0] uppercase font-mono">Uploaded At</p>
            <p className="text-[#d3e4fe]">
              {cert?.uploaded_at
                ? new Date(cert.uploaded_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>
        </div>

        {/* SHA-256 Hash */}
        <div className="flex items-center gap-2 col-span-2 lg:col-span-2 min-w-0">
          <ShieldCheck size={14} className="text-[#4edea3] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#8d90a0] uppercase font-mono">SHA-256 Checksum</p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-[#d3e4fe] truncate">
                {cert?.sha256_hash || "Computing on-chain signature..."}
              </span>
              {cert?.sha256_hash && (
                <button
                  onClick={() => copyToClipboard(cert.sha256_hash, "hash")}
                  className="text-[#8d90a0] hover:text-[#d3e4fe] transition shrink-0"
                  title="Copy SHA-256 hash"
                >
                  {copiedHash ? (
                    <Check size={11} className="text-[#4edea3]" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Cockpit Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange("cockpit")}
            className={`px-4 py-2 rounded-[4px] text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 font-mono ${
              activeTab === "cockpit"
                ? "bg-[#2563eb]/20 text-[#38bdf8] border border-[#2563eb]/40"
                : "text-[#8d90a0] hover:text-[#d3e4fe] hover:bg-[#0b1c30]"
            }`}
          >
            <Layers size={14} />
            <span>AI Forensic Cockpit</span>
            {prediction && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  prediction.label === "genuine"
                    ? "bg-[#4edea3]/20 text-[#4edea3]"
                    : prediction.label === "suspicious"
                    ? "bg-[#ffb95f]/20 text-[#ffb95f]"
                    : "bg-[#ffb4ab]/20 text-[#ffb4ab]"
                }`}
              >
                {prediction.label}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("pipeline")}
            className={`px-4 py-2 rounded-[4px] text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 font-mono ${
              activeTab === "pipeline"
                ? "bg-[#2563eb]/20 text-[#38bdf8] border border-[#2563eb]/40"
                : "text-[#8d90a0] hover:text-[#d3e4fe] hover:bg-[#0b1c30]"
            }`}
          >
            <ScanLine size={14} />
            <span>OCR & Verification Pipeline</span>
            {pipeline && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#000f21] border border-[#1b2b3f] text-[#c3c6d7]">
                {pipeline.completion_pct}%
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
