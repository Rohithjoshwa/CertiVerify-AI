"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  RefreshCw,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Database,
  Info,
  FileQuestion,
  Activity,
} from "lucide-react";
import {
  certificateApi,
  evidenceApi,
  getAccessToken,
  CertificateResponse,
  EvidenceItemResponse,
} from "@/lib/api";

type UIState = "LOADING" | "SUCCESS" | "EMPTY" | "ERROR" | "IN_PROGRESS";

export default function EvidenceExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
          <Loader2 size={32} className="animate-spin text-[#4edea3]" />
          <span className="text-xs font-mono text-[#8d90a0] mt-3">Loading Evidence Explorer...</span>
        </div>
      }
    >
      <EvidenceExplorerContent />
    </Suspense>
  );
}

function EvidenceExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCertId = searchParams?.get("certId") || "";

  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<string>(initialCertId);
  const [loadingCerts, setLoadingCerts] = useState(true);

  // Evidence state
  const [uiState, setUiState] = useState<UIState>("LOADING");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItemResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [copiedHash, setCopiedHash] = useState(false);

  // Selected Detail Panel
  const [selectedItem, setSelectedItem] = useState<EvidenceItemResponse | null>(null);

  // Fetch Certificate List
  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    certificateApi
      .list()
      .then((res) => {
        setCertificates(res.data);
        if (res.data.length > 0 && !selectedCertId) {
          setSelectedCertId(res.data[0].id);
        }
      })
      .catch(() => setCertificates([]))
      .finally(() => setLoadingCerts(false));
  }, [router, selectedCertId]);

  // Fetch Evidence Items for Selected Certificate
  const fetchEvidence = useCallback(async () => {
    if (!selectedCertId) {
      setUiState("EMPTY");
      setEvidenceItems([]);
      return;
    }

    setUiState("LOADING");
    setErrorMessage(null);

    try {
      const params: { evidence_type?: string; page: number; page_size: number } = {
        page,
        page_size: pageSize,
      };
      if (filterType !== "all") {
        params.evidence_type = filterType;
      }

      const { data } = await evidenceApi.getEvidence(selectedCertId, params);

      if (!data || !data.items || data.items.length === 0) {
        // Check if certificate has a running job
        try {
          const jobsRes = await evidenceApi.getJobs(selectedCertId);
          const activeJob = jobsRes.data.find((j) => j.status === "PROCESSING" || j.status === "QUEUED");
          if (activeJob) {
            setUiState("IN_PROGRESS");
            setEvidenceItems([]);
            return;
          }
        } catch {
          // ignore job fetch error
        }
        setUiState("EMPTY");
        setEvidenceItems([]);
        setTotalItems(0);
        setTotalPages(1);
        return;
      }

      setEvidenceItems(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages || 1);
      setUiState("SUCCESS");

      if (!selectedItem && data.items.length > 0) {
        setSelectedItem(data.items[0]);
      }
    } catch (err: any) {
      console.error("Evidence fetch failed:", err);
      setErrorMessage(err?.response?.data?.detail || "Unable to retrieve evidence records for this certificate.");
      setUiState("ERROR");
    }
  }, [selectedCertId, filterType, page, pageSize, selectedItem]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const filteredItems = evidenceItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.evidence_id.toLowerCase().includes(q) ||
      item.explanation.toLowerCase().includes(q) ||
      item.algorithm_engine.toLowerCase().includes(q) ||
      (item.document_hash || "").toLowerCase().includes(q);

    const matchesStage = filterStage === "all" || item.stage.toLowerCase() === filterStage.toLowerCase();

    return matchesQuery && matchesStage;
  });

  const selectedCert = certificates.find((c) => c.id === selectedCertId);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const renderResultBadge = (result: string) => {
    const res = result.toUpperCase();
    if (res === "PASS" || res === "VERIFIED" || res === "MATCH" || res === "GENUINE" || res === "CONSISTENT") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 uppercase">
          <Check size={10} />
          {result}
        </span>
      );
    }
    if (res === "FAIL" || res === "FORGERY" || res === "HIGH_RISK" || res === "MISMATCH" || res === "TAMPERED") {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 uppercase">
          <ShieldAlert size={10} />
          {result}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/30 uppercase">
        <AlertTriangle size={10} />
        {result}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Certificate Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#4edea3]">Evidence Explorer</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Database size={22} className="text-[#4edea3]" />
            Explainable AI Evidence Explorer
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Cryptographic provenance, neural engine signals, and explainable evidence trail for every verification verdict.
          </p>
        </div>

        {/* Certificate Picker Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#8d90a0] uppercase block font-semibold">
              Select Certificate Context
            </label>
            <select
              value={selectedCertId}
              onChange={(e) => {
                setSelectedCertId(e.target.value);
                setSelectedItem(null);
                setPage(1);
              }}
              disabled={loadingCerts || certificates.length === 0}
              className="bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs px-3 py-1.5 rounded-[4px] focus:outline-none focus:border-[#4edea3] max-w-xs font-mono"
            >
              {loadingCerts ? (
                <option>Loading certificates...</option>
              ) : certificates.length === 0 ? (
                <option>No certificates found</option>
              ) : (
                certificates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.original_filename} ({c.id.slice(0, 8)})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={fetchEvidence}
            className="p-2 bg-[#000f21] hover:bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded-[4px] mt-4"
            title="Reload Evidence"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Selected Certificate Summary Bar */}
      {selectedCert && (
        <div className="bg-[#0b1c30] border border-[#1b2b3f] p-4 rounded-[8px] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#102034] text-[#4edea3] rounded border border-[#1b2b3f]">
              <FileText size={18} />
            </div>
            <div>
              <div className="font-semibold text-[#d3e4fe] text-sm">{selectedCert.original_filename}</div>
              <div className="font-mono text-[10px] text-[#8d90a0] mt-0.5">
                Format: <span className="uppercase text-[#c3c6d7]">{selectedCert.file_type}</span> | Size: {(selectedCert.file_size_bytes / 1024).toFixed(1)} KB | Uploaded: {new Date(selectedCert.uploaded_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-2 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span className="text-[10px] text-[#8d90a0] block">SHA-256 HASH</span>
              <span className="text-[#38bdf8] font-bold">
                {selectedCert.sha256_hash ? `${selectedCert.sha256_hash.slice(0, 12)}…${selectedCert.sha256_hash.slice(-8)}` : "Pending"}
              </span>
            </div>

            <Link
              href={`/dashboard/certificates/${selectedCert.id}`}
              className="flex items-center gap-1 px-3 py-2 bg-[#2563eb] hover:bg-blue-600 text-white rounded font-semibold text-xs transition"
            >
              <span>Inspect Cockpit</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Main Evidence Workbench: Filters + List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter & Evidence List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b1c30] border border-[#1b2b3f] p-3 rounded-[8px] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0]" />
              <input
                type="text"
                placeholder="Search evidence ID, engine, explanation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#000f21] border border-[#1b2b3f] text-[#c3c6d7] text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-[#4edea3]"
              >
                <option value="all">All Types</option>
                <option value="ocr">OCR Data</option>
                <option value="qr">QR Code</option>
                <option value="blockchain">Blockchain</option>
                <option value="tampering">Tamper ELA</option>
                <option value="duplicate">Duplicate</option>
                <option value="fraud_prediction">Fraud Prediction</option>
              </select>

              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="bg-[#000f21] border border-[#1b2b3f] text-[#c3c6d7] text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-[#4edea3]"
              >
                <option value="all">All Stages</option>
                <option value="document_analysis">Analysis</option>
                <option value="ocr">OCR</option>
                <option value="qr_verification">QR Verify</option>
                <option value="blockchain_verification">Blockchain</option>
                <option value="tamper_analysis">Tampering</option>
                <option value="duplicate_detection">Duplicate</option>
                <option value="fraud_analysis">Fraud</option>
              </select>
            </div>
          </div>

          <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden">
            {uiState === "LOADING" && (
              <div className="p-12 text-center space-y-3">
                <Loader2 size={28} className="animate-spin text-[#4edea3] mx-auto" />
                <p className="text-xs font-mono text-[#8d90a0]">Fetching explainable AI evidence records...</p>
              </div>
            )}

            {uiState === "IN_PROGRESS" && (
              <div className="p-10 text-center space-y-3">
                <Activity size={32} className="text-[#38bdf8] animate-pulse mx-auto" />
                <h3 className="text-sm font-semibold text-[#d3e4fe]">Verification Job In Progress</h3>
                <p className="text-xs text-[#8d90a0] max-w-sm mx-auto">
                  Verification stages are actively running. Evidence records will populate automatically as each stage completes.
                </p>
                <button
                  onClick={fetchEvidence}
                  className="px-3 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded"
                >
                  Refresh Telemetry
                </button>
              </div>
            )}

            {uiState === "EMPTY" && (
              <div className="p-12 text-center space-y-3">
                <FileQuestion size={36} className="text-[#8d90a0] mx-auto opacity-50" />
                <h3 className="text-sm font-semibold text-[#d3e4fe]">No Evidence Records Found</h3>
                <p className="text-xs text-[#8d90a0] max-w-sm mx-auto">
                  No evidence records match your current filters or verification has not been initiated for this certificate yet.
                </p>
                <Link
                  href={selectedCertId ? `/dashboard/certificates/${selectedCertId}` : "/dashboard/upload"}
                  className="inline-block px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
                >
                  Run Verification Pipeline →
                </Link>
              </div>
            )}

            {uiState === "ERROR" && (
              <div className="p-10 text-center space-y-3 bg-[#93000a]/10 border border-[#93000a]/30 m-4 rounded">
                <AlertTriangle size={32} className="text-[#ffb4ab] mx-auto" />
                <h3 className="text-sm font-semibold text-[#ffb4ab]">Failed to Load Evidence</h3>
                <p className="text-xs text-[#8d90a0] max-w-sm mx-auto">
                  {errorMessage || "An unexpected error occurred while querying the evidence ledger."}
                </p>
                <button
                  onClick={fetchEvidence}
                  className="px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw size={13} />
                  Retry Evidence Load
                </button>
              </div>
            )}

            {uiState === "SUCCESS" && (
              <div className="divide-y divide-[#1b2b3f]">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8d90a0]">
                    No evidence items matched search filter "{searchQuery}".
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                          isSelected ? "bg-[#102034] border-l-4 border-[#4edea3]" : "hover:bg-[#000f21]/60"
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            {renderResultBadge(item.result)}
                            <span className="font-mono text-[11px] font-bold text-[#d3e4fe]">
                              {item.evidence_id}
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#000f21] border border-[#1b2b3f] rounded text-[#8d90a0] uppercase">
                              {item.evidence_type}
                            </span>
                          </div>

                          <p className="text-xs text-[#c3c6d7] line-clamp-2 leading-relaxed font-sans">
                            {item.explanation}
                          </p>

                          <div className="flex items-center gap-3 font-mono text-[10px] text-[#8d90a0]">
                            <span>Engine: <strong className="text-[#38bdf8]">{item.algorithm_engine}</strong></span>
                            <span>Confidence: <strong className="text-[#4edea3]">{Math.round(item.confidence * 100)}%</strong></span>
                            <span>Stage: <strong className="text-[#c3c6d7]">{item.stage}</strong></span>
                          </div>
                        </div>

                        <ChevronRight size={16} className={`shrink-0 ${isSelected ? "text-[#4edea3]" : "text-[#8d90a0]"}`} />
                      </div>
                    );
                  })
                )}

                {totalPages > 1 && (
                  <div className="p-3 bg-[#000f21] border-t border-[#1b2b3f] flex items-center justify-between text-xs font-mono text-[#8d90a0]">
                    <span>Page {page} of {totalPages} ({totalItems} records)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-2.5 py-1 bg-[#0b1c30] border border-[#1b2b3f] rounded disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-2.5 py-1 bg-[#0b1c30] border border-[#1b2b3f] rounded disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Evidence Detail Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedItem ? (
            <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
                <div>
                  <span className="font-mono text-[9px] text-[#8d90a0] uppercase tracking-wider block font-semibold">
                    EVIDENCE RECORD DETAIL
                  </span>
                  <h3 className="text-sm font-bold text-[#d3e4fe] font-mono mt-0.5">
                    {selectedItem.evidence_id}
                  </h3>
                </div>
                {renderResultBadge(selectedItem.result)}
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded space-y-0.5">
                  <span className="text-[10px] text-[#8d90a0] block">CONFIDENCE SCORE</span>
                  <div className="text-lg font-bold text-[#4edea3]">
                    {Math.round(selectedItem.confidence * 100)}%
                  </div>
                </div>

                <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded space-y-0.5">
                  <span className="text-[10px] text-[#8d90a0] block">ALGORITHM ENGINE</span>
                  <div className="text-xs font-bold text-[#38bdf8] truncate">
                    {selectedItem.algorithm_engine}
                  </div>
                  <div className="text-[9px] text-[#8d90a0]">
                    v{selectedItem.algorithm_version || "1.0.0"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8d90a0] uppercase font-semibold block">
                  Human-Readable Explanation
                </label>
                <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded text-xs text-[#d3e4fe] leading-relaxed">
                  {selectedItem.explanation}
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-[#8d90a0]">
                  <span>DOCUMENT HASH (SHA-256)</span>
                  <button
                    onClick={() => handleCopyHash(selectedItem.document_hash)}
                    className="text-[#38bdf8] hover:underline flex items-center gap-1"
                  >
                    {copiedHash ? <Check size={10} /> : <Copy size={10} />}
                    {copiedHash ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded text-[11px] text-[#38bdf8] break-all font-mono">
                  {selectedItem.document_hash || "N/A"}
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <label className="text-[10px] text-[#8d90a0] uppercase font-semibold block">
                  Provenential Telemetry
                </label>
                <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#1b2b3f]/60">
                    <span className="text-[#8d90a0]">Stage:</span>
                    <span className="text-[#d3e4fe] font-semibold">{selectedItem.stage}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1b2b3f]/60">
                    <span className="text-[#8d90a0]">Source:</span>
                    <span className="text-[#d3e4fe] font-semibold">{selectedItem.source}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1b2b3f]/60">
                    <span className="text-[#8d90a0]">Evidence Type:</span>
                    <span className="text-[#38bdf8] font-semibold">{selectedItem.evidence_type}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#8d90a0]">Logged At:</span>
                    <span className="text-[#8d90a0]">{new Date(selectedItem.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedItem.details && (
                <div className="space-y-1.5 font-mono text-xs">
                  <label className="text-[10px] text-[#8d90a0] uppercase font-semibold block">
                    Engine Details JSON
                  </label>
                  <pre className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded text-[10px] text-[#4edea3] overflow-x-auto max-h-48">
                    {JSON.stringify(selectedItem.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-8 text-center text-xs text-[#8d90a0] space-y-2">
              <Info size={28} className="mx-auto text-[#38bdf8] opacity-60" />
              <p>Select any evidence item from the list to view provenance, confidence, and engine telemetry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
