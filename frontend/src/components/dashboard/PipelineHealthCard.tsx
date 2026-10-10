"use client";

import React from "react";
import { Activity, CheckCircle2, ShieldCheck, QrCode, Link2, Copy, FileSearch } from "lucide-react";

interface PipelineHealthCardProps {
  duplicateCount?: number;
  tamperedCount?: number;
  qrVerifiedCount?: number;
  blockchainVerifiedCount?: number;
  docTypeDistribution?: Record<string, number>;
}

export const PipelineHealthCard: React.FC<PipelineHealthCardProps> = ({
  duplicateCount = 0,
  tamperedCount = 0,
  qrVerifiedCount = 0,
  blockchainVerifiedCount = 0,
  docTypeDistribution,
}) => {
  const checks = [
    {
      name: "QR Cryptographic Payload",
      count: qrVerifiedCount,
      icon: QrCode,
      color: "text-[#4edea3]",
      status: "ACTIVE",
    },
    {
      name: "Blockchain On-Chain Hash",
      count: blockchainVerifiedCount,
      icon: Link2,
      color: "text-[#38bdf8]",
      status: "SYNCED",
    },
    {
      name: "ELA Tampering & Copy-Paste",
      count: tamperedCount,
      icon: ShieldCheck,
      color: "text-[#ffb95f]",
      status: "ENGAGED",
    },
    {
      name: "Perceptual Duplicate Collision",
      count: duplicateCount,
      icon: Copy,
      color: "text-[#ffb4ab]",
      status: "RUNNING",
    },
  ];

  const types = docTypeDistribution ? Object.entries(docTypeDistribution) : [];

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f] mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Activity size={15} className="text-[#2563eb]" />
            Pipeline Health & Multi-Factor Status
          </h3>
          <p className="text-xs text-[#8d90a0]">
            Autonomous integrity validation services running on each uploaded document.
          </p>
        </div>
        <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/30 px-2 py-0.5 rounded-[2px] font-semibold">
          100% OPERATIONAL
        </span>
      </div>

      {/* Verification Check Micro-Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div
              key={check.name}
              className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded-[6px] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={16} className={check.color} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#d3e4fe] truncate">
                    {check.name}
                  </p>
                  <p className="text-[10px] font-mono text-[#8d90a0]">
                    Total processed: {check.count}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[9px] text-[#4edea3] bg-[#4edea3]/10 px-1.5 py-0.5 rounded-[2px] shrink-0">
                {check.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Document Types Distribution */}
      {types.length > 0 && (
        <div className="pt-3 border-t border-[#1b2b3f]">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#8d90a0] font-semibold block mb-2">
            Classified Document Types
          </span>
          <div className="flex flex-wrap gap-1.5">
            {types.map(([typeName, count]) => (
              <span
                key={typeName}
                className="font-mono text-[10px] bg-[#102034] text-[#c3c6d7] border border-[#1b2b3f] px-2 py-1 rounded-[4px]"
              >
                {typeName.replace(/_/g, " ")}:{" "}
                <strong className="text-[#d3e4fe]">{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
