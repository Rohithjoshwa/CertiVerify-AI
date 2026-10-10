"use client";

import React from "react";
import { ShieldCheck, Cpu, Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface UploadHeaderProps {
  userName?: string;
  totalIngested?: number;
}

export const UploadHeader: React.FC<UploadHeaderProps> = ({
  userName,
  totalIngested,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1b2b3f]">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#2563eb]/15 border border-[#2563eb]/30 flex items-center justify-center text-[#38bdf8]">
            <ShieldCheck size={18} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#d3e4fe] font-sans">
            Certificate Ingestion Engine
          </h1>
          <Badge variant="info" size="sm">
            INGEST V1.0
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#8d90a0] max-w-2xl font-sans">
          Upload academic credentials, marksheets, and identity documents for neural OCR extraction,
          cryptographic SHA-256 anchoring, and automated forensic verification.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1c30] border border-[#1b2b3f] rounded-[4px] text-xs font-mono text-[#c3c6d7]">
          <Lock size={12} className="text-[#4edea3]" />
          <span>AIR-GAPPED HASHING</span>
        </div>
        {totalIngested !== undefined && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1c30] border border-[#1b2b3f] rounded-[4px] text-xs font-mono text-[#8d90a0]">
            <Cpu size={12} className="text-[#38bdf8]" />
            <span>
              LEDGER:{" "}
              <strong className="text-[#d3e4fe]">{totalIngested}</strong> RECS
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
