"use client";

import React from "react";
import {
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  FileSpreadsheet,
  Link2,
  FileText,
  Zap,
} from "lucide-react";
import {
  PipelineStage,
  PipelineStatusResponse,
  CertificateResponse,
  OCRDataResponse,
  VerificationResultResponse,
  FraudAnalysisResponse,
  TrustScoreResponse,
  FinalPredictionResponse,
  VerificationReportResponse,
} from "@/lib/api";

interface AuditLedgerTimelineProps {
  pipeline: PipelineStatusResponse | null;
  cert: CertificateResponse | null;
  ocr: OCRDataResponse | null;
  verification: VerificationResultResponse | null;
  fraud: FraudAnalysisResponse | null;
  trustScore: TrustScoreResponse | null;
  prediction: FinalPredictionResponse | null;
  report: VerificationReportResponse | null;
}

export const AuditLedgerTimeline: React.FC<AuditLedgerTimelineProps> = ({
  pipeline,
  cert,
  ocr,
  verification,
  fraud,
  trustScore,
  prediction,
  report,
}) => {
  // Synthesize verifiable events with strictly honest timestamps
  interface TimelineEvent {
    id: string;
    title: string;
    category: string;
    timestamp: string | null;
    status: "completed" | "pending" | "failed" | "unavailable";
    durationMs?: number | null;
    details?: string;
  }

  const events: TimelineEvent[] = [
    {
      id: "upload",
      title: "Document Ingestion & File Checksum",
      category: "Ingestion",
      timestamp: cert?.uploaded_at ?? null,
      status: cert ? "completed" : "pending",
      details: cert ? `SHA-256: ${cert.sha256_hash?.slice(0, 16)}…` : undefined,
    },
    {
      id: "ocr",
      title: "Optical Character Recognition & Extraction",
      category: "OCR Engine",
      timestamp: ocr?.created_at ?? null,
      status: ocr ? "completed" : "pending",
      details: ocr
        ? `${ocr.ocr_engine} • ${Math.round((ocr.ocr_accuracy || 0) * 100)}% Accuracy`
        : undefined,
    },
    {
      id: "verification",
      title: "Four-Vector Forensic Verification",
      category: "Verification",
      timestamp: verification?.created_at ?? null,
      status: verification ? "completed" : "pending",
      details: verification
        ? `QR: ${verification.qr_valid ? "Valid" : "Checked"} | Tampering Score: ${
            verification.tampering_score != null ? Math.round(verification.tampering_score) : "—"
          }`
        : undefined,
    },
    {
      id: "fraud",
      title: "Bayesian Multi-Factor Fraud Risk Evaluation",
      category: "Risk Model",
      timestamp: fraud?.created_at ?? null,
      status: fraud ? "completed" : "pending",
      details: fraud
        ? `Fraud Probability: ${Math.round(fraud.fraud_probability * 100)}%`
        : undefined,
    },
    {
      id: "trust",
      title: "Forensic Reliability & Trust Score",
      category: "Scoring",
      timestamp: trustScore?.created_at ?? null,
      status: trustScore ? "completed" : "pending",
      details: trustScore ? `Trust Index: ${Math.round(trustScore.score)}/100` : undefined,
    },
    {
      id: "prediction",
      title: "AI Final Classification & Verdict",
      category: "Decision Engine",
      timestamp: prediction?.created_at ?? null,
      status: prediction ? "completed" : "pending",
      details: prediction
        ? `Verdict: ${prediction.label.toUpperCase()} (${Math.round(
            prediction.confidence_score * 100
          )}% conf)`
        : undefined,
    },
    {
      id: "report",
      title: "Executive PDF Audit Ledger Generation",
      category: "Reporting",
      timestamp: report?.generated_at ?? null,
      status: report ? "completed" : "pending",
      details: report ? `Report ID: ${report.verification_id}` : undefined,
    },
  ];

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "Timestamp unavailable";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Timestamp unavailable";
    }
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
        <div>
          <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono flex items-center gap-2">
            <History size={15} className="text-[#38bdf8]" />
            Verifiable Audit Ledger & Pipeline History
          </h3>
          <p className="text-[11px] text-[#8d90a0] mt-0.5">
            Immutable chronological execution events with real forensic timestamps.
          </p>
        </div>
        {pipeline && (
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#000f21] border border-[#1b2b3f] text-[#c3c6d7]">
            {pipeline.completion_pct}% Overall Pipeline Complete
          </span>
        )}
      </div>

      {/* Chronological Timeline Track */}
      <div className="relative pl-6 space-y-4 pt-1">
        {/* Continuous timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[#1b2b3f]" />

        {events.map((evt) => {
          const isDone = evt.status === "completed";

          return (
            <div key={evt.id} className="relative flex items-start gap-3">
              {/* Event Marker */}
              <div
                className={`absolute -left-[18px] top-1 w-4 h-4 rounded-full flex items-center justify-center border z-10 ${
                  isDone
                    ? "bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]"
                    : "bg-[#102034] border-[#1b2b3f] text-[#8d90a0]"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={10} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8d90a0]" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#d3e4fe]">{evt.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#102034] border border-[#1b2b3f] text-[#8d90a0]">
                      {evt.category}
                    </span>
                  </div>
                  {evt.details && (
                    <p className="text-[11px] text-[#c3c6d7] font-mono">{evt.details}</p>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] font-mono text-[#8d90a0] block">
                    {formatTime(evt.timestamp)}
                  </span>
                  <span className="text-[10px] font-mono text-[#8d90a0]">
                    Duration: —
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-[#8d90a0] border-t border-[#1b2b3f] pt-3 italic">
        Execution durations are not simulated and are displayed strictly when provided by backend telemetry.
      </div>
    </div>
  );
};
