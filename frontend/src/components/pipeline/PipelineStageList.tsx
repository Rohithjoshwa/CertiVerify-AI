"use client";

import React, { useState } from "react";
import { ListChecks, CheckCircle2, Clock, Filter } from "lucide-react";
import { PipelineStage } from "@/lib/api";
import { PipelineStageItem } from "./PipelineStageItem";

interface PipelineStageListProps {
  stages: PipelineStage[];
  loading?: boolean;
  errorMessage?: string | null;
}

export const PipelineStageList: React.FC<PipelineStageListProps> = ({ stages, loading, errorMessage }) => {
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "PENDING">("ALL");

  const filteredStages = stages.filter((stage) => {
    if (filter === "COMPLETED") return stage.status === "COMPLETED";
    if (filter === "PENDING") return stage.status === "PENDING";
    return true;
  });

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-[#38bdf8]" />
          <h2 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Verification Pipeline Sequence ({stages.length} Stages)
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2 py-1 rounded-[3px] text-[10px] font-mono transition ${
              filter === "ALL"
                ? "bg-[#2563eb] text-white font-bold"
                : "bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe]"
            }`}
          >
            All ({stages.length})
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-2 py-1 rounded-[3px] text-[10px] font-mono transition ${
              filter === "COMPLETED"
                ? "bg-[#4edea3]/20 border border-[#4edea3]/40 text-[#4edea3] font-bold"
                : "bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe]"
            }`}
          >
            Done ({stages.filter((s) => s.status === "COMPLETED").length})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-2 py-1 rounded-[3px] text-[10px] font-mono transition ${
              filter === "PENDING"
                ? "bg-[#ffb95f]/20 border border-[#ffb95f]/40 text-[#ffb95f] font-bold"
                : "bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe]"
            }`}
          >
            Pending ({stages.filter((s) => s.status === "PENDING").length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-[#8d90a0]">
          Loading verification pipeline telemetry...
        </div>
      ) : errorMessage ? (
        <div className="py-8 text-center px-4 space-y-2">
          <p className="text-xs font-mono font-medium text-[#ffb95f]">
            Pipeline status unavailable
          </p>
          <p className="text-[11px] font-mono text-[#8d90a0] max-w-sm mx-auto">
            The verification pipeline status endpoint is temporarily unavailable from the backend service. Individual forensic modules remain operational.
          </p>
        </div>
      ) : stages.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-[#8d90a0]">
          No pipeline telemetry available from backend.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStages.map((stage, idx) => (
            <PipelineStageItem key={stage.stage} stage={stage} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};
