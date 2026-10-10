"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Key,
  FileCheck,
  AlertTriangle,
  Copy,
  Check,
  QrCode,
  Link2,
  ShieldAlert,
  ShieldX,
  Sparkles,
  Layers,
  Fingerprint,
} from "lucide-react";
import {
  VerificationReportResponse,
  FinalPredictionResponse,
  CertificateResponse,
  VerificationResultResponse,
  FraudAnalysisResponse,
  TrustScoreResponse,
  OCRDataResponse,
} from "@/lib/api";
import { CertiVerifyLogo } from "@/components/ui/CertiVerifyLogo";

interface VerificationReportPanelProps {
  report: VerificationReportResponse | null;
  prediction: FinalPredictionResponse | null;
  cert?: CertificateResponse | null;
  verification?: VerificationResultResponse | null;
  fraud?: FraudAnalysisResponse | null;
  trustScore?: TrustScoreResponse | null;
  ocrData?: OCRDataResponse | null;
  onGenerateReport: () => void;
  onDownloadReport: () => void;
  generatingReport: boolean;
  downloadingReport: boolean;
}

export const VerificationReportPanel: React.FC<VerificationReportPanelProps> = ({
  report,
  prediction,
  cert,
  verification,
  fraud,
  trustScore,
  ocrData,
  onGenerateReport,
  onDownloadReport,
  generatingReport,
  downloadingReport,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);

  const handlePrint = async () => {
    await onDownloadReport();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const copyToClipboard = (text: string, type: "hash" | "sig") => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "hash") {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      } else {
        setCopiedSig(true);
        setTimeout(() => setCopiedSig(false), 2000);
      }
    }
  };

  const verdict = prediction?.label?.toLowerCase() ?? "pending";
  const getVerdictBadge = () => {
    switch (verdict) {
      case "genuine":
        return {
          bg: "bg-[#4edea3]/10",
          border: "border-[#4edea3]/30",
          text: "text-[#4edea3]",
          icon: ShieldCheck,
          label: "GENUINE CREDENTIAL",
        };
      case "suspicious":
        return {
          bg: "bg-[#ffb95f]/10",
          border: "border-[#ffb95f]/30",
          text: "text-[#ffb95f]",
          icon: AlertTriangle,
          label: "SUSPICIOUS / IRREGULAR",
        };
      case "fake":
        return {
          bg: "bg-[#ffb4ab]/10",
          border: "border-[#ffb4ab]/30",
          text: "text-[#ffb4ab]",
          icon: ShieldX,
          label: "COUNTERFEIT / FAKE",
        };
      default:
        return {
          bg: "bg-[#8d90a0]/10",
          border: "border-[#8d90a0]/30",
          text: "text-[#c3c6d7]",
          icon: ShieldAlert,
          label: "VERIFICATION PENDING",
        };
    }
  };

  const vBadge = getVerdictBadge();
  const VIcon = vBadge.icon;

  const score = trustScore?.score ?? (prediction?.confidence_score ? Math.round(prediction.confidence_score * 100) : null);
  const fraudProb = fraud?.fraud_probability !== undefined 
    ? (fraud.fraud_probability * 100).toFixed(1)
    : prediction?.fraud_probability !== undefined 
      ? (prediction.fraud_probability * 100).toFixed(1)
      : null;

  return (
    <div id="verification-report-section" className="verification-report-panel relative bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden shadow-xl space-y-6 p-6">
      {/* Confidential Watermark Layer */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025] overflow-hidden"
        aria-hidden="true"
      >
        <span className="text-6xl md:text-8xl font-mono font-black rotate-[-25deg] tracking-[0.2em] text-[#d3e4fe] whitespace-nowrap">
          CONFIDENTIAL // VERIFICATION DOSSIER
        </span>
      </div>

      {/* Top Action & Authority Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-3">
          <CertiVerifyLogo variant="compact" size="md" showTagline={true} />
          <div className="h-8 w-px bg-[#1b2b3f] hidden sm:block" />
          <div className="space-y-0.5 hidden sm:block">
            <span className="px-2 py-0.5 rounded-[2px] bg-[#2563eb]/20 text-[#38bdf8] border border-[#2563eb]/30 text-[10px] font-mono font-semibold tracking-wider uppercase block w-fit">
              Official Forensic Dossier
            </span>
            <span className="text-[10px] font-mono text-[#8d90a0] block">
              ISO/IEC 27001 & Cryptographic Audit Standard
            </span>
          </div>
        </div>

        {/* Global Export & Generation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {report && (
            <button
              onClick={onGenerateReport}
              disabled={generatingReport}
              className="px-3 py-1.5 text-xs font-medium bg-[#102034] hover:bg-[#1b2b3f] text-[#c3c6d7] hover:text-[#d3e4fe] rounded-[4px] border border-[#1b2b3f] transition flex items-center gap-1.5 disabled:opacity-50"
              title="Regenerate report with latest verification telemetry"
            >
              <RefreshCw
                size={12}
                className={generatingReport ? "animate-spin text-[#38bdf8]" : "text-[#8d90a0]"}
              />
              <span>{generatingReport ? "Recompiling..." : "Regenerate"}</span>
            </button>
          )}

          <button
            onClick={onGenerateReport}
            disabled={generatingReport}
            className="px-4 py-1.5 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {generatingReport ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <FileCheck size={13} />
            )}
            <span>{generatingReport ? "Compiling PDF..." : report ? "Re-issue PDF" : "Generate Report"}</span>
          </button>

          {report && (
            <>
              <button
                onClick={onDownloadReport}
                disabled={downloadingReport}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                title="Download authenticated PDF verification report"
              >
                {downloadingReport ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                <span>{downloadingReport ? "Downloading..." : "Download PDF"}</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Verification Report link copied to clipboard!");
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] rounded-[4px] border border-[#38bdf8]/30 transition flex items-center gap-1.5"
                title="Share Verification Report Link"
              >
                <Link2 size={13} />
                <span>Share Report</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={downloadingReport}
                className="px-3 py-1.5 text-xs font-medium bg-[#102034] hover:bg-[#1b2b3f] text-[#c3c6d7] hover:text-[#d3e4fe] rounded-[4px] border border-[#1b2b3f] transition flex items-center gap-1.5 disabled:opacity-50"
                title="Print Audit Report"
              >
                <Printer size={13} className="text-[#8d90a0]" />
                <span>Print</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Report Body */}
      {!report ? (
        <div className="relative z-10 bg-[#000f21] border border-dashed border-[#1b2b3f] rounded-[6px] p-8 text-center space-y-4">
          <FileText size={40} className="text-[#8d90a0] mx-auto opacity-30" />
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-[#d3e4fe]">
              Official Verification Dossier Not Yet Compiled
            </h3>
            <p className="text-xs text-[#8d90a0] leading-relaxed">
              Synthesize OCR extraction, QR decode, blockchain proofs, OpenCV Error Level Analysis,
              and machine learning fraud predictions into an officially stamped and signed PDF report.
            </p>
          </div>
          <button
            onClick={onGenerateReport}
            disabled={generatingReport}
            className="px-5 py-2 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] transition inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {generatingReport ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileCheck size={14} />
            )}
            <span>{generatingReport ? "Compiling Dossier..." : "Generate Verification Report"}</span>
          </button>
        </div>
      ) : (
        <div className="relative z-10 space-y-6">
          {/* Metadata Matrix & Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
                Verification ID
              </span>
              <div className="text-xs font-mono font-bold text-[#d3e4fe] truncate">
                {report.verification_id}
              </div>
            </div>

            <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
                Document File
              </span>
              <div className="text-xs font-sans font-medium text-[#d3e4fe] truncate" title={cert?.original_filename}>
                {cert?.original_filename || "Certificate Document"}
              </div>
            </div>

            <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
                Issue / Audit Timestamp
              </span>
              <div className="text-xs font-mono text-[#c3c6d7] flex items-center gap-1 truncate">
                <Calendar size={11} className="text-[#38bdf8] shrink-0" />
                <span>{new Date(report.generated_at).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
                Document SHA-256 Hash
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-mono text-[#c3c6d7] truncate">
                  {cert?.sha256_hash ? `${cert.sha256_hash.slice(0, 14)}…` : "Not computed"}
                </span>
                {cert?.sha256_hash && (
                  <button
                    onClick={() => copyToClipboard(cert.sha256_hash, "hash")}
                    className="p-1 hover:text-[#d3e4fe] text-[#8d90a0] transition"
                    title="Copy SHA-256 hash"
                  >
                    {copiedHash ? <Check size={11} className="text-[#4edea3]" /> : <Copy size={11} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Executive Verdict & Telemetry Banner */}
          <div className="bg-[#102034] border border-[#1b2b3f] rounded-[6px] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`p-2.5 rounded-[6px] ${vBadge.bg} ${vBadge.border} border shrink-0`}>
                <VIcon size={24} className={vBadge.text} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-[2px] ${vBadge.bg} ${vBadge.border} border text-[11px] font-mono font-bold ${vBadge.text}`}>
                    {vBadge.label}
                  </span>
                  <span className="text-xs text-[#8d90a0]">
                    AI Algorithmic Verdict
                  </span>
                </div>
                <p className="text-xs text-[#c3c6d7] leading-relaxed max-w-xl">
                  {prediction?.explanation || "Algorithmic decision compiled from multi-vector verification, forensic texture analysis, and cryptographic record check."}
                </p>
              </div>
            </div>

            {/* Score Pill Cluster */}
            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1b2b3f]">
              <div className="text-right px-3 py-1.5 bg-[#000f21] rounded-[4px] border border-[#1b2b3f]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
                  Trust Score
                </span>
                <span className="text-sm font-mono font-bold text-[#4edea3]">
                  {score !== null ? `${score}/100` : "N/A"}
                </span>
              </div>

              <div className="text-right px-3 py-1.5 bg-[#000f21] rounded-[4px] border border-[#1b2b3f]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
                  Fraud Risk
                </span>
                <span className="text-sm font-mono font-bold text-[#ffb95f]">
                  {fraudProb !== null ? `${fraudProb}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Findings (4-Vector Quadrant Summary) */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers size={13} className="text-[#38bdf8]" />
              Multi-Vector Forensic Findings Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* QR Vector */}
              <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#c3c6d7] flex items-center gap-1">
                    <QrCode size={13} className="text-[#38bdf8]" />
                    QR Verification
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] ${
                    verification?.evidence?.qr?.status === "PASS" || verification?.evidence?.qr?.status === "VERIFIED"
                      ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                      : verification?.evidence?.qr?.status === "NOT_FOUND"
                      ? "bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/30"
                      : "bg-[#8d90a0]/10 text-[#8d90a0] border border-[#8d90a0]/30"
                  }`}>
                    {verification?.evidence?.qr?.status || (verification?.verification_summary?.qr_checked ? "CHECKED" : "UNAVAILABLE")}
                  </span>
                </div>
                <p className="text-[11px] text-[#8d90a0] leading-snug">
                  {verification?.evidence?.qr?.label || "QR code structure and embedded cryptographic payload."}
                </p>
              </div>

              {/* Blockchain Vector */}
              <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#c3c6d7] flex items-center gap-1">
                    <Link2 size={13} className="text-[#4edea3]" />
                    Blockchain Proof
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] ${
                    verification?.evidence?.blockchain?.status === "VERIFIED" || verification?.evidence?.blockchain?.status === "MATCH"
                      ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                      : "bg-[#8d90a0]/10 text-[#8d90a0] border border-[#8d90a0]/30"
                  }`}>
                    {verification?.evidence?.blockchain?.status || (verification?.verification_summary?.blockchain_checked ? "CHECKED" : "UNAVAILABLE")}
                  </span>
                </div>
                <p className="text-[11px] text-[#8d90a0] leading-snug">
                  {verification?.evidence?.blockchain?.label || "On-chain transaction proof and smart contract hash ledger."}
                </p>
              </div>

              {/* Tampering / ELA Vector */}
              <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#c3c6d7] flex items-center gap-1">
                    <ShieldAlert size={13} className="text-[#ffb95f]" />
                    ELA Tamper Scan
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] ${
                    verification?.evidence?.tampering?.status === "CLEAN" || verification?.evidence?.tampering?.status === "PASS"
                      ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                      : verification?.evidence?.tampering?.status === "TAMPERED" || verification?.evidence?.tampering?.status === "FAIL"
                      ? "bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30"
                      : "bg-[#8d90a0]/10 text-[#8d90a0] border border-[#8d90a0]/30"
                  }`}>
                    {verification?.evidence?.tampering?.status || (verification?.verification_summary?.tampering_checked ? "CHECKED" : "UNAVAILABLE")}
                  </span>
                </div>
                <p className="text-[11px] text-[#8d90a0] leading-snug">
                  {verification?.evidence?.tampering?.label || "Error Level Analysis compression variance detector."}
                </p>
              </div>

              {/* Duplicate Detection Vector */}
              <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#c3c6d7] flex items-center gap-1">
                    <Fingerprint size={13} className="text-[#38bdf8]" />
                    Duplicate Collision
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] ${
                    verification?.evidence?.duplicate?.status === "UNIQUE" || verification?.evidence?.duplicate?.status === "NO_DUPLICATE" || verification?.evidence?.duplicate?.status === "PASS"
                      ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                      : verification?.evidence?.duplicate?.status === "DUPLICATE"
                      ? "bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30"
                      : "bg-[#8d90a0]/10 text-[#8d90a0] border border-[#8d90a0]/30"
                  }`}>
                    {verification?.evidence?.duplicate?.status || (verification?.verification_summary?.duplicate_checked ? "CHECKED" : "UNAVAILABLE")}
                  </span>
                </div>
                <p className="text-[11px] text-[#8d90a0] leading-snug">
                  {verification?.evidence?.duplicate?.label || "Registry database duplicate certificate collision check."}
                </p>
              </div>
            </div>
          </div>

          {/* Key Extracted OCR Metadata Section */}
          {ocrData && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#38bdf8]" />
                Extracted Identity & Academic Fields
              </h3>

              <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#102034] text-[#8d90a0] border-b border-[#1b2b3f] font-mono text-[10px] uppercase">
                    <tr>
                      <th className="px-3.5 py-2 font-medium">Target Field</th>
                      <th className="px-3.5 py-2 font-medium">Extracted Value</th>
                      <th className="px-3.5 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2b3f] text-[#c3c6d7]">
                    <tr>
                      <td className="px-3.5 py-2 text-[#8d90a0]">Student Name</td>
                      <td className="px-3.5 py-2 font-medium text-[#d3e4fe]">{ocrData.student_name || "Not detected"}</td>
                      <td className="px-3.5 py-2 font-mono text-[10px] text-[#4edea3]">
                        {ocrData.student_name ? "EXTRACTED" : "UNAVAILABLE"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 text-[#8d90a0]">University / Authority</td>
                      <td className="px-3.5 py-2 font-medium text-[#d3e4fe]">{ocrData.university_name || "Not detected"}</td>
                      <td className="px-3.5 py-2 font-mono text-[10px] text-[#4edea3]">
                        {ocrData.university_name ? "EXTRACTED" : "UNAVAILABLE"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 text-[#8d90a0]">Registration / Roll No</td>
                      <td className="px-3.5 py-2 font-mono text-[#d3e4fe]">
                        {ocrData.register_number || ocrData.roll_number || "Not detected"}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-[10px] text-[#4edea3]">
                        {(ocrData.register_number || ocrData.roll_number) ? "EXTRACTED" : "UNAVAILABLE"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 text-[#8d90a0]">Issue Date / Score</td>
                      <td className="px-3.5 py-2 text-[#d3e4fe]">
                        {[ocrData.date_of_issue, ocrData.cgpa ? `CGPA: ${ocrData.cgpa}` : null, ocrData.percentage ? `${ocrData.percentage}%` : null].filter(Boolean).join(" • ") || "Not detected"}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-[10px] text-[#4edea3]">
                        {ocrData.date_of_issue ? "EXTRACTED" : "UNAVAILABLE"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cryptographic Digital Signature Block */}
          {report.digital_signature && (
            <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#d3e4fe] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Key size={13} className="text-[#ffb95f]" />
                  Cryptographic Digital Signature Seal
                </span>
                <button
                  onClick={() => copyToClipboard(report.digital_signature!, "sig")}
                  className="px-2 py-0.5 rounded-[2px] bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-[11px] font-mono text-[#c3c6d7] hover:text-[#d3e4fe] transition flex items-center gap-1"
                  title="Copy full cryptographic signature"
                >
                  {copiedSig ? <Check size={11} className="text-[#4edea3]" /> : <Copy size={11} />}
                  <span>{copiedSig ? "Copied" : "Copy Signature"}</span>
                </button>
              </div>

              <div className="p-2.5 bg-[#0b1c30] rounded-[4px] border border-[#1b2b3f] font-mono text-[11px] text-[#4edea3] break-all select-all leading-relaxed">
                {report.digital_signature}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8d90a0]">
                <span>Algorithm: SHA-256 with Asymmetric RSA/ECDSA Signature</span>
                <span className="flex items-center gap-1 text-[#4edea3]">
                  <CheckCircle2 size={11} /> Cryptographically Valid
                </span>
              </div>
            </div>
          )}

          {/* Legal & Forensic Disclaimer Footer */}
          <div className="pt-3 border-t border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-[#8d90a0]">
            <span>CertiVerify AI Automated Verification Engine • Tamper-evident forensic audit dossier.</span>
            <span>Document ID: {report.id}</span>
          </div>
        </div>
      )}
    </div>
  );
};
