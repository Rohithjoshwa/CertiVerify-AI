"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, ExternalLink, ShieldCheck, Eye, Loader2, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { certificateApi, api } from "@/lib/api";

interface DocumentViewerProps {
  certificateId?: string;
  originalFilename?: string;
  filename?: string;
  fileType?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  certificateId,
  originalFilename,
  filename,
  fileType,
}) => {
  const activeFilename = filename || originalFilename || "Certificate Document";
  const [zoom, setZoom] = useState<number>(100);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!certificateId);
  const [error, setError] = useState<string | null>(null);
  const [detectedPdf, setDetectedPdf] = useState<boolean>(false);

  const previewUrl = certificateId ? certificateApi.previewUrl(certificateId) : "#";

  const fetchDocument = useCallback(async () => {
    if (!certificateId) {
      setLoading(false);
      setBlobUrl(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/v1/certificates/${certificateId}/preview`, {
        responseType: "blob",
        timeout: 15000,
      });

      const blob: Blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error("Received empty document file.");
      }

      // Determine MIME / file type
      const contentType = response.headers["content-type"] || blob.type || "";
      const isPdfType =
        contentType.toLowerCase().includes("pdf") ||
        (fileType ? fileType.toLowerCase() === "pdf" : activeFilename.toLowerCase().endsWith(".pdf"));

      setDetectedPdf(isPdfType);

      const objectUrl = URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
    } catch (err: unknown) {
      let statusDetail = "Unable to load document preview.";
      if (err && typeof err === "object") {
        const axiosErr = err as {
          response?: { status?: number; data?: { detail?: string } };
          message?: string;
          code?: string;
        };
        if (axiosErr.code === "ECONNABORTED" || axiosErr.message?.includes("timeout")) {
          statusDetail = "Preview request timed out. Click Retry Load to attempt again.";
        } else if (axiosErr.response?.status === 401) {
          statusDetail = "Status: 401 Unauthorized — Session expired or invalid token.";
        } else if (axiosErr.response?.status === 404) {
          statusDetail = "Status: 404 Not Found — The original certificate file could not be retrieved from storage.";
        } else if (axiosErr.response?.status) {
          statusDetail = `Status: ${axiosErr.response.status} — ${axiosErr.response.data?.detail || "Failed to retrieve certificate."}`;
        } else if (axiosErr.message) {
          statusDetail = axiosErr.message;
        }
      }
      setError(statusDetail);
    } finally {
      setLoading(false);
    }
  }, [certificateId, fileType, activeFilename]);

  useEffect(() => {
    let currentBlobUrl: string | null = null;
    let isSubscribed = true;

    if (!certificateId) {
      setLoading(false);
      setBlobUrl(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get(`/api/v1/certificates/${certificateId}/preview`, {
        responseType: "blob",
        timeout: 15000,
      })
      .then((response) => {
        if (!isSubscribed) return;
        const blob: Blob = response.data;
        if (!blob || blob.size === 0) {
          throw new Error("Received empty document file.");
        }

        const contentType = response.headers["content-type"] || blob.type || "";
        const isPdfType =
          contentType.toLowerCase().includes("pdf") ||
          (fileType ? fileType.toLowerCase() === "pdf" : activeFilename.toLowerCase().endsWith(".pdf"));

        setDetectedPdf(isPdfType);
        currentBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(currentBlobUrl);
      })
      .catch((err: unknown) => {
        if (!isSubscribed) return;
        let statusDetail = "Unable to load document preview.";
        if (err && typeof err === "object") {
          const axiosErr = err as {
            response?: { status?: number; data?: { detail?: string } };
            message?: string;
            code?: string;
          };
          if (axiosErr.code === "ECONNABORTED" || axiosErr.message?.includes("timeout")) {
            statusDetail = "Preview request timed out. Click Retry Load to attempt again.";
          } else if (axiosErr.response?.status === 401) {
            statusDetail = "Status: 401 Unauthorized — Session expired or invalid token.";
          } else if (axiosErr.response?.status === 404) {
            statusDetail = "Status: 404 Not Found — The original certificate file could not be retrieved from storage.";
          } else if (axiosErr.response?.status) {
            statusDetail = `Status: ${axiosErr.response.status} — ${axiosErr.response.data?.detail || "Failed to retrieve certificate."}`;
          } else if (axiosErr.message) {
            statusDetail = axiosErr.message;
          }
        }
        setError(statusDetail);
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [certificateId, fileType, activeFilename]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleReset = () => setZoom(100);

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4 flex flex-col h-full">
      {/* Viewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-[#38bdf8]" />
          <div>
            <h2 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
              Document Ingestion Viewer
            </h2>
            {certificateId && (
              <p className="text-[10px] text-[#8d90a0] font-mono truncate max-w-xs sm:max-w-md">
                <span className="text-[#38bdf8]">{activeFilename}</span> • ID: {certificateId.slice(0, 12)}…
              </p>
            )}
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 60 || loading || !!error || !blobUrl}
            className="p-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] rounded-[3px] border border-[#1b2b3f] transition disabled:opacity-40"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="px-2 py-1 text-[11px] font-mono text-[#c3c6d7] bg-[#000f21] border border-[#1b2b3f] rounded-[3px] min-w-[50px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200 || loading || !!error || !blobUrl}
            className="p-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] rounded-[3px] border border-[#1b2b3f] transition disabled:opacity-40"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={handleReset}
            disabled={loading || !!error || !blobUrl}
            className="p-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] rounded-[3px] border border-[#1b2b3f] transition disabled:opacity-40"
            title="Reset Zoom"
          >
            <RotateCcw size={13} />
          </button>
          {certificateId && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-[#2563eb]/20 hover:bg-[#2563eb]/30 text-[#38bdf8] rounded-[3px] border border-[#2563eb]/40 transition ml-1"
              title="Open in Fullscreen Tab"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Main Document Canvas Viewport */}
      <div className="relative flex-1 min-h-[420px] max-h-[600px] overflow-auto bg-[#000f21] border border-[#1b2b3f] rounded-[6px] flex items-center justify-center p-4">
        {!certificateId ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md">
            <FileText size={32} className="text-[#8d90a0] opacity-40 mx-auto" />
            <div>
              <p className="text-xs font-semibold text-[#d3e4fe] mb-1">No Document Selected</p>
              <p className="text-[11px] text-[#8d90a0] leading-relaxed font-mono">
                Select a certificate or marksheet to inspect its document preview.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <Loader2 size={28} className="animate-spin text-[#38bdf8]" />
            <p className="text-xs text-[#8d90a0] font-mono">Loading document preview...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md">
            <AlertCircle size={32} className="text-[#f87171]" />
            <div>
              <p className="text-xs font-semibold text-[#f87171] mb-1">Unable to preview document</p>
              <p className="text-[11px] text-[#8d90a0] leading-relaxed font-mono">{error}</p>
            </div>
            <button
              onClick={fetchDocument}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#2563eb]/40 rounded-[4px] text-xs font-mono transition cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Retry Load</span>
            </button>
          </div>
        ) : blobUrl ? (
          detectedPdf ? (
            <iframe
              src={`${blobUrl}#toolbar=0`}
              title={activeFilename}
              className="w-full h-full min-h-[420px] rounded border-none"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blobUrl}
              alt={activeFilename}
              className="max-w-full max-h-full object-contain rounded transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center text-xs font-mono text-[#8d90a0]">
            <p>No preview stream available for this document.</p>
            <button
              onClick={fetchDocument}
              className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 bg-[#102034] text-[#38bdf8] border border-[#1b2b3f] rounded text-[11px]"
            >
              <RefreshCw size={11} /> Retry Load
            </button>
          </div>
        )}
      </div>

      {/* Bounding Box Honest Transparency Note */}
      <div className="text-[11px] text-[#8d90a0] font-sans bg-[#102034]/60 border border-[#1b2b3f] rounded-[4px] p-2.5 flex items-start gap-2">
        <ShieldCheck size={14} className="text-[#38bdf8] shrink-0 mt-0.5" />
        <div>
          <span className="text-[#d3e4fe] font-medium font-sans">Neural Ingestion Pass:</span>{" "}
          Coordinates calculated by EasyOCR+Tesseract are normalized into the structured field table.
          Ephemeral bounding boxes are not stored in the database to optimize throughput.
        </div>
      </div>
    </div>
  );
};
