"use client";

import React from "react";
import Link from "next/link";
import { Upload, ScanLine, Layers, FileText, ArrowRight } from "lucide-react";

export const ForensicQuickInspect: React.FC = () => {
  const quickActions = [
    {
      title: "Upload Certificate",
      description: "Verify a new document",
      href: "/dashboard/upload",
      icon: Upload,
      color: "text-[#38bdf8]",
    },
    {
      title: "Deep Document Analysis",
      description: "Deep document analysis",
      href: "/dashboard/certificates",
      icon: ScanLine,
      color: "text-[#2563eb]",
    },
    {
      title: "Bulk Upload",
      description: "Upload multiple files",
      href: "/dashboard/upload",
      icon: Layers,
      color: "text-[#4edea3]",
    },
    {
      title: "View Reports",
      description: "Generate reports",
      href: "/dashboard/certificates",
      icon: FileText,
      color: "text-[#ffb95f]",
    },
  ];

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#d3e4fe]">Quick Actions</h3>
          <p className="text-xs text-[#8d90a0]">Common tasks to get started</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="p-3.5 bg-[#000f21] border border-[#1b2b3f] hover:border-[#2563eb]/50 rounded-[6px] transition-all duration-150 hover:bg-[#102034] group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded-[4px] bg-[#102034] border border-[#1b2b3f] text-[#d3e4fe]">
                  <Icon size={16} className={action.color} />
                </div>
                <ArrowRight size={13} className="text-[#8d90a0] group-hover:text-[#38bdf8] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#38bdf8] transition-colors mb-0.5 font-sans">
                  {action.title}
                </h4>
                <p className="text-[11px] text-[#8d90a0] leading-snug">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
