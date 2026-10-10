"use client";

import React from "react";
import { CheckCircle2, Clock, AlertTriangle, Cpu, Layers, Loader2, RefreshCw } from "lucide-react";
import { PipelineStage, PipelineStatusResponse } from "@/lib/api";

interface PipelineProgressCardProps {
  pipeline?: PipelineStatusResponse | null;
  overallStatus?: "FULLY_COMPLETE" | "PARTIALLY_COMPLETE" | "NOT_STARTED" | string;
  completionPct?: number;
  stages?: PipelineStage[];
  loading?: boolean;
  isRunning?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const PipelineProgressCard: React.FC<PipelineProgressCardProps> = ({
  pipeline,
  overallStatus,
  completionPct,
  stages,
  loading = false,
  isRunning = false,
  errorMessage,
  onRetry,
}) => {
  const activeOverallStatus = isRunning
    ? "RUNNING"
    : (pipeline?.overall_status ?? overallStatus ?? "NOT_STARTED");
  const activeCompletionPct = pipeline?.completion_pct ?? completionPct ?? 0;
  const activeStages = pipeline?.stages ?? stages ?? [];

  const completedCount = activeStages.filter((s) => s.status === "COMPLETED" || s.status === "NOT_APPLICABLE").length;
  const pendingCount = activeStages.filter((s) => s.status === "PENDING").length;
  const unavailableCount = activeStages.filter((s) => s.status === "UNAVAILABLE").length;
  const failedCount = activeStages.filter((s) => s.status === "FAILED").length;
  const totalStages = activeStages.length || 14;

  const failedStage = activeStages.find((s) => s.status === "FAILED");

  const pct = Math.min(100, Math.max(0, Math.round(activeCompletionPct)));

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#2563eb]/15 border border-[#2563eb]/30 flex items-center justify-center text-[#38bdf8]">
            <Layers size={14} />
          </div>
          <h2 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Verification Pipeline Telemetry
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#8d90a0]">
          BACKEND CONTRACT: 14 ATOMIC STAGES
        </span>
      </div>

      {/* Progress Metric & Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-bold font-mono text-[#d3e4fe]">
            {loading && !pipeline ? "…" : errorMessage ? "—" : `${pct}%`}
          </span>
          <span className="text-xs font-mono text-[#8d90a0]">
            {errorMessage ? "Pipeline status unavailable" : `${completedCount} of ${totalStages} Stages Verified`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {errorMessage ? (
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-wider bg-[#102034] border border-[#1b2b3f] text-[#ffb4ab]">
              PIPELINE ERROR
            </span>
          ) : isRunning ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-wider bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8]">
              <Loader2 size={11} className="animate-spin text-[#38bdf8]" />
              RUNNING
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-wider ${
                activeOverallStatus === "FULLY_COMPLETE"
                  ? "bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3]"
                  : activeOverallStatus === "PARTIALLY_COMPLETE"
                  ? "bg-[#ffb95f]/10 border border-[#ffb95f]/30 text-[#ffb95f]"
                  : "bg-[#102034] border border-[#1b2b3f] text-[#8d90a0]"
              }`}
            >
              {activeOverallStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* Real Completion Progress Bar */}
      <div className="h-2 w-full bg-[#102034] rounded-full overflow-hidden border border-[#1b2b3f]/60">
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#4edea3] transition-all duration-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stage Breakdown Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5 flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#4edea3] shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Completed</p>
            <p className="text-xs font-bold text-[#d3e4fe] font-mono">{completedCount}</p>
          </div>
        </div>

        <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5 flex items-center gap-2">
          <Clock size={15} className="text-[#ffb95f] shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Pending</p>
            <p className="text-xs font-bold text-[#d3e4fe] font-mono">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5 flex items-center gap-2">
          <Cpu size={15} className="text-[#8d90a0] shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Not Applicable</p>
            <p className="text-xs font-bold text-[#8d90a0] font-mono">{unavailableCount}</p>
          </div>
        </div>

        <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5 flex items-center gap-2">
          <AlertTriangle size={15} className="text-[#ffb4ab] shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Failed</p>
            <p className="text-xs font-bold text-[#d3e4fe] font-mono">{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Failed Stage Alert Banner & Retry Functionality */}
      {(failedStage || errorMessage) && (
        <div className="p-3 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-[4px] flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#ffb4ab]">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              {failedStage ? `Failed Stage: ${failedStage.label}` : errorMessage}
            </span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#2563eb]/40 rounded-[3px] text-[11px] font-mono transition disabled:opacity-50"
            >
              <RefreshCw size={11} className={isRunning ? "animate-spin" : ""} />
              <span>Retry Pipeline</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
