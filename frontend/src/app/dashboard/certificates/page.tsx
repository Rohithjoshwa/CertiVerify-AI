"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ShieldX,
  Clock,
  Loader2,
  RefreshCw,
  UploadCloud,
  FileQuestion,
  Filter,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  dashboardApi,
  DashboardStatsResponse,
  certificateApi,
  CertificateResponse,
  RecentCertificate,
  getAccessToken,
} from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type FilterStatus = "all" | "genuine" | "suspicious" | "fake" | "not_run";

// ---- Authenticated PDF report downloader -------------------------------------
async function downloadReport(certId: string, verificationId?: string) {
  const token = getAccessToken();
  if (!token) {
    alert("Please log in first.");
    return;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_URL}/api/v1/certificates/${certId}/download-report`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    alert(`Download failed (${res.status}). Verify that the report has been generated in the AI Cockpit.`);
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CertiVerify_${verificationId ?? certId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
// ------------------------------------------------------------------------------

export default function CertificateRegistryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [rawCertificates, setRawCertificates] = useState<CertificateResponse[]>([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsRes, certsRes] = await Promise.all([
        dashboardApi.stats().catch(() => null),
        certificateApi.list().catch(() => null),
      ]);

      if (statsRes) setStats(statsRes.data);
      if (certsRes) setRawCertificates(certsRes.data);
      setError(null);
    } catch {
      setError("Failed to synchronize certificate registry ledger.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [fetchData, router]);

  // Merge raw uploaded certificates with telemetry from dashboard stats
  const unifiedCertificates: RecentCertificate[] = useMemo(() => {
    const statsMap = new Map<string, RecentCertificate>();
    (stats?.recent_certificates ?? []).forEach((c) => {
      statsMap.set(c.id, c);
    });

    // Start with all raw certificates
    const merged: RecentCertificate[] = rawCertificates.map((rc) => {
      const telemetry = statsMap.get(rc.id);
      if (telemetry) return telemetry;

      return {
        id: rc.id,
        original_filename: rc.original_filename,
        file_type: rc.file_type,
        uploaded_at: rc.uploaded_at,
        has_report: false,
      };
    });

    // Also append any from stats that might not be in raw list
    (stats?.recent_certificates ?? []).forEach((sc) => {
      if (!merged.some((m) => m.id === sc.id)) {
        merged.push(sc);
      }
    });

    // Sort descending by upload timestamp
    return merged.sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }, [rawCertificates, stats]);

  // Filter based on search query and status selection
  const filteredCertificates = useMemo(() => {
    return unifiedCertificates.filter((c) => {
      const query = search.toLowerCase().trim();
      const matchSearch =
        !query ||
        c.original_filename.toLowerCase().includes(query) ||
        (c.verification_id ?? "").toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query);

      const label = c.prediction_label?.toLowerCase();
      let matchStatus = true;
      if (filterStatus === "genuine") {
        matchStatus = label === "genuine";
      } else if (filterStatus === "suspicious") {
        matchStatus = label === "suspicious";
      } else if (filterStatus === "fake") {
        matchStatus = label === "fake";
      } else if (filterStatus === "not_run") {
        matchStatus = !label || label === "not_run" || label === "pending";
      }

      return matchSearch && matchStatus;
    });
  }, [unifiedCertificates, search, filterStatus]);

  const handleDownload = async (certId: string, verificationId?: string) => {
    setDownloadingId(certId);
    try {
      await downloadReport(certId, verificationId);
    } finally {
      setDownloadingId(null);
    }
  };

  const renderVerdictBadge = (label?: string) => {
    switch (label?.toLowerCase()) {
      case "genuine":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 text-[11px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            GENUINE
          </span>
        );
      case "suspicious":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/30 text-[11px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb95f]" />
            SUSPICIOUS
          </span>
        );
      case "fake":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 text-[11px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]" />
            FORGERY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#8d90a0]/10 text-[#8d90a0] border border-[#8d90a0]/30 text-[11px] font-mono">
            PENDING
          </span>
        );
    }
  };

  // Counts for quick filter pills
  const counts = useMemo(() => {
    let genuine = 0;
    let suspicious = 0;
    let fake = 0;
    let pending = 0;

    unifiedCertificates.forEach((c) => {
      const l = c.prediction_label?.toLowerCase();
      if (l === "genuine") genuine++;
      else if (l === "suspicious") suspicious++;
      else if (l === "fake") fake++;
      else pending++;
    });

    return { total: unifiedCertificates.length, genuine, suspicious, fake, pending };
  }, [unifiedCertificates]);

  return (
    <main className="min-h-screen bg-[#000f21] text-[#c3c6d7] p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2b3f]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0]">
            <Link href="/dashboard" className="hover:text-[#d3e4fe] transition">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#38bdf8]">Certificate Registry</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <FileText size={22} className="text-[#38bdf8]" />
            Certificate Registry & Audit History Ledger
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Institutional audit trail of all verified academic credentials, cryptographic hashes, and forensic outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="px-3 py-1.5 text-xs font-medium bg-[#0b1c30] hover:bg-[#102034] text-[#c3c6d7] hover:text-[#d3e4fe] rounded-[4px] border border-[#1b2b3f] transition flex items-center gap-1.5 disabled:opacity-50"
            title="Synchronize registry ledger"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin text-[#38bdf8]" : "text-[#8d90a0]"} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>

          <Link
            href="/dashboard/upload"
            className="px-4 py-1.5 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] shadow-sm transition flex items-center gap-1.5"
          >
            <UploadCloud size={14} />
            <span>+ Ingest Document</span>
          </Link>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            Total Ingested
          </span>
          <span className="text-xl font-mono font-bold text-[#d3e4fe]">
            {loading ? "…" : counts.total}
          </span>
        </div>

        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            Genuine Credentials
          </span>
          <span className="text-xl font-mono font-bold text-[#4edea3]">
            {loading ? "…" : counts.genuine}
          </span>
        </div>

        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            Suspicious / Anomalies
          </span>
          <span className="text-xl font-mono font-bold text-[#ffb95f]">
            {loading ? "…" : counts.suspicious}
          </span>
        </div>

        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8d90a0] block">
            Detected Forgeries
          </span>
          <span className="text-xl font-mono font-bold text-[#ffb4ab]">
            {loading ? "…" : counts.fake}
          </span>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden shadow-lg space-y-0">
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-[#1b2b3f] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0b1c30]">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Records", count: counts.total },
              { id: "genuine", label: "Genuine", count: counts.genuine },
              { id: "suspicious", label: "Suspicious", count: counts.suspicious },
              { id: "fake", label: "Forgeries", count: counts.fake },
              { id: "not_run", label: "Pending", count: counts.pending },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as FilterStatus)}
                className={`text-xs px-2.5 py-1 rounded-[4px] font-medium transition-colors flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? "bg-[#2563eb] text-white"
                    : "bg-[#000f21] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f]"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1 rounded-[2px] ${
                  filterStatus === tab.id ? "bg-white/20 text-white" : "bg-[#102034] text-[#8d90a0]"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0]" />
            <input
              type="text"
              placeholder="Search filename, verification ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs pl-8 pr-3 py-1.5 rounded-[4px] placeholder-[#8d90a0] focus:outline-none focus:border-[#2563eb] transition"
            />
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 size={24} className="animate-spin text-[#38bdf8] mx-auto" />
            <p className="text-xs text-[#8d90a0]">Loading credential registry ledger…</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <FileQuestion size={36} className="text-[#8d90a0] mx-auto opacity-40" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#d3e4fe]">
                {search || filterStatus !== "all"
                  ? "No matching certificates found"
                  : "Registry is currently empty"}
              </h3>
              <p className="text-xs text-[#8d90a0] max-w-sm mx-auto">
                {search || filterStatus !== "all"
                  ? "Try adjusting your search query or verdict status filters."
                  : "Ingest your first certificate to trigger OCR extraction and forensic verification."}
              </p>
            </div>
            {(!search && filterStatus === "all") && (
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] transition mt-2 shadow-sm"
              >
                <UploadCloud size={13} />
                <span>Upload First Certificate</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#000f21] text-[#8d90a0] border-b border-[#1b2b3f] font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Document Credential</th>
                  <th className="px-4 py-3 font-medium">Verification ID</th>
                  <th className="px-4 py-3 font-medium">Uploaded Timestamp</th>
                  <th className="px-4 py-3 font-medium">Trust Score</th>
                  <th className="px-4 py-3 font-medium">Forensic Verdict</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2b3f] text-[#c3c6d7]">
                {filteredCertificates.map((c) => {
                  const isDownloading = downloadingId === c.id;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#102034]/60 transition-colors group"
                    >
                      {/* Document Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-[4px] bg-[#000f21] border border-[#1b2b3f] text-[#38bdf8] shrink-0">
                            <FileText size={14} />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/certificates/${c.id}`}
                              className="font-medium text-[#d3e4fe] hover:text-[#38bdf8] transition truncate block max-w-xs sm:max-w-sm"
                              title={c.original_filename}
                            >
                              {c.original_filename}
                            </Link>
                            <span className="text-[10px] font-mono text-[#8d90a0] block truncate">
                              UUID: {c.id.slice(0, 16)}…
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Verification ID */}
                      <td className="px-4 py-3 font-mono text-[11px] text-[#8d90a0]">
                        {c.verification_id ? (
                          <span className="text-[#38bdf8] font-semibold">
                            {c.verification_id}
                          </span>
                        ) : (
                          <span className="text-[#8d90a0]/60">N/A</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 font-mono text-[11px] text-[#8d90a0] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="shrink-0 text-[#8d90a0]/60" />
                          <span>
                            {new Date(c.uploaded_at).toLocaleString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Trust Score */}
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {c.trust_score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                c.trust_score >= 80
                                  ? "text-[#4edea3]"
                                  : c.trust_score >= 50
                                  ? "text-[#ffb95f]"
                                  : "text-[#ffb4ab]"
                              }`}
                            >
                              {c.trust_score}/100
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8d90a0]/50">—</span>
                        )}
                      </td>

                      {/* Final Verdict */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {renderVerdictBadge(c.prediction_label)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.has_report && (
                            <button
                              onClick={() => handleDownload(c.id, c.verification_id)}
                              disabled={isDownloading}
                              className="px-2 py-1 text-[11px] font-medium bg-[#000f21] hover:bg-[#1b2b3f] text-[#38bdf8] rounded-[3px] border border-[#1b2b3f] transition flex items-center gap-1 disabled:opacity-50"
                              title="Download official PDF verification report"
                            >
                              {isDownloading ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <Download size={11} />
                              )}
                              <span className="hidden sm:inline">PDF</span>
                            </button>
                          )}

                          <Link
                            href={`/dashboard/certificates/${c.id}`}
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] rounded-[3px] border border-[#1b2b3f] transition inline-flex items-center gap-1"
                            title="Inspect in AI Forensic Cockpit"
                          >
                            <span>Inspect</span>
                            <ExternalLink size={10} className="text-[#8d90a0]" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
