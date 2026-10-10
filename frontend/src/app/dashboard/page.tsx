"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  UploadCloud,
  Cpu,
  Search,
  RefreshCw,
  Clock,
  Download,
  ExternalLink,
  Award,
  Loader2,
  FileQuestion,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  dashboardApi,
  analyticsApi,
  auditLogApi,
  reportApi,
  getAccessToken,
  DashboardStatsResponse,
  AnalyticsOverview,
  AuditLogResponse,
  RecentCertificate,
} from "@/lib/api";

export default function EnterpriseDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [statsRes, overviewRes, auditRes] = await Promise.allSettled([
        dashboardApi.stats(),
        analyticsApi.overview(),
        auditLogApi.list({ limit: 8 }),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      } else {
        console.warn("Failed to fetch dashboard stats:", statsRes.reason);
      }

      if (overviewRes.status === "fulfilled") {
        setOverview(overviewRes.value.data);
      } else {
        console.warn("Failed to fetch analytics overview:", overviewRes.reason);
      }

      if (auditRes.status === "fulfilled") {
        setAuditLogs(auditRes.value.data || []);
      } else {
        console.warn("Failed to fetch audit logs:", auditRes.reason);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDownloadReport = async (certId: string) => {
    setDownloadingId(certId);
    try {
      const url = reportApi.downloadUrl(certId);
      const token = getAccessToken();
      const directUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
      window.open(directUrl, "_blank");
    } catch (err) {
      console.error("Failed to download report:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="p-4 bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#38bdf8]" />
          <span className="text-xs font-mono text-[#8d90a0]">Fetching enterprise metrics & telemetry...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="p-6 bg-[#0b1c30] border border-[#93000a]/50 rounded-[8px] space-y-4">
          <div className="flex items-center gap-3 text-[#ffb4ab]">
            <AlertTriangle size={24} />
            <h2 className="text-base font-semibold">Dashboard Loading Error</h2>
          </div>
          <p className="text-xs text-[#8d90a0] leading-relaxed">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded-[4px] hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={14} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const totalCerts = stats?.total_certificates ?? 0;
  const genuineCount = stats?.prediction_distribution?.genuine ?? overview?.genuine_count ?? 0;
  const suspiciousCount = stats?.prediction_distribution?.suspicious ?? overview?.suspicious_count ?? 0;
  const fakeCount = stats?.prediction_distribution?.fake ?? overview?.fake_count ?? 0;
  const pendingCount = stats?.prediction_distribution?.not_run ?? 0;
  const avgTrust = stats?.avg_trust_score != null ? Math.round(stats.avg_trust_score) : overview?.avg_trust_score != null ? Math.round(overview.avg_trust_score) : null;
  const fraudAlerts = (stats?.tampered_count ?? 0) + (stats?.duplicate_count ?? 0) + fakeCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans tracking-tight">
            Enterprise Verification Cockpit
          </h1>
          <p className="text-xs text-[#8d90a0] mt-1">
            Real-time credential ingestion ledger, AI tamper detection, and cryptographic provenance telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="p-2 bg-[#000f21] hover:bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded-[4px] transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw size={14} />
          </button>

          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-[4px] shadow-sm transition-all"
          >
            <UploadCloud size={15} />
            <span>Upload Certificate</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Certificates */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8d90a0] font-semibold">
              TOTAL CERTIFICATES
            </span>
            <span className="p-1.5 bg-[#102034] text-[#38bdf8] rounded-[4px]">
              <FileText size={16} />
            </span>
          </div>
          <div className="my-3">
            <span className="font-mono text-3xl font-bold text-[#d3e4fe]">
              {totalCerts.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#8d90a0] block mt-1">
              Ingested in tenant database
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#38bdf8] pt-2 border-t border-[#1b2b3f] flex items-center justify-between">
            <span>REGISTRY LEDGER</span>
            <span className="font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Completed / Genuine Verifications */}
        <div className="bg-[#0b1c30] border border-[#4edea3]/30 rounded-[8px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8d90a0] font-semibold">
              GENUINE VERIFIED
            </span>
            <span className="p-1.5 bg-[#4edea3]/10 text-[#4edea3] rounded-[4px]">
              <ShieldCheck size={16} />
            </span>
          </div>
          <div className="my-3">
            <span className="font-mono text-3xl font-bold text-[#4edea3]">
              {genuineCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#4edea3] block mt-1">
              {totalCerts ? Math.round((genuineCount / totalCerts) * 100) : 0}% authentic rate
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#4edea3] pt-2 border-t border-[#1b2b3f] flex items-center justify-between">
            <span>PASSED ALL CHECKS</span>
            <CheckCircle2 size={12} />
          </div>
        </div>

        {/* Pending & Review Jobs */}
        <div className="bg-[#0b1c30] border border-[#ffb95f]/30 rounded-[8px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8d90a0] font-semibold">
              PENDING / SUSPICIOUS
            </span>
            <span className="p-1.5 bg-[#ffb95f]/10 text-[#ffb95f] rounded-[4px]">
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className="my-3">
            <span className="font-mono text-3xl font-bold text-[#ffb95f]">
              {(suspiciousCount + pendingCount).toLocaleString()}
            </span>
            <span className="text-[11px] text-[#ffb95f] block mt-1">
              {suspiciousCount} flagged for review, {pendingCount} pending
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#ffb95f] pt-2 border-t border-[#1b2b3f] flex items-center justify-between">
            <span>NEEDS ATTENTION</span>
            <Link href="/dashboard/certificates?status=suspicious" className="hover:underline flex items-center gap-1">
              View <ArrowRight size={10} />
            </Link>
          </div>
        </div>

        {/* Fraud & Tamper Alerts */}
        <div className="bg-[#0b1c30] border border-[#ffb4ab]/30 rounded-[8px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8d90a0] font-semibold">
              FRAUD & TAMPER ALERTS
            </span>
            <span className="p-1.5 bg-[#93000a]/40 text-[#ffb4ab] rounded-[4px]">
              <ShieldAlert size={16} />
            </span>
          </div>
          <div className="my-3">
            <span className="font-mono text-3xl font-bold text-[#ffb4ab]">
              {fraudAlerts.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#ffb4ab] block mt-1">
              {fakeCount} fraudulent, {stats?.tampered_count ?? 0} tampered, {stats?.duplicate_count ?? 0} duplicate
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#ffb4ab] pt-2 border-t border-[#1b2b3f] flex items-center justify-between">
            <span>HIGH RISK DETECTED</span>
            <Link href="/dashboard/evidence" className="hover:underline flex items-center gap-1">
              Evidence <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Verification Verdict Breakdown */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
            <div>
              <h2 className="text-sm font-semibold text-[#d3e4fe] flex items-center gap-2">
                <TrendingUp size={16} className="text-[#38bdf8]" />
                Verification Outcome Distribution
              </h2>
              <p className="text-xs text-[#8d90a0]">Real AI verification verdict telemetry across current tenant.</p>
            </div>
            {avgTrust != null && (
              <div className="text-right">
                <span className="text-xs font-mono text-[#8d90a0]">AVG TRUST SCORE</span>
                <div className="text-lg font-bold font-mono text-[#4edea3]">{avgTrust} / 100</div>
              </div>
            )}
          </div>

          {totalCerts === 0 ? (
            <div className="p-8 text-center text-xs text-[#8d90a0]">
              No verification results recorded yet. Upload a certificate to view live telemetry.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stacked Progress Bar */}
              <div className="h-3 w-full bg-[#000f21] rounded-full overflow-hidden flex border border-[#1b2b3f]">
                <div
                  style={{ width: `${(genuineCount / totalCerts) * 100}%` }}
                  className="bg-[#4edea3] h-full transition-all"
                  title={`Genuine: ${genuineCount}`}
                />
                <div
                  style={{ width: `${(suspiciousCount / totalCerts) * 100}%` }}
                  className="bg-[#ffb95f] h-full transition-all"
                  title={`Suspicious: ${suspiciousCount}`}
                />
                <div
                  style={{ width: `${(fakeCount / totalCerts) * 100}%` }}
                  className="bg-[#ffb4ab] h-full transition-all"
                  title={`Fake: ${fakeCount}`}
                />
                <div
                  style={{ width: `${(pendingCount / totalCerts) * 100}%` }}
                  className="bg-[#2563eb]/40 h-full transition-all"
                  title={`Pending: ${pendingCount}`}
                />
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded">
                  <div className="flex items-center gap-1.5 text-[#4edea3] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
                    Genuine
                  </div>
                  <div className="font-mono text-base font-bold text-[#d3e4fe] mt-1">{genuineCount}</div>
                </div>

                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded">
                  <div className="flex items-center gap-1.5 text-[#ffb95f] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#ffb95f]" />
                    Suspicious
                  </div>
                  <div className="font-mono text-base font-bold text-[#d3e4fe] mt-1">{suspiciousCount}</div>
                </div>

                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded">
                  <div className="flex items-center gap-1.5 text-[#ffb4ab] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#ffb4ab]" />
                    Forgery / Fake
                  </div>
                  <div className="font-mono text-base font-bold text-[#d3e4fe] mt-1">{fakeCount}</div>
                </div>

                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded">
                  <div className="flex items-center gap-1.5 text-[#38bdf8] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    Pending
                  </div>
                  <div className="font-mono text-base font-bold text-[#d3e4fe] mt-1">{pendingCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Operations Launchpad */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#d3e4fe] pb-2 border-b border-[#1b2b3f]">
            Forensic Launchpad
          </h2>

          <Link
            href="/dashboard/upload"
            className="flex items-center justify-between p-3 bg-[#000f21] hover:bg-[#102034] border border-[#1b2b3f] rounded-[4px] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <UploadCloud size={16} className="text-[#2563eb]" />
              <div>
                <div className="text-xs font-semibold text-[#d3e4fe]">Upload New Certificate</div>
                <div className="text-[10px] text-[#8d90a0]">Ingest PDF/Image for instant AI analysis</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-[#8d90a0] group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard/jobs"
            className="flex items-center justify-between p-3 bg-[#000f21] hover:bg-[#102034] border border-[#1b2b3f] rounded-[4px] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Cpu size={16} className="text-[#38bdf8]" />
              <div>
                <div className="text-xs font-semibold text-[#d3e4fe]">Async Verification Jobs</div>
                <div className="text-[10px] text-[#8d90a0]">Monitor job queues & execution status</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-[#8d90a0] group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard/evidence"
            className="flex items-center justify-between p-3 bg-[#000f21] hover:bg-[#102034] border border-[#1b2b3f] rounded-[4px] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Search size={16} className="text-[#4edea3]" />
              <div>
                <div className="text-xs font-semibold text-[#d3e4fe]">Evidence Explorer</div>
                <div className="text-[10px] text-[#8d90a0]">Inspect explainable AI evidence logs</div>
              </div>
            </div>
            <ArrowRight size={14} className="text-[#8d90a0] group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Recent Certificate Registry & Recent Audit Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Certificates Table (2 cols) */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
            <div>
              <h2 className="text-sm font-semibold text-[#d3e4fe]">Recent Certificate Activity</h2>
              <p className="text-xs text-[#8d90a0]">Latest certificates ingested and analyzed.</p>
            </div>
            <Link
              href="/dashboard/certificates"
              className="text-xs text-[#2563eb] hover:text-[#b4c5ff] font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {!stats?.recent_certificates || stats.recent_certificates.length === 0 ? (
            <div className="py-12 text-center">
              <FileQuestion size={32} className="text-[#8d90a0] mx-auto mb-2 opacity-60" />
              <p className="text-xs text-[#8d90a0]">No certificates ingested yet.</p>
              <Link href="/dashboard/upload" className="mt-3 inline-block text-xs text-[#2563eb] font-semibold hover:underline">
                Upload your first certificate →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1b2b3f] text-[10px] font-mono text-[#8d90a0] uppercase">
                    <th className="pb-2">Filename</th>
                    <th className="pb-2">Uploaded At</th>
                    <th className="pb-2">Trust Score</th>
                    <th className="pb-2">Verdict</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2b3f]">
                  {stats.recent_certificates.slice(0, 6).map((cert: RecentCertificate) => (
                    <tr key={cert.id} className="hover:bg-[#102034]/60 transition-colors">
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-[#d3e4fe] truncate max-w-[180px]">
                          {cert.original_filename}
                        </div>
                        <div className="font-mono text-[9px] text-[#8d90a0] uppercase">{cert.file_type}</div>
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-[#8d90a0]">
                        {new Date(cert.uploaded_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-2.5 font-mono text-[11px]">
                        {cert.trust_score != null ? (
                          <span
                            className={
                              cert.trust_score >= 70
                                ? "text-[#4edea3]"
                                : cert.trust_score >= 40
                                ? "text-[#ffb95f]"
                                : "text-[#ffb4ab]"
                            }
                          >
                            {Math.round(cert.trust_score)} / 100
                          </span>
                        ) : (
                          <span className="text-[#8d90a0]">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            cert.prediction_label === "genuine"
                              ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                              : cert.prediction_label === "suspicious"
                              ? "bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/30"
                              : cert.prediction_label === "fake"
                              ? "bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30"
                              : "bg-[#102034] text-[#8d90a0]"
                          }`}
                        >
                          {cert.prediction_label || "PENDING"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {cert.has_report && (
                            <button
                              onClick={() => handleDownloadReport(cert.id)}
                              disabled={downloadingId === cert.id}
                              title="Download PDF Report"
                              className="p-1 text-[#8d90a0] hover:text-[#4edea3] hover:bg-[#4edea3]/10 rounded"
                            >
                              {downloadingId === cert.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Download size={12} />
                              )}
                            </button>
                          )}
                          <Link
                            href={`/dashboard/certificates/${cert.id}`}
                            className="p-1 text-[#38bdf8] hover:bg-[#102034] rounded"
                            title="Inspect Certificate"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Log Stream (1 col) */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b2b3f]">
            <h2 className="text-sm font-semibold text-[#d3e4fe] flex items-center gap-1.5">
              <Clock size={14} className="text-[#38bdf8]" />
              Audit Event Stream
            </h2>
            <Link href="/dashboard/audit-logs" className="text-[10px] text-[#2563eb] hover:underline font-mono">
              View All
            </Link>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8d90a0]">
              No audit events recorded yet or permission not granted.
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 bg-[#000f21] border border-[#1b2b3f] rounded text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[#d3e4fe] font-semibold">
                    <span className="font-mono text-[11px] text-[#38bdf8]">{log.action}</span>
                    <span className="font-mono text-[9px] text-[#8d90a0]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8d90a0]">
                    <span>Entity: {log.entity_type}</span>
                    <span className="font-mono">{log.actor_user_id ? `User:${log.actor_user_id.slice(0, 6)}` : "System"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
