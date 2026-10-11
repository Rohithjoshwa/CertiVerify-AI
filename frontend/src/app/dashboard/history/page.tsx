"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  Clock,
  Search,
  RefreshCw,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Download,
  FileQuestion,
} from "lucide-react";
import { certificateApi, CertificateHistoryItem, getAccessToken, reportApi } from "@/lib/api";

export default function VerificationHistoryPage() {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<CertificateHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await certificateApi.getHistory();
      setHistoryItems(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load verification history.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredItems = historyItems.filter((item) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      item.filename.toLowerCase().includes(q) ||
      item.certificate_id.toLowerCase().includes(q) ||
      (item.prediction || "").toLowerCase().includes(q) ||
      (item.document_type || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">Verification History</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <History size={22} className="text-[#38bdf8]" />
            Chronological Verification History
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Complete ledger of past verification events, forensic outcomes, and generated audit reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2 bg-[#000f21] hover:bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded"
            title="Refresh history"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main History Table */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden space-y-0">
        <div className="p-4 border-b border-[#1b2b3f] flex items-center justify-between gap-3 bg-[#0b1c30]">
          <div className="relative w-full md:w-80">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0]" />
            <input
              type="text"
              placeholder="Search history by filename or UUID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <span className="text-xs font-mono text-[#8d90a0]">
            Showing {filteredItems.length} of {historyItems.length} events
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 size={24} className="animate-spin text-[#38bdf8] mx-auto" />
            <p className="text-xs text-[#8d90a0]">Loading verification history ledger...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-xs text-[#ffb4ab] space-y-2">
            <AlertTriangle size={24} className="mx-auto" />
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileQuestion size={36} className="text-[#8d90a0] mx-auto opacity-50" />
            <p className="text-xs text-[#8d90a0]">No verification history records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#000f21] text-[#8d90a0] border-b border-[#1b2b3f] font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Doc Type</th>
                  <th className="px-4 py-3">Trust Score</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2b3f]">
                {filteredItems.map((item, idx) => (
                  <tr key={`${item.certificate_id}-${idx}`} className="hover:bg-[#102034]/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-[#8d90a0] whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#d3e4fe] truncate max-w-xs">{item.filename}</div>
                      <div className="font-mono text-[9px] text-[#8d90a0] uppercase">{item.file_type}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#38bdf8]">
                      {item.document_type || "Unclassified"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      {item.trust_score != null ? (
                        <span className={item.trust_score >= 70 ? "text-[#4edea3]" : "text-[#ffb95f]"}>
                          {Math.round(item.trust_score)} / 100
                        </span>
                      ) : (
                        <span className="text-[#8d90a0]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.prediction === "genuine"
                          ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                          : item.prediction === "suspicious"
                          ? "bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/30"
                          : item.prediction === "fake"
                          ? "bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30"
                          : "bg-[#102034] text-[#8d90a0]"
                      }`}>
                        {item.prediction || "COMPLETED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/certificates/${item.certificate_id}`}
                        className="p-1 text-[#38bdf8] hover:bg-[#102034] rounded inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>Cockpit</span>
                        <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
