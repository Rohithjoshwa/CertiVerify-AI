"use client";

import React from "react";
import Link from "next/link";
import { Upload, RefreshCw, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  userName?: string;
  userRole?: string;
  onRefresh: () => void;
  refreshing: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = "Analyst",
  userRole = "STUDENT",
  onRefresh,
  refreshing,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1b2b3f]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] text-[#2563eb] bg-[#2563eb]/10 border border-[#2563eb]/30 px-2 py-0.5 rounded-[2px] font-bold uppercase tracking-wider">
            Forensic Telemetry
          </span>
          <span className="font-mono text-[10px] text-[#8d90a0]">
            ROLE: {userRole.toUpperCase()}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#d3e4fe] tracking-tight font-sans">
          Authenticity & Fraud Detection Console
        </h1>
        <p className="text-xs sm:text-sm text-[#8d90a0] mt-0.5 max-w-2xl leading-relaxed">
          Real-time cryptographic hashing, neural OCR extraction, and multi-vector forgery detection telemetry.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          icon={<RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />}
        >
          {refreshing ? "Refreshing..." : "Sync State"}
        </Button>

        <Link href="/dashboard/upload">
          <Button variant="primary" size="sm" icon={<Upload size={13} />}>
            Ingest Document
          </Button>
        </Link>
      </div>
    </div>
  );
};
