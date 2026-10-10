"use client";

import React, { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Eye,
  Info,
  Layers,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { certificateApi, verificationApi, api } from "@/lib/api";

interface DocumentPreviewCanvasProps {
  certificateId: string;
  filename?: string;
  fileType?: string;
  hasElaHeatmap?: boolean;
}

export const DocumentPreviewCanvas: React.FC<DocumentPreviewCanvasProps> = ({
  certificateId,
  filename = "Certificate Document",
  fileType,
  hasElaHeatmap = false,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<"document" | "ela">("document");
  
  const [docBlobUrl, setDocBlobUrl] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState<boolean>(true);
  const [docError, setDocError] = useState<string | null>(null);
  const [detectedPdf, setDetectedPdf] = useState<boolean>(false);

  const [elaBlobUrl, setElaBlobUrl] = useState<string | null>(null);
  const [elaLoading, setElaLoading] = useState<boolean>(false);
  const [elaError, setElaError] = useState<string | null>(null);

  const previewUrl = certificateApi.previewUrl(certificateId);
  const elaUrl = verificationApi.elaHeatmapUrl(certificateId);

  // Fetch document preview Blob
  const fetchDocBlob = async () => {
    setDocLoading(true);
    setDocError(null);
    try {
      const response = await api.get(`/api/v1/certificates/${certificateId}/preview`, {
        responseType: "blob",
      });
      const blob: Blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error("Received empty document file.");
      }

      const contentType = response.headers["content-type"] || blob.type || "";
      const isPdfType =
        contentType.toLowerCase().includes("pdf") ||
        (fileType ? fileType.toLowerCase() === "pdf" : filename.toLowerCase().endsWith(".pdf"));

      setDetectedPdf(isPdfType);

      const objectUrl = URL.createObjectURL(blob);
      setDocBlobUrl(objectUrl);
    } catch (err: unknown) {
      let statusDetail = "Unable to preview document.";
      if (err && typeof err === "object") {
        const axiosErr = err as { response?: { status?: number; data?: { detail?: string } }; message?: string };
        if (axiosErr.response?.status === 401) {
          statusDetail = "Status: 401 Unauthorized — Session expired or invalid token.";
        } else if (axiosErr.response?.status === 404) {
          statusDetail = "Status: 404 Not Found — The original certificate file could not be retrieved.";
        } else if (axiosErr.response?.status) {
          statusDetail = `Status: ${axiosErr.response.status} — ${axiosErr.response.data?.detail || "Failed to load file."}`;
        } else if (axiosErr.message) {
          statusDetail = axiosErr.message;
        }
      }
      setDocError(statusDetail);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    let currentBlobUrl: string | null = null;
    let isSubscribed = true;

    const loadDoc = async () => {
      setDocLoading(true);
      setDocError(null);
      try {
        const response = await api.get(`/api/v1/certificates/${certificateId}/preview`, {
          responseType: "blob",
        });
        if (!isSubscribed) return;

        const blob: Blob = response.data;
        if (!blob || blob.size === 0) {
          throw new Error("Received empty document file.");
        }

        const contentType = response.headers["content-type"] || blob.type || "";
        const isPdfType =
          contentType.toLowerCase().includes("pdf") ||
          (fileType ? fileType.toLowerCase() === "pdf" : filename.toLowerCase().endsWith(".pdf"));

        setDetectedPdf(isPdfType);

        currentBlobUrl = URL.createObjectURL(blob);
        setDocBlobUrl(currentBlobUrl);
      } catch (err: unknown) {
        if (!isSubscribed) return;
        let statusDetail = "Unable to preview document.";
        if (err && typeof err === "object") {
          const axiosErr = err as { response?: { status?: number; data?: { detail?: string } }; message?: string };
          if (axiosErr.response?.status === 401) {
            statusDetail = "Status: 401 Unauthorized — Session expired or invalid token.";
          } else if (axiosErr.response?.status === 404) {
            statusDetail = "Status: 404 Not Found — The original certificate file could not be retrieved.";
          } else if (axiosErr.response?.status) {
            statusDetail = `Status: ${axiosErr.response.status} — ${axiosErr.response.data?.detail || "Failed to load file."}`;
          } else if (axiosErr.message) {
            statusDetail = axiosErr.message;
          }
        }
        setDocError(statusDetail);
      } finally {
        if (isSubscribed) setDocLoading(false);
      }
    };

    loadDoc();

    return () => {
      isSubscribed = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [certificateId, fileType, filename]);

  // Fetch ELA heatmap Blob when viewMode switches to ELA
  const fetchElaBlob = async () => {
    setElaLoading(true);
    setElaError(null);
    try {
      const response = await api.get(`/api/v1/certificates/${certificateId}/ela-heatmap`, {
        responseType: "blob",
      });
      const blob: Blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error("ELA Heatmap empty.");
      }
      const objectUrl = URL.createObjectURL(blob);
      setElaBlobUrl(objectUrl);
    } catch {
      setElaError("ELA Heatmap graphic unavailable or generating.");
    } finally {
      setElaLoading(false);
    }
  };

  useEffect(() => {
    let currentElaUrl: string | null = null;
    let isSubscribed = true;

    if (viewMode === "ela" && hasElaHeatmap) {
      const loadEla = async () => {
        setElaLoading(true);
        setElaError(null);
        try {
          const response = await api.get(`/api/v1/certificates/${certificateId}/ela-heatmap`, {
            responseType: "blob",
          });
          if (!isSubscribed) return;

          const blob: Blob = response.data;
          currentElaUrl = URL.createObjectURL(blob);
          setElaBlobUrl(currentElaUrl);
        } catch {
          if (!isSubscribed) return;
          setElaError("ELA Heatmap graphic unavailable or generating.");
        } finally {
          if (isSubscribed) setElaLoading(false);
        }
      };

      loadEla();
    }

    return () => {
      isSubscribed = false;
      if (currentElaUrl) {
        URL.revokeObjectURL(currentElaUrl);
      }
    };
  }, [viewMode, certificateId, hasElaHeatmap]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleReset = () => setZoom(100);

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 flex flex-col h-full space-y-3">
      {/* Canvas Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <Eye size={15} className="text-[#38bdf8]" />
          <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Ingestion Canvas Viewport
          </h3>
          {hasElaHeatmap && (
            <div className="flex items-center gap-1 ml-2 bg-[#000f21] p-0.5 rounded-[4px] border border-[#1b2b3f]">
              <button
                onClick={() => setViewMode("document")}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-[3px] transition ${
                  viewMode === "document"
                    ? "bg-[#2563eb] text-white"
                    : "text-[#8d90a0] hover:text-[#d3e4fe]"
                }`}
              >
                Document
              </button>
              <button
                onClick={() => setViewMode("ela")}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-[3px] transition ${
                  viewMode === "ela"
                    ? "bg-[#2563eb] text-white"
                    : "text-[#8d90a0] hover:text-[#d3e4fe]"
                }`}
              >
                ELA Heatmap
              </button>
            </div>
          )}
        </div>

        {/* Zoom & Expansion Utilities */}
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 60 || docLoading || !!docError}
            className="p-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] rounded-[3px] border border-[#1b2b3f] transition disabled:opacity-40"
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <span className="px-2 py-0.5 text-[11px] font-mono text-[#c3c6d7] bg-[#000f21] border border-[#1b2b3f] rounded-[3px] min-w-[46px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200 || docLoading || !!docError}
            className="p-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] rounded-[3px] border border-[#1b2b3f] transition disabled:opacity-40"
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={handleReset}
            disabled={docLoading || !!docError}
            className="p-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] rounded-[3px] border border-[#1b2b3f] transition disabled:opacity-40"
            title="Reset Zoom"
          >
            <RotateCcw size={12} />
          </button>
          <a
            href={viewMode === "ela" ? elaUrl : previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-[#2563eb]/20 hover:bg-[#2563eb]/30 text-[#38bdf8] rounded-[3px] border border-[#2563eb]/40 transition ml-1"
            title="Open Fullscreen"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Main Document Viewport Area */}
      <div className="relative flex-1 min-h-[460px] max-h-[640px] overflow-auto bg-[#000f21] border border-[#1b2b3f] rounded-[6px] flex items-center justify-center p-3">
        {viewMode === "ela" ? (
          elaLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
              <Loader2 size={24} className="animate-spin text-[#38bdf8]" />
              <p className="text-xs text-[#8d90a0] font-mono">Loading ELA Heatmap...</p>
            </div>
          ) : elaError ? (
            <div className="text-center p-6 space-y-2">
              <Layers size={24} className="text-[#8d90a0] mx-auto opacity-50" />
              <p className="text-xs text-[#8d90a0] font-mono">{elaError}</p>
              <button
                onClick={fetchElaBlob}
                className="text-xs text-[#38bdf8] hover:underline font-mono"
              >
                Retry ELA Load
              </button>
            </div>
          ) : elaBlobUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={elaBlobUrl}
              alt="ELA Heatmap Analysis"
              className="max-w-full max-h-full object-contain rounded transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            />
          ) : null
        ) : docLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <Loader2 size={28} className="animate-spin text-[#38bdf8]" />
            <p className="text-xs text-[#8d90a0] font-mono">Loading document canvas...</p>
          </div>
        ) : docError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-md">
            <AlertCircle size={32} className="text-[#f87171]" />
            <div>
              <p className="text-xs font-semibold text-[#f87171] mb-1">Unable to preview document</p>
              <p className="text-[11px] text-[#8d90a0] leading-relaxed font-mono">{docError}</p>
            </div>
            <button
              onClick={fetchDocBlob}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#2563eb]/40 rounded-[4px] text-xs font-mono transition"
            >
              <RefreshCw size={12} />
              <span>Retry Load</span>
            </button>
          </div>
        ) : docBlobUrl ? (
          detectedPdf ? (
            <iframe
              src={`${docBlobUrl}#toolbar=0`}
              title={filename}
              className="w-full h-full min-h-[460px] rounded border-none"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={docBlobUrl}
              alt={filename}
              className="max-w-full max-h-full object-contain rounded transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            />
          )
        ) : null}
      </div>

      {/* Honest Forensic Annotation Footer */}
      <div className="bg-[#102034]/60 border border-[#1b2b3f] rounded-[4px] p-2.5 flex items-start gap-2 text-[11px] text-[#8d90a0]">
        <Info size={13} className="text-[#38bdf8] shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="text-[#c3c6d7]">Forensic Canvas Notice: </strong>
          Live document rendering from encrypted storage. Coordinate bounding boxes are ephemeral during
          pipeline execution and are not persisted; inspect the extracted key-values table for verified field data.
        </p>
      </div>
    </div>
  );
};
