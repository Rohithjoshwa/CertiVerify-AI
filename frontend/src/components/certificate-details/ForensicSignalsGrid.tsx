"use client";

import React, { useState } from "react";
import {
  QrCode,
  Link2,
  ImageIcon,
  Copy,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { VerificationResultResponse, verificationApi } from "@/lib/api";

interface ForensicSignalsGridProps {
  verification: VerificationResultResponse | null;
  certificateId: string;
  onVerifyQr: () => void;
  onVerifyBlockchain: () => void;
  onVerifyTampering: () => void;
  onVerifyDuplicate: () => void;
  verifyingQr: boolean;
  verifyingChain: boolean;
  verifyingTampering: boolean;
  verifyingDuplicate: boolean;
}

export const ForensicSignalsGrid: React.FC<ForensicSignalsGridProps> = ({
  verification,
  certificateId,
  onVerifyQr,
  onVerifyBlockchain,
  onVerifyTampering,
  onVerifyDuplicate,
  verifyingQr,
  verifyingChain,
  verifyingTampering,
  verifyingDuplicate,
}) => {
  const [showTamperingDetail, setShowTamperingDetail] = useState(false);
  const [showDuplicateDetail, setShowDuplicateDetail] = useState(false);

  // 1. QR Status
  const qrStatus = verification?.qr_valid;
  const qrPresent = verification?.qr_present;
  const qrWarning = verification?.qr_warning;

  // 2. Blockchain Status
  const chainStatus = verification?.blockchain_status;

  // 3. Tampering
  const tamperingScore = verification?.tampering_score;
  const tamperingDetail = verification?.tampering_detail;

  // 4. Duplicate
  const isDuplicate = verification?.is_duplicate;
  const duplicateDetail = verification?.duplicate_detail;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldAlert size={15} className="text-[#38bdf8]" />
          Forensic Verification Signal Quadrant
        </h3>
        <span className="text-[11px] text-[#8d90a0] font-mono">
          4 Independent Forensic Vectors
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vector 1: Digital QR Verification */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#d3e4fe] flex items-center gap-1.5">
                <QrCode size={15} className="text-[#38bdf8]" />
                QR Verification
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] border ${
                  qrPresent === undefined
                    ? "text-[#8d90a0] border-[#1b2b3f] bg-[#102034]"
                    : !qrPresent
                    ? "text-[#ffb95f] border-[#ffb95f]/30 bg-[#ffb95f]/10"
                    : qrStatus
                    ? "text-[#4edea3] border-[#4edea3]/30 bg-[#4edea3]/10"
                    : "text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/10"
                }`}
              >
                {qrPresent === undefined
                  ? "PENDING"
                  : !qrPresent
                  ? "NO QR"
                  : qrStatus
                  ? "VERIFIED"
                  : "INVALID"}
              </span>
            </div>

            {/* Description / Content */}
            <div className="text-xs text-[#c3c6d7] space-y-1">
              {qrPresent === undefined ? (
                <p className="text-[#8d90a0]">Execute scan to detect digital cryptographic QR.</p>
              ) : !qrPresent ? (
                <p className="text-[#8d90a0]">No QR code detected in document boundaries.</p>
              ) : (
                <>
                  <p className={qrStatus ? "text-[#4edea3]" : "text-[#ffb4ab]"}>
                    {qrStatus ? "Digital payload signature valid." : "QR payload parsing failed."}
                  </p>
                  {qrWarning && <p className="text-[11px] text-[#ffb95f]">⚠ {qrWarning}</p>}
                </>
              )}
            </div>
          </div>

          <button
            onClick={onVerifyQr}
            disabled={verifyingQr}
            className="w-full text-xs py-1.5 px-2.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] rounded-[4px] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {verifyingQr && <Loader2 size={12} className="animate-spin" />}
            <span>{qrPresent !== undefined ? "Re-scan QR" : "Run QR Check"}</span>
          </button>
        </div>

        {/* Vector 2: Blockchain Ledger */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#d3e4fe] flex items-center gap-1.5">
                <Link2 size={15} className="text-[#38bdf8]" />
                Blockchain Ledger
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] border ${
                  !chainStatus
                    ? "text-[#8d90a0] border-[#1b2b3f] bg-[#102034]"
                    : chainStatus === "verified"
                    ? "text-[#4edea3] border-[#4edea3]/30 bg-[#4edea3]/10"
                    : chainStatus === "not_found"
                    ? "text-[#ffb95f] border-[#ffb95f]/30 bg-[#ffb95f]/10"
                    : "text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/10"
                }`}
              >
                {chainStatus ? chainStatus.toUpperCase() : "PENDING"}
              </span>
            </div>

            <div className="text-xs text-[#c3c6d7] space-y-1">
              {!chainStatus ? (
                <p className="text-[#8d90a0]">Verify document hash against distributed ledger.</p>
              ) : chainStatus === "verified" ? (
                <div>
                  <p className="text-[#4edea3]">Cryptographic hash registered on-chain.</p>
                  {verification?.blockchain_tx_hash && (
                    <p className="text-[10px] font-mono text-[#8d90a0] truncate mt-1">
                      TX: {verification.blockchain_tx_hash.slice(0, 16)}…
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[#ffb95f]">Hash not found or network node unconfigured.</p>
              )}
            </div>
          </div>

          <button
            onClick={onVerifyBlockchain}
            disabled={verifyingChain}
            className="w-full text-xs py-1.5 px-2.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] rounded-[4px] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {verifyingChain && <Loader2 size={12} className="animate-spin" />}
            <span>{chainStatus ? "Re-query Ledger" : "Query Blockchain"}</span>
          </button>
        </div>

        {/* Vector 3: Tampering & Image Forensics */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#d3e4fe] flex items-center gap-1.5">
                <ImageIcon size={15} className="text-[#38bdf8]" />
                Tampering Analysis
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] border ${
                  tamperingScore === undefined
                    ? "text-[#8d90a0] border-[#1b2b3f] bg-[#102034]"
                    : tamperingScore < 30
                    ? "text-[#4edea3] border-[#4edea3]/30 bg-[#4edea3]/10"
                    : tamperingScore < 60
                    ? "text-[#ffb95f] border-[#ffb95f]/30 bg-[#ffb95f]/10"
                    : "text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/10"
                }`}
              >
                {tamperingScore !== undefined
                  ? `${Math.round(tamperingScore)} / 100`
                  : "PENDING"}
              </span>
            </div>

            <div className="text-xs text-[#c3c6d7] space-y-1">
              {tamperingScore === undefined ? (
                <p className="text-[#8d90a0]">ELA, copy-paste, and font anomaly scan.</p>
              ) : (
                <div>
                  <p
                    className={
                      tamperingScore < 30
                        ? "text-[#4edea3]"
                        : tamperingScore < 60
                        ? "text-[#ffb95f]"
                        : "text-[#ffb4ab]"
                    }
                  >
                    {tamperingScore < 30
                      ? "Low tampering risk detected."
                      : tamperingScore < 60
                      ? "Minor visual anomalies detected."
                      : "High probability of image manipulation."}
                  </p>
                  {tamperingDetail && (
                    <button
                      onClick={() => setShowTamperingDetail(!showTamperingDetail)}
                      className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-0.5 mt-1"
                    >
                      {showTamperingDetail ? "Hide sub-signals" : "Show sub-signals"}
                      {showTamperingDetail ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onVerifyTampering}
            disabled={verifyingTampering}
            className="w-full text-xs py-1.5 px-2.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] rounded-[4px] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {verifyingTampering && <Loader2 size={12} className="animate-spin" />}
            <span>{tamperingScore !== undefined ? "Re-run Tampering" : "Run Tampering"}</span>
          </button>
        </div>

        {/* Vector 4: Duplicate & Conflict Detection */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#d3e4fe] flex items-center gap-1.5">
                <Copy size={15} className="text-[#38bdf8]" />
                Duplicate Detection
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] border ${
                  isDuplicate === undefined
                    ? "text-[#8d90a0] border-[#1b2b3f] bg-[#102034]"
                    : !isDuplicate
                    ? "text-[#4edea3] border-[#4edea3]/30 bg-[#4edea3]/10"
                    : "text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/10"
                }`}
              >
                {isDuplicate === undefined
                  ? "PENDING"
                  : !isDuplicate
                  ? "UNIQUE"
                  : "DUPLICATE"}
              </span>
            </div>

            <div className="text-xs text-[#c3c6d7] space-y-1">
              {isDuplicate === undefined ? (
                <p className="text-[#8d90a0]">Check hash, serial & visual dHash across registry.</p>
              ) : (
                <div>
                  <p className={!isDuplicate ? "text-[#4edea3]" : "text-[#ffb4ab]"}>
                    {!isDuplicate
                      ? "No conflicting certificate records."
                      : "Conflict or duplicate detected."}
                  </p>
                  {duplicateDetail && (
                    <button
                      onClick={() => setShowDuplicateDetail(!showDuplicateDetail)}
                      className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-0.5 mt-1"
                    >
                      {showDuplicateDetail ? "Hide details" : "Show details"}
                      {showDuplicateDetail ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onVerifyDuplicate}
            disabled={verifyingDuplicate}
            className="w-full text-xs py-1.5 px-2.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] rounded-[4px] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {verifyingDuplicate && <Loader2 size={12} className="animate-spin" />}
            <span>{isDuplicate !== undefined ? "Re-check Duplicates" : "Check Duplicates"}</span>
          </button>
        </div>
      </div>

      {/* Expanded Tampering Forensic Sub-signals */}
      {showTamperingDetail && tamperingDetail && (
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-2">
            <span className="font-semibold text-[#d3e4fe] font-mono">
              Deep Tampering & Signal Analysis
            </span>
            <span className="text-[#8d90a0]">
              Overall Risk: {verification?.tampering_risk_level || "EVALUATED"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Image Quality */}
            <div className="bg-[#000f21] p-2.5 rounded-[4px] border border-[#1b2b3f]">
              <p className="text-[10px] text-[#8d90a0] uppercase font-mono">Image Quality</p>
              <p className="text-sm font-bold text-[#d3e4fe]">
                {tamperingDetail.image_quality?.score != null
                  ? `${Math.round(tamperingDetail.image_quality.score)}/100`
                  : "—"}
              </p>
              <p className="text-[10px] text-[#8d90a0] mt-0.5">
                {tamperingDetail.image_quality?.status || "Normal"}
              </p>
            </div>

            {/* ELA Compression */}
            <div className="bg-[#000f21] p-2.5 rounded-[4px] border border-[#1b2b3f]">
              <p className="text-[10px] text-[#8d90a0] uppercase font-mono">ELA Compression</p>
              <p className="text-sm font-bold text-[#d3e4fe]">
                {tamperingDetail.ela?.risk != null
                  ? `${Math.round(tamperingDetail.ela.risk)}% Risk`
                  : "—"}
              </p>
              <p className="text-[10px] text-[#8d90a0] mt-0.5">
                {tamperingDetail.ela?.status || "Evaluated"}
              </p>
            </div>

            {/* Copy-Paste Detection */}
            <div className="bg-[#000f21] p-2.5 rounded-[4px] border border-[#1b2b3f]">
              <p className="text-[10px] text-[#8d90a0] uppercase font-mono">Copy-Paste / Clone</p>
              <p className="text-sm font-bold text-[#d3e4fe]">
                {tamperingDetail.copy_paste?.detected ? "DETECTED" : "NONE"}
              </p>
              <p className="text-[10px] text-[#8d90a0] mt-0.5">
                Clusters: {tamperingDetail.copy_paste?.cluster_size ?? 0}
              </p>
            </div>

            {/* Font Consistency */}
            <div className="bg-[#000f21] p-2.5 rounded-[4px] border border-[#1b2b3f]">
              <p className="text-[10px] text-[#8d90a0] uppercase font-mono">Font Consistency</p>
              <p className="text-sm font-bold text-[#d3e4fe]">
                {tamperingDetail.font_consistency?.score != null
                  ? `${Math.round(tamperingDetail.font_consistency.score)}/100`
                  : "—"}
              </p>
              <p className="text-[10px] text-[#8d90a0] mt-0.5">
                {tamperingDetail.font_consistency?.status || "Consistent"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Duplicate Detection Signals */}
      {showDuplicateDetail && duplicateDetail && (
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-2">
            <span className="font-semibold text-[#d3e4fe] font-mono">
              Duplicate & Conflict Sub-signals
            </span>
            <span className="text-[#8d90a0]">Status: {duplicateDetail.duplicate_status}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-[#000f21] rounded border border-[#1b2b3f]">
              <span className="text-[#8d90a0] block text-[10px]">File Hash Match</span>
              <span className="font-mono text-[#d3e4fe]">
                {duplicateDetail.file_hash_match ? "YES (Match)" : "NO"}
              </span>
            </div>
            <div className="p-2 bg-[#000f21] rounded border border-[#1b2b3f]">
              <span className="text-[#8d90a0] block text-[10px]">Certificate Number Match</span>
              <span className="font-mono text-[#d3e4fe]">
                {duplicateDetail.certificate_number_match ? "YES (Match)" : "NO"}
              </span>
            </div>
            <div className="p-2 bg-[#000f21] rounded border border-[#1b2b3f]">
              <span className="text-[#8d90a0] block text-[10px]">Field Similarity</span>
              <span className="font-mono text-[#d3e4fe]">
                {Math.round(duplicateDetail.field_similarity)}%
              </span>
            </div>
            <div className="p-2 bg-[#000f21] rounded border border-[#1b2b3f]">
              <span className="text-[#8d90a0] block text-[10px]">Visual Similarity</span>
              <span className="font-mono text-[#d3e4fe]">
                {Math.round(duplicateDetail.visual_similarity)}%
              </span>
            </div>
          </div>
          {duplicateDetail.reason && (
            <p className="text-[11px] text-[#8d90a0] italic">{duplicateDetail.reason}</p>
          )}
        </div>
      )}
    </div>
  );
};
