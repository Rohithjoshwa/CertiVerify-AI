"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, X, ShieldAlert } from "lucide-react";
import {
  certificateApi,
  CertificateResponse,
  getAccessToken,
  authApi,
  documentTypeApi,
  ocrApi,
} from "@/lib/api";
import {
  UploadHeader,
  CertificateDropzone,
  StagedFilesList,
  BlockchainRegistryCard,
  RecentUploadsLedger,
} from "@/components/upload";

export default function UploadPage() {
  const router = useRouter();

  // ── Core State ──────────────────────────────────────────────────────────
  const [pending, setPending] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [docTypes, setDocTypes] = useState<
    Record<string, { label: string; confidence: number } | "loading" | undefined>
  >({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Manual Doc-Type Selection ────────────────────────────────────────────
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [pendingDocTypes, setPendingDocTypes] = useState<string[]>([]);

  // ── OCR State ───────────────────────────────────────────────────────────
  const [ocrRunning, setOcrRunning] = useState<Record<string, boolean>>({});
  const [certDocTypes, setCertDocTypes] = useState<Record<string, string>>({});

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    authApi
      .me()
      .then((res) => setUserName(res.data.full_name))
      .catch(() => router.push("/login"));
    refreshList();
  }, [router]);

  const refreshList = async () => {
    try {
      const { data } = await certificateApi.list();
      setCertificates(data);
      data.forEach((cert) => {
        documentTypeApi
          .get(cert.id)
          .then((res) =>
            setDocTypes((prev) => ({
              ...prev,
              [cert.id]: {
                label: res.data.predicted_type,
                confidence: res.data.confidence_score,
              },
            }))
          )
          .catch(() => {
            // Not classified yet
          });
      });
    } catch {
      // Non-fatal list sync failure
    }
  };

  // ── Dropzone Handlers ────────────────────────────────────────────────────
  const onDrop = useCallback(
    (accepted: File[]) => {
      setPending((prev) => [...prev, ...accepted]);
      setPendingDocTypes((prev) => [
        ...prev,
        ...accepted.map(() => selectedDocType),
      ]);
    },
    [selectedDocType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 15 * 1024 * 1024,
  });

  const removePending = (index: number) => {
    setPending((prev) => prev.filter((_, i) => i !== index));
    setPendingDocTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const clearPending = () => {
    setPending([]);
    setPendingDocTypes([]);
    setError(null);
  };

  const updatePendingDocType = (index: number, type: string) => {
    setPendingDocTypes((prev) => prev.map((t, i) => (i === index ? type : t)));
  };

  // ── Upload Execution ─────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (pending.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const { data } = await certificateApi.upload(pending);
      // Store the doc-type selection for each newly uploaded cert
      data.certificates.forEach((cert, idx) => {
        const dt = pendingDocTypes[idx] || "";
        if (dt) {
          setCertDocTypes((prev) => ({ ...prev, [cert.id]: dt }));
        }
      });
      setPending([]);
      setPendingDocTypes([]);
      await refreshList();
      setToast({
        type: "success",
        message: `Successfully ingested ${data.certificates.length} credential(s) into forensic ledger. Redirecting to verification cockpit...`,
      });

      if (data.certificates.length > 0) {
        const targetId = data.certificates[0].id;
        if (typeof window !== "undefined") {
          localStorage.setItem("cv_current_certificate_id", targetId);
        }
        setTimeout(() => {
          router.push(`/dashboard/certificates/${targetId}`);
        }, 800);
      }
    } catch (err: unknown) {
      let message =
        "Upload failed. Please check file types (PDF/JPG/PNG) and size (max 15 MB) and try again.";
      if (err && typeof err === "object" && "response" in err) {
        const resp = (
          err as { response?: { status?: number; data?: { detail?: string } } }
        ).response;
        if (resp?.status === 401) message = "Session expired. Please log in again.";
        else if (resp?.status === 403)
          message = "Access denied. Please verify your email first.";
        else if (resp?.status === 413)
          message = "File too large. Maximum allowed size is 15 MB.";
        else if (resp?.data?.detail) message = resp.data.detail;
      } else if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code?: string }).code;
        if (code === "ERR_NETWORK")
          message = "Cannot reach the server. Please check your connection.";
        else if (code === "ECONNABORTED")
          message = "Upload timed out. Please try again.";
      }
      setError(message);
    } finally {
      setUploading(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  // ── OCR Execution ────────────────────────────────────────────────────────
  const handleRunOcr = async (certId: string) => {
    const dt = certDocTypes[certId] || undefined;
    setOcrRunning((prev) => ({ ...prev, [certId]: true }));
    try {
      await ocrApi.extract(certId, dt);
      setToast({
        type: "success",
        message: "Neural OCR extraction complete!",
      });
    } catch {
      setToast({
        type: "error",
        message: "OCR extraction failed. Please try again.",
      });
    } finally {
      setOcrRunning((prev) => ({ ...prev, [certId]: false }));
      setTimeout(() => setToast(null), 4000);
    }
  };

  // ── Delete Execution ─────────────────────────────────────────────────────
  const handleDelete = async (id: string, filename: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${filename}"?\n\nThis will permanently remove the certificate and all associated data (OCR, verification, report).`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setToast(null);
    try {
      await certificateApi.remove(id);
      setCertificates((prev) => prev.filter((c) => c.id !== id));
      setDocTypes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await refreshList();
      setToast({
        type: "success",
        message: `"${filename}" was deleted successfully.`,
      });
    } catch (err: unknown) {
      let message = "Failed to delete the certificate. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        const s = (err as { response?: { status?: number } }).response?.status;
        if (s === 404) message = "Certificate not found. It may have already been deleted.";
        else if (s === 401 || s === 403)
          message = "You are not authorized to delete this certificate.";
        else if (s && s >= 500) message = "Server error. Please try again later.";
      }
      setToast({ type: "error", message });
    } finally {
      setDeletingId(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // The latest certificate in the list (if any) feeds the real cryptographic anchor
  const latestCertificate = certificates.length > 0 ? certificates[0] : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          id="upload-toast"
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[6px] shadow-2xl border text-xs font-mono font-medium transition-all ${
            toast.type === "success"
              ? "bg-[#0b1c30] border-[#4edea3]/40 text-[#4edea3]"
              : "bg-[#0b1c30] border-[#ffb4ab]/40 text-[#ffb4ab]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-[#8d90a0] hover:text-[#d3e4fe]"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 1. Header Section */}
      <UploadHeader
        userName={userName}
        totalIngested={certificates.length}
      />

      {/* 2. Ingestion Workspace: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Staged Files (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <CertificateDropzone
            selectedDocType={selectedDocType}
            onDocTypeChange={setSelectedDocType}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            disabled={uploading}
          />

          <StagedFilesList
            pending={pending}
            pendingDocTypes={pendingDocTypes}
            uploading={uploading}
            error={error}
            onRemove={removePending}
            onClearAll={clearPending}
            onUpdateDocType={updatePendingDocType}
            onUpload={handleUpload}
          />
        </div>

        {/* Right Column: Blockchain Registry Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <BlockchainRegistryCard latestCertificate={latestCertificate} />

          {/* Quick Operational Info */}
          <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-[#ffb95f]" />
              <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
                Ingestion Guidelines
              </h3>
            </div>
            <ul className="text-xs text-[#8d90a0] space-y-2 font-sans list-disc list-inside">
              <li>
                <strong className="text-[#c3c6d7]">Supported Credentials:</strong> Degrees,
                transcripts, marksheets, diplomas, Aadhaar cards, and resumes.
              </li>
              <li>
                <strong className="text-[#c3c6d7]">Multi-File Batches:</strong> Multiple
                documents dropped together are linked into an audit set for cross-document
                comparison.
              </li>
              <li>
                <strong className="text-[#c3c6d7]">Integrity Hash:</strong> Every document
                generates a SHA-256 fingerprint used for duplicate checks and on-chain verification.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Ingested Credentials Ledger */}
      <RecentUploadsLedger
        certificates={certificates}
        docTypes={docTypes}
        ocrRunning={ocrRunning}
        certDocTypes={certDocTypes}
        deletingId={deletingId}
        onRunOcr={handleRunOcr}
        onDelete={handleDelete}
        onCertDocTypeChange={(certId, type) =>
          setCertDocTypes((prev) => ({ ...prev, [certId]: type }))
        }
      />
    </div>
  );
}
