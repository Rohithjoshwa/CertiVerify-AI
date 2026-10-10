"use client";

import React from "react";
import { Gauge, ScanText, FileCheck, AlertTriangle } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";


interface SecondaryMetricsProps {
  avgTrustScore?: number;
  avgOcrAccuracy?: number;
  avgFraudProbability?: number;
  totalReports: number;
}

export const SecondaryMetrics: React.FC<SecondaryMetricsProps> = ({
  avgTrustScore,
  avgOcrAccuracy,
  avgFraudProbability,
  totalReports,
}) => {
  const trustValue = avgTrustScore != null ? Math.round(avgTrustScore) : null;
  const ocrPct =
    avgOcrAccuracy != null ? Math.round(avgOcrAccuracy * 100) : null;
  const fraudPct =
    avgFraudProbability != null ? Math.round(avgFraudProbability * 100) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Mean Trust Score */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8d90a0] mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
            Mean Trust Index
          </span>
          <Gauge size={13} className="text-[#38bdf8]" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-mono text-xl font-bold text-[#d3e4fe]">
            {trustValue != null ? `${trustValue}` : "N/A"}
          </span>
          <span className="text-[11px] font-mono text-[#8d90a0]">/ 100</span>
        </div>
        <ProgressBar
          value={trustValue ?? 0}
          size="xs"
          variant={trustValue != null && trustValue >= 70 ? "emerald" : "amber"}
        />
      </div>

      {/* Metric 2: Avg OCR Extraction */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8d90a0] mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
            Neural OCR Accuracy
          </span>
          <ScanText size={13} className="text-[#4edea3]" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-mono text-xl font-bold text-[#d3e4fe]">
            {ocrPct != null ? `${ocrPct}%` : "N/A"}
          </span>
          <span className="text-[11px] font-mono text-[#8d90a0]">
            Dual-engine mean
          </span>
        </div>
        <ProgressBar value={ocrPct ?? 0} size="xs" variant="emerald" />
      </div>

      {/* Metric 3: Avg Fraud Probability */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8d90a0] mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
            Avg Fraud Risk
          </span>
          <AlertTriangle size={13} className="text-[#ffb95f]" />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-mono text-xl font-bold text-[#d3e4fe]">
            {fraudPct != null ? `${fraudPct}%` : "N/A"}
          </span>
          <span className="text-[11px] font-mono text-[#8d90a0]">
            Risk coefficient
          </span>
        </div>
        <ProgressBar
          value={fraudPct ?? 0}
          size="xs"
          variant={fraudPct != null && fraudPct > 35 ? "rose" : "amber"}
        />
      </div>

      {/* Metric 4: Reports Generated */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#8d90a0] mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
            Signed PDF Reports
          </span>
          <FileCheck size={13} className="text-[#b4c5ff]" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-mono text-xl font-bold text-[#d3e4fe]">
            {totalReports.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono text-[#8d90a0]">
            Cryptographically sealed
          </span>
        </div>
        <div className="h-1 bg-[#2563eb]/20 rounded-full overflow-hidden">
          <div className="h-full bg-[#2563eb] w-full" />
        </div>
      </div>
    </div>
  );
};
