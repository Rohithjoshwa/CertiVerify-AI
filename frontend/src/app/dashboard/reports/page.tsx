"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  FileQuestion,
  Sparkles,
  Lock,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import {
  certificateApi,
  reportApi,
  verificationApi,
  getAccessToken,
  CertificateResponse,
  VerificationReportResponse,
  VerificationResultResponse,
} from "@/lib/api";

export default function VerificationReportsPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<string>("");
  const [loadingCerts, setLoadingCerts] = useState(true);

  // Selected report state
  const [report, setReport] = useState<VerificationReportResponse | null>(null);
  const [verification, setVerification] = useState<VerificationResultResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    certificateApi
      .list()
      .then((res) => {
        setCertificates(res.data);
        if (res.data.length > 0) {
          setSelectedCertId(res.data[0].id);
        }
      })
      .catch(() => setCertificates([]))
      .finally(() => setLoadingCerts(false));
  }, [router]);

  useEffect(() => {
    if (!selectedCertId) return;

    setLoadingReport(true);
    setReport(null);
    setVerification(null);

    Promise.allSettled([
      reportApi.get(selectedCertId),
      verificationApi.get(selectedCertId),
    ])
      .then(([reportRes, verRes]) => {
        if (reportRes.status === "fulfilled") setReport(reportRes.value.data);
        if (verRes.status === "fulfilled") setVerification(verRes.value.data);
      })
      .finally(() => setLoadingReport(false));
  }, [selectedCertId]);

  const handleGenerateReport = async () => {
    if (!selectedCertId) return;
    setGenerating(true);
    try {
      const { data } = await reportApi.generate(selectedCertId);
      setReport(data);
    } catch (err) {
      alert("Failed to generate verification report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!selectedCertId) return;
    const url = reportApi.downloadUrl(selectedCertId);
    const token = getAccessToken();
    const directUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    window.open(directUrl, "_blank");
  };

  const selectedCert = certificates.find((c) => c.id === selectedCertId);

  const handleCopyHash = (hash?: string) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">Verification Reports</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <FileText size={22} className="text-[#38bdf8]" />
            Official Verification Reports & Audit Certificates
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Generate and download cryptographically signed verification reports with SHA-256 integrity proofs.
          </p>
        </div>

        {/* Certificate Selector Dropdown */}
        <div className="space-y-1 shrink-0">
          <label className="text-[10px] font-mono text-[#8d90a0] uppercase block font-semibold">
            Select Certificate
          </label>
          <select
            value={selectedCertId}
            onChange={(e) => setSelectedCertId(e.target.value)}
            disabled={loadingCerts || certificates.length === 0}
            className="bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs px-3 py-1.5 rounded focus:outline-none focus:border-[#38bdf8] font-mono max-w-xs"
          >
            {loadingCerts ? (
              <option>Loading certificates...</option>
            ) : certificates.length === 0 ? (
              <option>No certificates available</option>
            ) : (
              certificates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.original_filename} ({c.id.slice(0, 8)})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Report Preview Layout */}
      {!selectedCert ? (
        <div className="bg-[#0b1c30] border border-[#1b2b3f] p-12 text-center rounded-[8px] space-y-3">
          <FileQuestion size={36} className="text-[#8d90a0] mx-auto opacity-50" />
          <p className="text-xs text-[#8d90a0]">No certificate selected. Please upload or pick a certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Report Document Card (8 cols) */}
          <div className="lg:col-span-8 bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b2b3f]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#102034] text-[#38bdf8] rounded border border-[#1b2b3f]">
                  <FileText size={24} />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
                    OFFICIAL REPORT PREVIEW
                  </span>
                  <h2 className="text-base font-bold text-[#d3e4fe]">{selectedCert.original_filename}</h2>
                </div>
              </div>

              {/* Status Badge */}
              {report ? (
                <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 rounded uppercase flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  REPORT GENERATED
                </span>
              ) : (
                <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/30 rounded uppercase flex items-center gap-1">
                  <AlertTriangle size={12} />
                  NOT GENERATED YET
                </span>
              )}
            </div>

            {/* Certificate Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
                <span className="text-[10px] text-[#8d90a0] block">CERTIFICATE ID</span>
                <span className="font-bold text-[#d3e4fe]">{selectedCert.id.slice(0, 12)}…</span>
              </div>
              <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
                <span className="text-[10px] text-[#8d90a0] block">FILE FORMAT</span>
                <span className="font-bold text-[#38bdf8] uppercase">{selectedCert.file_type}</span>
              </div>
              <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
                <span className="text-[10px] text-[#8d90a0] block">UPLOADED AT</span>
                <span className="text-[#8d90a0]">{new Date(selectedCert.uploaded_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] text-[#8d90a0]">
                <span>SHA-256 INTEGRITY FINGERPRINT</span>
                <button
                  onClick={() => handleCopyHash(selectedCert.sha256_hash)}
                  className="text-[#38bdf8] hover:underline flex items-center gap-1"
                >
                  {copiedHash ? <Check size={10} /> : <Copy size={10} />}
                  {copiedHash ? "Copied" : "Copy Hash"}
                </button>
              </div>
              <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded text-[11px] text-[#38bdf8] break-all">
                {selectedCert.sha256_hash}
              </div>
            </div>

            {/* Verification Pipeline Outcomes Summary */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase text-[#8d90a0] font-bold">
                Verification Pipeline Outcomes
              </h3>
              {verification ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
                    <span className="text-[10px] text-[#8d90a0] block">QR VERIFICATION</span>
                    <span className={`font-bold ${verification.qr_valid ? "text-[#4edea3]" : "text-[#ffb95f]"}`}>
                      {verification.qr_present ? (verification.qr_valid ? "VERIFIED" : "INVALID") : "NO QR"}
                    </span>
                  </div>

                  <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
                    <span className="text-[10px] text-[#8d90a0] block">BLOCKCHAIN MATCH</span>
                    <span className={`font-bold ${verification.blockchain_match ? "text-[#4edea3]" : "text-[#8d90a0]"}`}>
                      {verification.blockchain_status || "NOT REGISTERED"}
                    </span>
                  </div>

                  <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
                    <span className="text-[10px] text-[#8d90a0] block">TAMPERING SCORE</span>
                    <span className={`font-bold ${verification.tampering_score && verification.tampering_score > 30 ? "text-[#ffb4ab]" : "text-[#4edea3]"}`}>
                      {verification.tampering_score ?? 0} / 100
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded text-xs text-[#8d90a0]">
                  Verification outcome telemetry will populate after pipeline run.
                </div>
              )}
            </div>

            {/* Report Digital Signature (if generated) */}
            {report && (
              <div className="p-4 bg-[#000f21] border border-[#4edea3]/30 rounded space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#4edea3]">
                  <Lock size={14} />
                  <span>DIGITAL SIGNATURE & AUDIT REF</span>
                </div>
                <p className="font-mono text-[10px] text-[#8d90a0] break-all">
                  Sig: {report.digital_signature || `CERTIVERIFY-SIG-${report.id.slice(0, 16)}`}
                </p>
                <div className="text-[10px] font-mono text-[#8d90a0]">
                  Generated: {new Date(report.generated_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions Panel (4 cols) */}
          <div className="lg:col-span-4 bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#d3e4fe] pb-2 border-b border-[#1b2b3f]">
              Report Generation & Actions
            </h3>

            <div className="space-y-3 text-xs text-[#8d90a0]">
              <p>
                Verification reports compile all OCR field extractions, tamper ELA heatmaps, blockchain logs, and AI predictions into a signed PDF document.
              </p>

              {report ? (
                <button
                  onClick={handleDownloadReport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4edea3] hover:bg-emerald-400 text-[#000f21] font-bold text-xs rounded transition shadow-lg"
                >
                  <Download size={15} />
                  <span>Download Signed PDF Report</span>
                </button>
              ) : (
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white font-semibold text-xs rounded transition shadow-lg disabled:opacity-50"
                >
                  {generating ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  <span>{generating ? "Generating..." : "Generate PDF Report"}</span>
                </button>
              )}

              {report && (
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-[#000f21] hover:bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] font-mono text-[11px] rounded transition"
                >
                  <RefreshCw size={12} className={generating ? "animate-spin" : ""} />
                  <span>Re-Generate Report</span>
                </button>
              )}

              <Link
                href={`/dashboard/certificates/${selectedCert.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#000f21] hover:bg-[#102034] text-[#38bdf8] border border-[#1b2b3f] font-medium text-xs rounded transition"
              >
                <span>Inspect in Forensic Cockpit</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
