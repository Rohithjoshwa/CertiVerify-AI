"use client";

import React from "react";
import {
  ListChecks,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Activity,
  Gauge,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  FinalPredictionResponse,
  EvidenceBreakdown,
  FraudAnalysisResponse,
  TrustScoreResponse,
} from "@/lib/api";

const FORENSIC_FACTORS: Array<{ key: keyof EvidenceBreakdown; label: string }> = [
  { key: "ocr", label: "OCR Extraction Quality" },
  { key: "classification", label: "Document Classification" },
  { key: "field_extraction", label: "Field Schema Integrity" },
  { key: "comparison", label: "Multi-Document Consistency" },
  { key: "qr", label: "Digital QR Cryptography" },
  { key: "blockchain", label: "Distributed Ledger Proof" },
  { key: "tampering", label: "Pixel & ELA Tampering" },
  { key: "duplicate", label: "Registry Duplicate Match" },
  { key: "metadata", label: "File Metadata Integrity" },
];

interface AiEvidencePanelProps {
  prediction: FinalPredictionResponse | null;
  fraud: FraudAnalysisResponse | null;
  trustScore: TrustScoreResponse | null;
}

export const AiEvidencePanel: React.FC<AiEvidencePanelProps> = ({
  prediction,
  fraud,
  trustScore,
}) => {
  const evidence = prediction?.evidence;
  const reasons = prediction?.reasons ?? [];

  const getStatusConfig = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (["PASS", "VERIFIED", "MATCH", "NOT_FOUND", "LOW_RISK", "CLEAN"].includes(s)) {
      return {
        color: "text-[#4edea3]",
        bg: "bg-[#4edea3]/10 border-[#4edea3]/20",
        icon: CheckCircle2,
      };
    }
    if (["WARN", "NOT_REGISTERED", "MEDIUM_RISK", "FLAGGED"].includes(s)) {
      return {
        color: "text-[#ffb95f]",
        bg: "bg-[#ffb95f]/10 border-[#ffb95f]/20",
        icon: AlertTriangle,
      };
    }
    if (["FAIL", "INVALID", "MISMATCH", "HIGH_RISK", "DUPLICATE"].includes(s)) {
      return {
        color: "text-[#ffb4ab]",
        bg: "bg-[#ffb4ab]/10 border-[#ffb4ab]/20",
        icon: XCircle,
      };
    }
    return {
      color: "text-[#8d90a0]",
      bg: "bg-[#102034] border-[#1b2b3f]",
      icon: HelpCircle,
    };
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1b2b3f]">
        <div>
          <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono flex items-center gap-2">
            <ListChecks size={15} className="text-[#38bdf8]" />
            AI Evidence Matrix & Synthesis
          </h3>
          <p className="text-[11px] text-[#8d90a0] mt-0.5">
            Holistic cross-evaluation of forensic telemetry, Bayesian risk weights, and decision rules.
          </p>
        </div>
        {fraud?.fraud_probability != null && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8d90a0]">Statistical Risk:</span>
            <span
              className={`font-mono font-bold ${
                fraud.fraud_probability < 0.3
                  ? "text-[#4edea3]"
                  : fraud.fraud_probability < 0.6
                  ? "text-[#ffb95f]"
                  : "text-[#ffb4ab]"
              }`}
            >
              {Math.round(fraud.fraud_probability * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Grid of Forensic Evidence Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {FORENSIC_FACTORS.map(({ key, label }) => {
          const factor = evidence ? evidence[key] : undefined;
          const status = factor?.display_status || factor?.status || "UNAVAILABLE";
          const score = factor?.score != null ? `${Math.round(factor.score as number)}%` : null;
          const cfg = getStatusConfig(status);
          const Icon = cfg.icon;

          return (
            <div
              key={key}
              className={`flex items-center justify-between rounded-[6px] px-3 py-2 border transition ${cfg.bg}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={13} className={`${cfg.color} shrink-0`} />
                <span className="text-xs text-[#c3c6d7] truncate">{label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {score && <span className="text-[11px] font-mono text-[#8d90a0]">{score}</span>}
                <span className={`text-[10px] font-mono font-semibold uppercase ${cfg.color}`}>
                  {status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Score Factor Contributions & Fraud Weights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#1b2b3f]">
        {/* Factor Trust Contributions */}
        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#d3e4fe] flex items-center gap-1.5">
              <Activity size={12} className="text-[#38bdf8]" /> Trust Factor Breakdown
            </span>
            <span className="text-[10px] text-[#8d90a0] font-mono">0–100 Scale</span>
          </div>
          {trustScore?.breakdown?.factor_trust_values &&
          Object.keys(trustScore.breakdown.factor_trust_values).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(trustScore.breakdown.factor_trust_values).map(([factor, val]) => (
                <div key={factor} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#c3c6d7] capitalize">{factor.replace(/_/g, " ")}</span>
                    <span className="font-mono text-[#d3e4fe]">{Math.round(val)}</span>
                  </div>
                  <div className="h-1 bg-[#102034] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        val >= 80 ? "bg-[#4edea3]" : val >= 50 ? "bg-[#ffb95f]" : "bg-[#ffb4ab]"
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8d90a0] italic">
              Compute Trust Score above to generate itemized factor weights.
            </p>
          )}
        </div>

        {/* Bayesian Fraud Weights */}
        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#d3e4fe] flex items-center gap-1.5">
              <Gauge size={12} className="text-[#ffb95f]" /> Fraud Weights Distribution
            </span>
            <span className="text-[10px] text-[#8d90a0] font-mono">Active Weights</span>
          </div>
          {fraud ? (
            <div className="space-y-2 text-[11px]">
              {[
                ["OCR Accuracy", fraud.ocr_accuracy_weight],
                ["QR Verification", fraud.qr_weight],
                ["Blockchain Verification", fraud.blockchain_weight],
                ["Tampering Detection", fraud.tampering_weight],
                ["Duplicate Detection", fraud.duplicate_weight],
                ["Metadata Integrity", fraud.metadata_integrity_weight],
                ["Image Quality", fraud.image_quality_weight],
              ].map(([label, weight]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-[#8d90a0]">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#102034] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563eb] h-full rounded-full"
                        style={{ width: `${(weight as number) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-[#c3c6d7] w-8 text-right">
                      {Math.round((weight as number) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8d90a0] italic">
              Execute Fraud Analysis to view factor contribution weights.
            </p>
          )}
        </div>
      </div>

      {/* Decision Audit Log / Reasons List */}
      {reasons.length > 0 && (
        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-2">
          <span className="text-xs font-mono uppercase text-[#d3e4fe] block">
            System Decision Log
          </span>
          <ul className="space-y-1.5 text-xs">
            {reasons.map((r, i) => {
              const isPass = r.startsWith("✓");
              const isFail = r.startsWith("✗");
              const isWarn = r.startsWith("⚠");
              const color = isPass
                ? "text-[#4edea3]"
                : isFail
                ? "text-[#ffb4ab]"
                : isWarn
                ? "text-[#ffb95f]"
                : "text-[#c3c6d7]";
              return (
                <li key={i} className={`flex items-start gap-2 ${color} leading-relaxed`}>
                  <span className="font-mono shrink-0">{isPass ? "✓" : isFail ? "✗" : "•"}</span>
                  <span>{r.replace(/^[✓✗⚠]\s*/, "")}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
