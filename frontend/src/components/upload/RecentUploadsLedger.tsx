"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ImageIcon,
  Eye,
  ScanSearch,
  Trash2,
  Loader2,
  GitCompare,
  Tag,
  BookOpen,
  ChevronDown,
  Copy,
  Check,
  Search,
  Hash,
  ExternalLink,
} from "lucide-react";
import { CertificateResponse, certificateApi } from "@/lib/api";
import { MANUAL_DOC_TYPES } from "./CertificateDropzone";

const DOC_TYPE_LABELS: Record<string, string> = {
  degree_certificate: "Degree Certificate",
  marksheet: "SSLC / Marksheet",
  diploma: "Diploma Certificate",
  resume: "Resume / CV",
  transfer_certificate: "Transfer Certificate",
  experience_certificate: "Experience Certificate",
  aadhaar_card: "Aadhaar Card",
  identity_card: "Identity Card",
  unknown: "Unknown Document",
};

interface RecentUploadsLedgerProps {
  certificates: CertificateResponse[];
  docTypes: Record<string, { label: string; confidence: number } | "loading" | undefined>;
  ocrRunning: Record<string, boolean>;
  certDocTypes: Record<string, string>;
  deletingId: string | null;
  onRunOcr: (certId: string) => void;
  onDelete: (id: string, filename: string) => void;
  onCertDocTypeChange: (certId: string, type: string) => void;
}

export const RecentUploadsLedger: React.FC<RecentUploadsLedgerProps> = ({
  certificates,
  docTypes,
  ocrRunning,
  certDocTypes,
  deletingId,
  onRunOcr,
  onDelete,
  onCertDocTypeChange,
}) => {
  const [search, setSearch] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Group certificates by group_id or certificate id
  const grouped: Record<string, CertificateResponse[]> = {};
  for (const cert of certificates) {
    const key = cert.group_id || cert.id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cert);
  }

  // Filter groups
  const filteredGroups = Object.entries(grouped).filter(([, group]) =>
    group.some(
      (c) =>
        c.original_filename.toLowerCase().includes(search.toLowerCase()) ||
        c.sha256_hash.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Ingested Credentials Ledger ({certificates.length})
          </h2>
        </div>

        {certificates.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0]"
            />
            <input
              type="text"
              placeholder="Filter by filename or hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#102034] border border-[#1b2b3f] rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-[#d3e4fe] placeholder:text-[#8d90a0]/60 focus:outline-none focus:border-[#2563eb] font-sans"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {certificates.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-[#1b2b3f] rounded-[6px]">
          <FileText size={32} className="mx-auto text-[#8d90a0]/40 mb-2" />
          <p className="text-sm font-semibold text-[#d3e4fe] font-sans">
            No Credentials Ingested Yet
          </p>
          <p className="text-xs text-[#8d90a0] font-mono mt-1">
            Drag and drop credentials above to populate the ledger.
          </p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-8 text-xs text-[#8d90a0] font-mono">
          No records match filter query &quot;{search}&quot;.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map(([groupId, group]) => (
            <div key={groupId} className="space-y-2">
              {group.length > 1 && (
                <div className="flex items-center justify-between px-2 text-xs text-[#8d90a0]">
                  <span className="font-mono text-[11px] flex items-center gap-1.5 text-[#38bdf8]">
                    <GitCompare size={12} />
                    Document Batch ({group.length} linked credentials)
                  </span>
                  <Link
                    href={`/dashboard/groups/${groupId}`}
                    className="flex items-center gap-1 font-mono text-[11px] text-[#2563eb] hover:text-[#38bdf8] hover:underline"
                  >
                    Compare Set <ExternalLink size={10} />
                  </Link>
                </div>
              )}

              {group.map((cert) => {
                const isPdf = cert.file_type.toLowerCase() === "pdf";
                const classification = docTypes[cert.id];
                const isClassifying = classification === "loading";
                const isOcrActive = ocrRunning[cert.id];

                return (
                  <div
                    key={cert.id}
                    className="bg-[#102034] border border-[#1b2b3f] hover:border-[#1b2b3f]/80 rounded-[6px] p-3.5 transition space-y-2.5"
                  >
                    {/* Top Row: File details, Hashes, Badges, Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* File Icon & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-[4px] bg-[#0b1c30] border border-[#1b2b3f] flex items-center justify-center shrink-0">
                          {isPdf ? (
                            <FileText size={17} className="text-[#38bdf8]" />
                          ) : (
                            <ImageIcon size={17} className="text-[#4edea3]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#d3e4fe] truncate font-sans">
                            {cert.original_filename}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#8d90a0] mt-0.5">
                            <span>{(cert.file_size_bytes / 1024).toFixed(0)} KB</span>
                            <span>·</span>
                            <span>{new Date(cert.uploaded_at).toLocaleString()}</span>
                            <span>·</span>
                            <span className="text-[#8d90a0]/80">
                              ID: {cert.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badges & Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Classification badge */}
                        {isClassifying && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-[#8d90a0] px-2 py-0.5 rounded-[2px] bg-[#0b1c30] border border-[#1b2b3f]">
                            <Loader2 size={10} className="animate-spin text-[#38bdf8]" />
                            Classifying...
                          </span>
                        )}
                        {classification && classification !== "loading" && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-[#38bdf8] px-2 py-0.5 rounded-[2px] bg-[#2563eb]/10 border border-[#2563eb]/30">
                            <Tag size={10} />
                            {DOC_TYPE_LABELS[classification.label] || classification.label}
                            {classification.confidence != null && (
                              <span className="text-[#8d90a0] font-sans">
                                ({(classification.confidence * 100).toFixed(0)}%)
                              </span>
                            )}
                          </span>
                        )}

                        {/* Preview */}
                        <a
                          href={certificateApi.previewUrl(cert.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-[4px] bg-[#0b1c30] border border-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] transition"
                          title="Preview Document"
                        >
                          <Eye size={14} />
                        </a>

                        {/* Cockpit link */}
                        <Link
                          href={`/dashboard/certificates/${cert.id}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[#2563eb]/15 border border-[#2563eb]/30 text-[#38bdf8] hover:bg-[#2563eb]/25 text-[11px] font-mono transition"
                          title="Open Cockpit"
                        >
                          <ScanSearch size={13} />
                          <span>Cockpit</span>
                        </Link>

                        {/* Delete */}
                        <button
                          id={`delete-cert-${cert.id}`}
                          onClick={() => onDelete(cert.id, cert.original_filename)}
                          disabled={deletingId === cert.id}
                          className="p-1.5 rounded-[4px] bg-[#0b1c30] border border-[#1b2b3f] text-[#8d90a0] hover:text-[#ffb4ab] hover:border-[#ffb4ab]/30 transition disabled:opacity-40"
                          title="Delete Certificate"
                        >
                          {deletingId === cert.id ? (
                            <Loader2 size={14} className="animate-spin text-[#ffb4ab]" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Cryptographic SHA-256 Hash Display */}
                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#000f21] border border-[#1b2b3f]/70 rounded-[4px]">
                      <div className="flex items-center gap-1.5 min-w-0 font-mono text-[10px]">
                        <Hash size={11} className="text-[#4edea3] shrink-0" />
                        <span className="text-[#8d90a0] shrink-0 uppercase">SHA-256:</span>
                        <span className="text-[#c3c6d7] truncate select-all">
                          {cert.sha256_hash}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyHash(cert.sha256_hash)}
                        className="p-1 text-[#8d90a0] hover:text-[#d3e4fe] transition shrink-0"
                        title="Copy SHA-256 hash"
                      >
                        {copiedHash === cert.sha256_hash ? (
                          <Check size={12} className="text-[#4edea3]" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>

                    {/* Bottom Row: OCR Engine Trigger */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1b2b3f]/40">
                      <div className="flex items-center gap-2 flex-1">
                        <BookOpen size={12} className="text-[#8d90a0] shrink-0" />
                        <span className="text-[10px] font-mono text-[#8d90a0] uppercase shrink-0">
                          OCR Mode:
                        </span>
                        <div className="relative flex-1 max-w-xs">
                          <select
                            value={certDocTypes[cert.id] || ""}
                            onChange={(e) => onCertDocTypeChange(cert.id, e.target.value)}
                            id={`cert-doc-type-${cert.id}`}
                            aria-label="Document type for OCR"
                            className="w-full appearance-none bg-[#0b1c30] border border-[#1b2b3f] rounded-[3px] px-2 py-1 pr-6 text-[10px] font-mono text-[#c3c6d7] focus:outline-none focus:border-[#2563eb] cursor-pointer"
                          >
                            <option value="">Auto-Detect Layout Schema</option>
                            {MANUAL_DOC_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={10}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none"
                          />
                        </div>
                      </div>

                      <button
                        id={`run-ocr-${cert.id}`}
                        onClick={() => onRunOcr(cert.id)}
                        disabled={isOcrActive}
                        className="px-3 py-1 bg-[#2563eb]/20 hover:bg-[#2563eb]/30 border border-[#2563eb]/40 text-[#38bdf8] rounded-[3px] text-[10px] font-mono font-semibold tracking-wider flex items-center justify-center gap-1.5 transition disabled:opacity-50 shrink-0"
                      >
                        {isOcrActive ? (
                          <>
                            <Loader2 size={11} className="animate-spin" />
                            Extracting Neural OCR...
                          </>
                        ) : (
                          <>
                            <ScanSearch size={11} />
                            Run OCR Pipeline
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
