"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  ExternalLink,
  Download,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Loader2,
  FileQuestion,
} from "lucide-react";
import { RecentCertificate } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface RecentCertificatesTableProps {
  certificates: RecentCertificate[];
  search: string;
  onSearchChange: (val: string) => void;
  filterLabel: string;
  onFilterChange: (val: any) => void;
  onDownloadReport: (certId: string, verificationId?: string) => Promise<void>;
  downloadingId: string | null;
}

export const RecentCertificatesTable: React.FC<RecentCertificatesTableProps> = ({
  certificates,
  search,
  onSearchChange,
  filterLabel,
  onFilterChange,
  onDownloadReport,
  downloadingId,
}) => {
  const filterOptions = [
    { label: "All Records", value: "all" },
    { label: "Genuine", value: "genuine" },
    { label: "Suspicious", value: "suspicious" },
    { label: "Fake", value: "fake" },
    { label: "Pending Verification", value: "not_run" },
  ];

  const renderVerdictBadge = (label?: string) => {
    switch (label) {
      case "genuine":
        return (
          <Badge variant="genuine" size="sm" dot>
            GENUINE
          </Badge>
        );
      case "suspicious":
        return (
          <Badge variant="suspicious" size="sm" dot>
            SUSPICIOUS
          </Badge>
        );
      case "fake":
        return (
          <Badge variant="fake" size="sm" dot>
            FORGERY
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            PENDING
          </Badge>
        );
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toISOString().replace("T", " ").substring(0, 16);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#1b2b3f] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#d3e4fe] font-sans">
            Recent Certificate Registry
          </h2>
          <p className="text-xs text-[#8d90a0]">
            Cryptographic ledger of recently analyzed credentials and forensic outcomes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={`text-xs px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                filterLabel === opt.value
                  ? "bg-[#2563eb] text-white"
                  : "bg-[#000f21] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar Sub-header */}
      <div className="px-4 py-2.5 bg-[#000f21]/60 border-b border-[#1b2b3f] flex items-center gap-2">
        <Search size={13} className="text-[#8d90a0] shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by certificate filename or verification ID..."
          className="w-full bg-transparent border-none text-xs text-[#d3e4fe] placeholder:text-[#8d90a0] focus:outline-none"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="text-xs text-[#8d90a0] hover:text-white shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto">
        {certificates.length === 0 ? (
          <div className="p-12 text-center">
            <FileQuestion size={36} className="text-[#8d90a0] mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-[#d3e4fe] mb-1">
              No Certificate Records Found
            </h3>
            <p className="text-xs text-[#8d90a0] max-w-sm mx-auto mb-4">
              {search
                ? `No certificates matched your search term "${search}".`
                : "Your certificate verification ledger is currently empty. Ingest your first certificate to run the verification engine."}
            </p>
            <Link href="/dashboard/upload">
              <Button variant="primary" size="sm">
                Upload Certificate
              </Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1b2b3f] bg-[#000f21]/40 font-mono text-[10px] text-[#8d90a0] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Document Name</th>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold">Verification ID</th>
                <th className="py-2.5 px-4 font-semibold">OCR Accuracy</th>
                <th className="py-2.5 px-4 font-semibold">Trust Score</th>
                <th className="py-2.5 px-4 font-semibold">Verdict</th>
                <th className="py-2.5 px-4 font-semibold text-right">Cockpit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2b3f]">
              {certificates.map((cert) => (
                <tr
                  key={cert.id}
                  className="hover:bg-[#102034]/60 transition-colors group"
                >
                  {/* Filename & Type */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5 min-w-0 max-w-xs">
                      <div className="p-1.5 rounded-[4px] bg-[#102034] border border-[#1b2b3f] text-[#2563eb] shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/certificates/${cert.id}`}
                          className="font-medium text-[#d3e4fe] hover:text-[#2563eb] truncate block transition-colors"
                          title={cert.original_filename}
                        >
                          {cert.original_filename}
                        </Link>
                        <span className="font-mono text-[10px] text-[#8d90a0] uppercase">
                          {cert.file_type}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8d90a0] whitespace-nowrap">
                    {formatTimestamp(cert.uploaded_at)}
                  </td>

                  {/* Verification ID / Hash */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#b4c5ff] whitespace-nowrap">
                    {cert.verification_id ? (
                      <span className="font-semibold">{cert.verification_id}</span>
                    ) : (
                      <span className="text-[#8d90a0]">#{cert.id.substring(0, 8)}</span>
                    )}
                  </td>

                  {/* OCR Accuracy */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                    {cert.ocr_accuracy != null ? (
                      <span className="text-[#d3e4fe]">
                        {Math.round(cert.ocr_accuracy * 100)}%
                      </span>
                    ) : (
                      <span className="text-[#8d90a0]">—</span>
                    )}
                  </td>

                  {/* Trust Score */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                    {cert.trust_score != null ? (
                      <span
                        className={`font-semibold ${
                          cert.trust_score >= 70
                            ? "text-[#4edea3]"
                            : cert.trust_score >= 40
                            ? "text-[#ffb95f]"
                            : "text-[#ffb4ab]"
                        }`}
                      >
                        {Math.round(cert.trust_score)} / 100
                      </span>
                    ) : (
                      <span className="text-[#8d90a0]">Pending</span>
                    )}
                  </td>

                  {/* Final Verdict Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderVerdictBadge(cert.prediction_label)}
                  </td>

                  {/* Actions: View & Download PDF */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {cert.has_report && (
                        <button
                          onClick={() =>
                            onDownloadReport(cert.id, cert.verification_id)
                          }
                          disabled={downloadingId === cert.id}
                          title="Download Signed PDF Report"
                          className="p-1.5 text-[#8d90a0] hover:text-[#4edea3] hover:bg-[#4edea3]/10 rounded-[4px] transition-colors"
                        >
                          {downloadingId === cert.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                        </button>
                      )}

                      <Link
                        href={`/dashboard/certificates/${cert.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#2563eb] hover:text-[#b4c5ff] px-2 py-1 bg-[#102034] hover:bg-[#1b2b3f] rounded-[4px] border border-[#1b2b3f] font-medium transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
