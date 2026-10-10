"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldX,
  FileText,
  Download,
  ExternalLink,
  QrCode,
  Link2,
  ShieldAlert,
  Fingerprint,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  Loader2,
  FileCheck,
} from "lucide-react";
import {
  FinalPredictionResponse,
  TrustScoreResponse,
  FraudAnalysisResponse,
  VerificationResultResponse,
  OCRDataResponse,
  DocumentTypeResponse,
  DocumentValidationResponse,
  VerificationReportResponse,
  CertificateResponse,
} from "@/lib/api";

interface CompleteVerificationResultCardProps {
  prediction: FinalPredictionResponse | null;
  trustScore: TrustScoreResponse | null;
  fraud: FraudAnalysisResponse | null;
  verification: VerificationResultResponse | null;
  ocrData: OCRDataResponse | null;
  docType: DocumentTypeResponse | null;
  validation: DocumentValidationResponse | null;
  report: VerificationReportResponse | null;
  cert: CertificateResponse | null;
  onViewReport: () => void;
  onDownloadReport: () => void;
  downloadingReport: boolean;
}

export const CompleteVerificationResultCard: React.FC<CompleteVerificationResultCardProps> = ({
  prediction,
  trustScore,
  fraud,
  verification,
  ocrData,
  docType,
  validation,
  report,
  cert,
  onViewReport,
  onDownloadReport,
  downloadingReport,
}) => {
  if (!prediction) return null;

  const verdict = prediction.label.toLowerCase();

  const getVerdictTheme = () => {
    switch (verdict) {
      case "genuine":
        return {
          badgeBg: "bg-[#4edea3]/15",
          badgeBorder: "border-[#4edea3]/40",
          badgeText: "text-[#4edea3]",
          bannerBg: "bg-[#4edea3]/10",
          border: "border-[#4edea3]/30",
          icon: ShieldCheck,
          label: "GENUINE CERTIFICATE",
          statusText: "Verified Authentic & Tamper-Free",
        };
      case "suspicious":
        return {
          badgeBg: "bg-[#ffb95f]/15",
          badgeBorder: "border-[#ffb95f]/40",
          badgeText: "text-[#ffb95f]",
          bannerBg: "bg-[#ffb95f]/10",
          border: "border-[#ffb95f]/30",
          icon: AlertTriangle,
          label: "SUSPICIOUS / IRREGULAR",
          statusText: "Anomalies Detected — Manual Review Required",
        };
      case "fake":
        return {
          badgeBg: "bg-[#ffb4ab]/15",
          badgeBorder: "border-[#ffb4ab]/40",
          badgeText: "text-[#ffb4ab]",
          bannerBg: "bg-[#ffb4ab]/10",
          border: "border-[#ffb4ab]/30",
          icon: ShieldX,
          label: "FORGERY / COUNTERFEIT",
          statusText: "Evidence of Tampering or Discrepancy",
        };
      default:
        return {
          badgeBg: "bg-[#8d90a0]/15",
          badgeBorder: "border-[#8d90a0]/40",
          badgeText: "text-[#c3c6d7]",
          bannerBg: "bg-[#8d90a0]/10",
          border: "border-[#8d90a0]/30",
          icon: ShieldAlert,
          label: "VERIFICATION COMPLETED",
          statusText: "Analysis finalized",
        };
    }
  };

  const theme = getVerdictTheme();
  const VerdictIcon = theme.icon;

  // Real document type formatted
  const certificateType =
    docType?.predicted_type ||
    validation?.document_type?.replace(/_/g, " ") ||
    "Academic Credential";

  // Exact real metrics
  const predictionConfidence = Math.round(prediction.confidence_score * 100);
  const trustScoreValue = trustScore?.score !== undefined ? `${trustScore.score}/100` : null;
  const fraudProbabilityValue =
    fraud?.fraud_probability !== undefined
      ? `${(fraud.fraud_probability * 100).toFixed(1)}%`
      : prediction.fraud_probability !== undefined
      ? `${(prediction.fraud_probability * 100).toFixed(1)}%`
      : null;
  const ocrAccuracyValue =
    ocrData?.ocr_accuracy !== undefined ? `${Math.round(ocrData.ocr_accuracy * 100)}%` : null;

  // 4-Vector Findings with semantic correctness: NOT_DETECTED != INVALID, UNAVAILABLE != FAILED
  const qrStatus = verification?.evidence?.qr?.status || (verification?.verification_summary?.qr_checked ? "CHECKED" : "UNAVAILABLE");
  const blockchainStatus = verification?.evidence?.blockchain?.status || (verification?.verification_summary?.blockchain_checked ? "CHECKED" : "NOT_REGISTERED");
  const tamperingStatus =
    verification?.evidence?.tampering?.status === "CLEAN" || verification?.evidence?.tampering?.status === "PASS"
      ? "NOT_DETECTED"
      : verification?.evidence?.tampering?.status || "UNAVAILABLE";
  const duplicateStatus =
    verification?.evidence?.duplicate?.status === "UNIQUE" || verification?.evidence?.duplicate?.status === "NO_DUPLICATE" || verification?.evidence?.duplicate?.status === "PASS"
      ? "NOT_DETECTED"
      : verification?.evidence?.duplicate?.status || "UNAVAILABLE";

  return (
    <section 
      aria-label="Complete Certificate Verification Result"
      className={`bg-[#0b1c30] border ${theme.border} rounded-[8px] p-6 shadow-2xl space-y-6 relative overflow-hidden`}
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-[6px] ${theme.badgeBg} ${theme.badgeBorder} border shrink-0`}>
            <VerdictIcon size={24} className={theme.badgeText} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#d3e4fe]">
                VERIFICATION RESULT
              </span>
              <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[11px] font-bold border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}>
                ✓ {theme.label}
              </span>
            </div>
            <p className="text-xs text-[#8d90a0] font-mono mt-0.5">
              Certificate Type: <span className="text-[#d3e4fe] font-sans font-semibold capitalize">{certificateType}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {report && (
            <button
              onClick={onDownloadReport}
              disabled={downloadingReport}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              title="Download authenticated PDF verification report"
            >
              {downloadingReport ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>{downloadingReport ? "Downloading..." : "Download Report"}</span>
            </button>
          )}

          <button
            onClick={onViewReport}
            className="px-3 py-1.5 text-xs font-medium bg-[#102034] hover:bg-[#1b2b3f] text-[#c3c6d7] hover:text-[#d3e4fe] rounded-[4px] border border-[#1b2b3f] transition flex items-center gap-1.5"
          >
            <FileText size={13} className="text-[#38bdf8]" />
            <span>View Full Report</span>
          </button>
        </div>
      </div>

      {/* Core AI Verdict Explanation */}
      <div className={`p-4 rounded-[6px] ${theme.bannerBg} border ${theme.border} space-y-2`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#d3e4fe] flex items-center gap-1.5">
            <CheckCircle2 size={14} className={theme.badgeText} />
            {theme.statusText}
          </span>
          {prediction.recommended_action && (
            <span className="text-[11px] font-mono text-[#8d90a0]">
              Action: <span className="text-[#d3e4fe]">{prediction.recommended_action}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-[#c3c6d7] leading-relaxed">
          {prediction.explanation}
        </p>
      </div>

      {/* Exact Core Metrics Grid (No fake accuracy formulas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            Prediction Confidence
          </span>
          <span className="text-xl font-mono font-bold text-[#d3e4fe]">
            {predictionConfidence}%
          </span>
        </div>

        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            Trust Score
          </span>
          <span className="text-xl font-mono font-bold text-[#4edea3]">
            {trustScoreValue || "N/A"}
          </span>
        </div>

        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            Fraud Probability
          </span>
          <span className="text-xl font-mono font-bold text-[#ffb95f]">
            {fraudProbabilityValue || "N/A"}
          </span>
        </div>

        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            OCR Confidence
          </span>
          <span className="text-xl font-mono font-bold text-[#38bdf8]">
            {ocrAccuracyValue || "N/A"}
          </span>
        </div>
      </div>

      {/* 4-Vector Evidence Findings Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Layers size={13} className="text-[#38bdf8]" />
          Verification Evidence Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* QR Code */}
          <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
            <span className="text-[10px] font-mono text-[#8d90a0] uppercase flex items-center gap-1">
              <QrCode size={11} className="text-[#38bdf8]" />
              QR Verification
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <span className={`text-xs font-mono font-semibold ${
                qrStatus === "VERIFIED" || qrStatus === "PASS"
                  ? "text-[#4edea3]"
                  : qrStatus === "NOT_FOUND"
                  ? "text-[#ffb95f]"
                  : "text-[#8d90a0]"
              }`}>
                {qrStatus === "VERIFIED" ? "Verified" : qrStatus === "NOT_FOUND" ? "Not Present" : qrStatus}
              </span>
            </div>
          </div>

          {/* Blockchain */}
          <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
            <span className="text-[10px] font-mono text-[#8d90a0] uppercase flex items-center gap-1">
              <Link2 size={11} className="text-[#4edea3]" />
              Blockchain Proof
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <span className={`text-xs font-mono font-semibold ${
                blockchainStatus === "VERIFIED" || blockchainStatus === "MATCH"
                  ? "text-[#4edea3]"
                  : "text-[#8d90a0]"
              }`}>
                {blockchainStatus === "VERIFIED" ? "Verified" : "Not Registered"}
              </span>
            </div>
          </div>

          {/* Tampering */}
          <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
            <span className="text-[10px] font-mono text-[#8d90a0] uppercase flex items-center gap-1">
              <ShieldAlert size={11} className="text-[#ffb95f]" />
              Tampering Scan
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <span className={`text-xs font-mono font-semibold ${
                tamperingStatus === "NOT_DETECTED"
                  ? "text-[#4edea3]"
                  : tamperingStatus === "TAMPERED"
                  ? "text-[#ffb4ab]"
                  : "text-[#8d90a0]"
              }`}>
                {tamperingStatus === "NOT_DETECTED" ? "Not Detected" : tamperingStatus}
              </span>
            </div>
          </div>

          {/* Duplicate */}
          <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 space-y-1">
            <span className="text-[10px] font-mono text-[#8d90a0] uppercase flex items-center gap-1">
              <Fingerprint size={11} className="text-[#38bdf8]" />
              Duplicate Check
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <span className={`text-xs font-mono font-semibold ${
                duplicateStatus === "NOT_DETECTED"
                  ? "text-[#4edea3]"
                  : duplicateStatus === "DUPLICATE"
                  ? "text-[#ffb4ab]"
                  : "text-[#8d90a0]"
              }`}>
                {duplicateStatus === "NOT_DETECTED" ? "Not Detected" : duplicateStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Certificate Fields Summary (Filtered from internal metadata keys) */}
      {ocrData && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#38bdf8]" />
            Verified Certificate Fields
          </h3>

          <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {ocrData.student_name && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8d90a0] block">Student Name</span>
                <span className="font-medium text-[#d3e4fe]">{ocrData.student_name}</span>
              </div>
            )}
            {ocrData.university_name && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8d90a0] block">University / Authority</span>
                <span className="font-medium text-[#d3e4fe]">{ocrData.university_name}</span>
              </div>
            )}
            {(ocrData.register_number || ocrData.roll_number) && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8d90a0] block">Registration / Roll No</span>
                <span className="font-mono text-[#d3e4fe]">{ocrData.register_number || ocrData.roll_number}</span>
              </div>
            )}
            {ocrData.date_of_issue && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8d90a0] block">Date of Issue</span>
                <span className="font-mono text-[#d3e4fe]">{ocrData.date_of_issue}</span>
              </div>
            )}
            {(ocrData.cgpa || ocrData.percentage) && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8d90a0] block">Academic Score</span>
                <span className="font-mono text-[#d3e4fe]">
                  {[ocrData.cgpa ? `CGPA: ${ocrData.cgpa}` : null, ocrData.percentage ? `${ocrData.percentage}%` : null].filter(Boolean).join(" • ")}
                </span>
              </div>
            )}
            {cert?.original_filename && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8d90a0] block">Ingested File</span>
                <span className="text-[#c3c6d7] truncate block">{cert.original_filename}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer Controls */}
      <div className="pt-3 border-t border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/certificates"
            className="text-xs text-[#8d90a0] hover:text-[#d3e4fe] transition flex items-center gap-1 font-mono"
          >
            <span>← Certificate Registry</span>
          </Link>
          <span className="text-[#1b2b3f]">|</span>
          <Link
            href="/dashboard"
            className="text-xs text-[#8d90a0] hover:text-[#d3e4fe] transition font-mono"
          >
            Dashboard Overview
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {report ? (
            <span className="text-[11px] font-mono text-[#4edea3] flex items-center gap-1">
              <FileCheck size={12} />
              Dossier Ready ({report.verification_id})
            </span>
          ) : (
            <span className="text-[11px] font-mono text-[#8d90a0]">
              Report generation ready
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
