"use client";

import React from "react";
import { Check, Clock, AlertTriangle, Minus, Loader2 } from "lucide-react";
import { PipelineStage } from "@/lib/api";

interface PipelineStageItemProps {
  stage: PipelineStage;
  index: number;
}

export const PipelineStageItem: React.FC<PipelineStageItemProps> = ({ stage, index }) => {
  const isCompleted = stage.status === "COMPLETED";
  const isRunning = stage.status === "RUNNING";
  const isPending = stage.status === "PENDING";
  const isFailed = stage.status === "FAILED";
  const isUnavailable = stage.status === "UNAVAILABLE" || stage.status === "NOT_APPLICABLE";

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] text-[10px] font-mono font-semibold">
          <Check size={10} /> DONE
        </span>
      );
    }
    if (isRunning) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#2563eb]/20 border border-[#2563eb]/40 text-[#38bdf8] text-[10px] font-mono font-semibold animate-pulse">
          <Loader2 size={10} className="animate-spin" /> RUNNING
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-[10px] font-mono font-semibold">
          <AlertTriangle size={10} /> FAILED
        </span>
      );
    }
    if (isUnavailable) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#102034] border border-[#1b2b3f] text-[#8d90a0] text-[10px] font-mono">
          <Minus size={10} /> NOT APPLICABLE
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#102034] border border-[#1b2b3f] text-[#ffb95f] text-[10px] font-mono">
        <Clock size={10} /> PENDING
      </span>
    );
  };

  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`p-3 rounded-[6px] border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isCompleted
          ? "bg-[#102034]/70 border-[#1b2b3f] hover:border-[#4edea3]/30"
          : isRunning
          ? "bg-[#2563eb]/10 border-[#2563eb]/30"
          : isFailed
          ? "bg-[#93000a]/10 border-[#ffb4ab]/30"
          : isUnavailable
          ? "bg-[#0b1c30]/40 border-[#1b2b3f]/50 opacity-60"
          : "bg-[#0b1c30] border-[#1b2b3f] hover:border-[#1b2b3f]/90"
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <span className="font-mono text-[11px] text-[#8d90a0] font-bold shrink-0 w-6">
          {formattedIndex}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#d3e4fe] font-sans">
              {stage.label}
            </span>
            <span className="text-[10px] font-mono text-[#8d90a0] hidden md:inline">
              [{stage.stage}]
            </span>
          </div>
          {stage.summary && (
            <p className="text-[11px] text-[#c3c6d7] font-mono mt-0.5 truncate max-w-lg">
              {stage.summary}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
        {stage.completed_at && (
          <span className="text-[10px] font-mono text-[#8d90a0]">
            {new Date(stage.completed_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
        {stage.duration_ms != null && (
          <span className="text-[10px] font-mono text-[#38bdf8]">
            {stage.duration_ms}ms
          </span>
        )}
        {getStatusBadge()}
      </div>
    </div>
  );
};
