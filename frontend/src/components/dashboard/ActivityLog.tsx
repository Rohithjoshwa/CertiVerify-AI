"use client";

import React from "react";
import Link from "next/link";
import { Clock, Shield, Upload, FileCheck, AlertCircle } from "lucide-react";
import { TimelineEvent } from "@/lib/api";

interface ActivityLogProps {
  timeline?: TimelineEvent[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ timeline = [] }) => {
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toISOString().replace("T", " ").substring(11, 19);
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f] mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Clock size={15} className="text-[#38bdf8]" />
            Audit Activity Trail
          </h3>
          <p className="text-xs text-[#8d90a0]">
            Chronological audit log of ingestion, verification, and forensic events.
          </p>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8d90a0]">
          No recent system events logged yet.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {timeline.slice(0, 10).map((event, idx) => (
            <div
              key={`${event.certificate_id}-${idx}`}
              className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded-[4px] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#d3e4fe] truncate">
                    {event.event}
                  </p>
                  <Link
                    href={`/dashboard/certificates/${event.certificate_id}`}
                    className="text-[11px] text-[#8d90a0] hover:text-[#2563eb] truncate block transition-colors"
                  >
                    {event.filename}
                  </Link>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-[#8d90a0] block">
                  {formatTime(event.timestamp)}
                </span>
                {event.label && (
                  <span className="font-mono text-[9px] uppercase text-[#4edea3] font-semibold">
                    {event.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
