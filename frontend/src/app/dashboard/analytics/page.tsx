"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3, TrendingUp, Shield, Copy, Building2,
  ChevronLeft, Loader2, AlertTriangle, Activity,
} from "lucide-react";
import {
  analyticsApi,
  AnalyticsOverview, DocTypeDistribution, TrustDistribution,
  FraudSignals, TimeTrendResponse, UniversityStats,
} from "@/lib/api";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, PointElement, LineElement, Title as ChartTitle,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, ChartTitle, Filler,
);

const DOC_TYPE_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar", degree: "Degree", sslc: "SSLC", hsc: "HSC",
  diploma: "Diploma", transfer_certificate: "Transfer Cert",
  resume: "Resume", marksheet: "Marksheet", unknown: "Unknown",
};

const DOC_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4","#f97316","#a3e635",
];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [docTypes, setDocTypes] = useState<DocTypeDistribution | null>(null);
  const [trustDist, setTrustDist] = useState<TrustDistribution | null>(null);
  const [fraudSig, setFraudSig] = useState<FraudSignals | null>(null);
  const [trends, setTrends] = useState<TimeTrendResponse | null>(null);
  const [uniStats, setUniStats] = useState<UniversityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendView, setTrendView] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    Promise.all([
      analyticsApi.overview(),
      analyticsApi.docTypes(),
      analyticsApi.trustDistribution(),
      analyticsApi.fraudSignals(),
      analyticsApi.timeTrends(),
      analyticsApi.universityStats(),
    ]).then(([ov, dt, td, fs, tr, us]) => {
      setOverview(ov.data);
      setDocTypes(dt.data);
      setTrustDist(td.data);
      setFraudSig(fs.data);
      setTrends(tr.data);
      setUniStats(us.data);
    }).catch(() => {
      setError("Failed to load analytics. Please refresh.");
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-bg p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading analytics…</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-surface-bg p-6 flex flex-col items-center justify-center gap-4">
        <AlertTriangle size={32} className="text-fake" />
        <p className="text-fake text-sm">{error}</p>
        <Link href="/dashboard" className="text-brand-500 text-sm hover:underline">← Back to Dashboard</Link>
      </main>
    );
  }

  // Trend data for selected view
  const trendData = trends
    ? trendView === "daily" ? trends.daily
      : trendView === "weekly" ? trends.weekly
      : trends.monthly
    : [];

  const trendLabels = trendData.map(t => {
    if (trendView === "daily") return t.period.slice(5); // MM-DD
    if (trendView === "weekly") return `W${t.period.slice(5)}`;
    return t.period;
  });

  return (
    <main className="min-h-screen bg-surface-bg p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-500" />
              Analytics
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Aggregated verification analytics — sourced from all your certificates
            </p>
          </div>
        </div>
      </header>

      {/* ── PART D: Overview Metric Cards ──────────────────────────────────── */}
      {overview && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Certs",    value: overview.total_certificates,       color: "text-white" },
              { label: "Genuine",        value: overview.genuine_count,            color: "text-genuine" },
              { label: "Suspicious",     value: overview.suspicious_count,         color: "text-suspicious" },
              { label: "Fake",           value: overview.fake_count,               color: "text-fake" },
              { label: "Duplicates",     value: overview.duplicate_count,          color: overview.duplicate_count > 0 ? "text-suspicious" : "text-genuine" },
              { label: "Tampered",       value: overview.tampered_count,           color: overview.tampered_count > 0 ? "text-fake" : "text-genuine" },
              { label: "QR Verified",    value: overview.qr_verified_count,        color: "text-brand-400" },
              { label: "Blockchain",     value: overview.blockchain_verified_count,color: "text-brand-400" },
              { label: "Avg Trust",      value: overview.avg_trust_score != null ? `${Math.round(overview.avg_trust_score)}/100` : "N/A", color: "text-white" },
              { label: "Avg OCR Conf",   value: overview.avg_ocr_accuracy != null ? `${Math.round(overview.avg_ocr_accuracy * 100)}%` : "N/A", color: "text-white" },
              { label: "Avg Fraud Prob", value: overview.avg_fraud_probability != null ? `${Math.round(overview.avg_fraud_probability * 100)}%` : "N/A",
                color: overview.avg_fraud_probability != null && overview.avg_fraud_probability > 0.5 ? "text-fake" : "text-genuine" },
              { label: "Verified",       value: overview.verification_completion_rate != null ? `${overview.verification_completion_rate}%` : "N/A", color: "text-white" },
            ].map(card => (
              <div key={card.label} className="glass-panel rounded-xl p-4 border border-surface-border text-center">
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{card.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PART E-G: Charts Row — Doc Types + Trust Distribution ────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* PART G: Document Type Distribution */}
        {docTypes && Object.keys(docTypes.doc_types).length > 0 && (
          <div className="glass-panel rounded-xl p-5 border border-surface-border">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={14} className="text-brand-500" /> Document Type Distribution
            </h2>
            <div className="flex items-center gap-6">
              <div className="w-44 shrink-0">
                <Doughnut
                  data={{
                    labels: Object.keys(docTypes.doc_types).map(k => DOC_TYPE_LABELS[k] ?? k),
                    datasets: [{
                      data: Object.values(docTypes.doc_types),
                      backgroundColor: DOC_COLORS,
                      borderColor: "transparent",
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: true,
                  }}
                />
              </div>
              <ul className="flex-1 space-y-1.5">
                {Object.entries(docTypes.doc_types)
                  .sort(([, a], [, b]) => b - a)
                  .map(([key, count], i) => {
                    const pct = docTypes.total_classified > 0
                      ? Math.round((count / docTypes.total_classified) * 100) : 0;
                    return (
                      <li key={key} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DOC_COLORS[i % DOC_COLORS.length] }} />
                        <span className="text-xs text-gray-300 flex-1">{DOC_TYPE_LABELS[key] ?? key}</span>
                        <span className="text-xs text-gray-500">{count}</span>
                        <span className="text-xs text-gray-600 w-10 text-right">{pct}%</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        )}

        {/* PART J: Trust Score Distribution */}
        {trustDist && trustDist.total_scored > 0 && (
          <div className="glass-panel rounded-xl p-5 border border-surface-border">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={14} className="text-genuine" /> Trust Score Distribution
            </h2>
            <div className="space-y-3">
              {trustDist.bands.map((band, i) => {
                const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];
                return (
                  <div key={band.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{band.label} <span className="text-gray-600">({band.description})</span></span>
                      <span className="text-gray-400">{band.count} · {band.percentage}%</span>
                    </div>
                    <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${band.percentage}%`, background: COLORS[i] }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-600 mt-2">{trustDist.total_scored} certificates scored</p>
            </div>
          </div>
        )}
      </section>

      {/* ── PART K: Fraud Signals ─────────────────────────────────────────── */}
      {fraudSig && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
            <Copy size={13} /> Fraud Signal Breakdown
          </h2>
          <div className="glass-panel rounded-xl p-5 border border-surface-border">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Tampering", value: fraudSig.tampering_detected, bad: fraudSig.tampering_detected > 0 },
                { label: "Duplicates", value: fraudSig.duplicates_detected, bad: fraudSig.duplicates_detected > 0 },
                { label: "Cert Conflicts", value: fraudSig.certificate_conflict, bad: fraudSig.certificate_conflict > 0 },
                { label: "Blockchain Mismatch", value: fraudSig.blockchain_mismatch, bad: fraudSig.blockchain_mismatch > 0 },
                { label: "QR Invalid", value: fraudSig.qr_invalid, bad: fraudSig.qr_invalid > 0 },
                { label: "Comparison Mismatch", value: fraudSig.comparison_mismatch, bad: fraudSig.comparison_mismatch > 0 },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className={`text-3xl font-bold mb-1 ${item.bad ? "text-fake" : "text-genuine"}`}>
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PART F: Time-based Trends ─────────────────────────────────────── */}
      {trends && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp size={13} /> Verification Trends
            </h2>
            <div className="flex gap-1">
              {(["daily", "weekly", "monthly"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setTrendView(v)}
                  className={`text-xs px-3 py-1 rounded-md transition ${
                    trendView === v
                      ? "bg-brand-600 text-white"
                      : "text-gray-400 hover:text-white glass-panel border border-surface-border"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-5 border border-surface-border">
            <Line
              data={{
                labels: trendLabels,
                datasets: [
                  {
                    label: "Uploaded",
                    data: trendData.map(t => t.uploaded),
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99,102,241,0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                  },
                  {
                    label: "Verified",
                    data: trendData.map(t => t.verified),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16,185,129,0.08)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { labels: { color: "#9ca3af", font: { size: 11 } } },
                },
                scales: {
                  x: { ticks: { color: "#6b7280", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" } },
                  y: { ticks: { color: "#6b7280", font: { size: 10 }, stepSize: 1 }, grid: { color: "rgba(255,255,255,0.04)" }, beginAtZero: true },
                },
                maintainAspectRatio: false,
              }}
              style={{ height: 220 }}
            />
          </div>
        </section>
      )}

      {/* ── PART H: University Stats ──────────────────────────────────────── */}
      {uniStats && uniStats.universities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
            <Building2 size={13} /> University Breakdown (Top 10)
          </h2>
          <div className="glass-panel rounded-xl border border-surface-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border text-gray-500">
                  <th className="text-left px-4 py-3 font-medium">University</th>
                  <th className="text-center px-3 py-3 font-medium">Total</th>
                  <th className="text-center px-3 py-3 font-medium text-genuine">Genuine</th>
                  <th className="text-center px-3 py-3 font-medium text-suspicious">Suspicious</th>
                  <th className="text-center px-3 py-3 font-medium text-fake">Fake</th>
                  <th className="text-center px-3 py-3 font-medium">Avg Trust</th>
                </tr>
              </thead>
              <tbody>
                {uniStats.universities.map((uni, i) => (
                  <tr key={i} className="border-b border-surface-border/50 hover:bg-white/3 transition">
                    <td className="px-4 py-3 text-gray-300 font-medium max-w-[200px] truncate">{uni.university_name}</td>
                    <td className="text-center px-3 py-3 text-gray-400">{uni.total}</td>
                    <td className="text-center px-3 py-3 text-genuine">{uni.genuine}</td>
                    <td className="text-center px-3 py-3 text-suspicious">{uni.suspicious}</td>
                    <td className="text-center px-3 py-3 text-fake">{uni.fake}</td>
                    <td className="text-center px-3 py-3 text-gray-400">
                      {uni.avg_trust_score != null ? `${uni.avg_trust_score}/100` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="text-center text-xs text-gray-700 py-6">
        Analytics sourced from your verified certificates. No student PII exposed.
      </footer>
    </main>
  );
}
