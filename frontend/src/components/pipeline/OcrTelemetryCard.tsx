"use client";

import React from "react";
import { ScanText, Cpu, QrCode, PenTool, Stamp, Loader2, Sparkles } from "lucide-react";
import { OCRDataResponse } from "@/lib/api";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface OcrTelemetryCardProps {
  ocrData: OCRDataResponse | null;
  running: boolean;
  ocrStage: string | null;
  onRunOcr: () => void;
}

export const OcrTelemetryCard: React.FC<OcrTelemetryCardProps> = ({
  ocrData,
  running,
  ocrStage,
  onRunOcr,
}) => {
  const accuracyPct = ocrData ? Math.round(ocrData.ocr_accuracy * 100) : null;

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <ScanText size={16} className="text-[#4edea3]" />
          <h2 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Neural OCR Inference Engine
          </h2>
        </div>
        <button
          onClick={onRunOcr}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] text-xs font-mono font-semibold transition disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(37,99,235,0.3)] self-start sm:self-auto"
        >
          {running ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>{ocrStage || "Processing..."}</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>{ocrData ? "Re-Run OCR Inference" : "Trigger OCR Extraction"}</span>
            </>
          )}
        </button>
      </div>

      {ocrData ? (
        <div className="space-y-4">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Accuracy */}
            <div className="bg-[#102034] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8d90a0]">
                <span className="uppercase">OCR Accuracy Index</span>
                <span className="text-[#4edea3] font-bold">{accuracyPct}%</span>
              </div>
              <ProgressBar
                value={accuracyPct ?? 0}
                size="xs"
                variant={accuracyPct && accuracyPct >= 75 ? "emerald" : "amber"}
              />
              <p className="text-[10px] font-mono text-[#8d90a0]">
                Mean character & word confidence
              </p>
            </div>

            {/* Engine */}
            <div className="bg-[#102034] border border-[#1b2b3f] rounded-[6px] p-3.5 space-y-1">
              <span className="text-[11px] font-mono uppercase text-[#8d90a0]">Active Engine</span>
              <p className="text-sm font-bold font-mono text-[#38bdf8] flex items-center gap-1.5 pt-0.5">
                <Cpu size={14} />
                {ocrData.ocr_engine}
              </p>
              <p className="text-[10px] font-mono text-[#8d90a0]">
                Fused PyMuPDF + EasyOCR + Tesseract
              </p>
            </div>
          </div>

          {/* Forensic Detection Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5 text-center">
              <PenTool
                size={14}
                className={`mx-auto mb-1 ${
                  ocrData.has_signature ? "text-[#4edea3]" : "text-[#8d90a0]"
                }`}
              />
              <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Signature</p>
              <p
                className={`text-[11px] font-mono font-bold mt-0.5 ${
                  ocrData.has_signature ? "text-[#4edea3]" : "text-[#8d90a0]"
                }`}
              >
                {ocrData.has_signature ? "Detected" : "Not Detected"}
              </p>
            </div>

            <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5 text-center">
              <Stamp
                size={14}
                className={`mx-auto mb-1 ${
                  ocrData.has_seal ? "text-[#4edea3]" : "text-[#8d90a0]"
                }`}
              />
              <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Official Seal</p>
              <p
                className={`text-[11px] font-mono font-bold mt-0.5 ${
                  ocrData.has_seal ? "text-[#4edea3]" : "text-[#8d90a0]"
                }`}
              >
                {ocrData.has_seal ? "Detected" : "Not Detected"}
              </p>
            </div>

            <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5 text-center">
              <QrCode
                size={14}
                className={`mx-auto mb-1 ${
                  ocrData.qr_code_data ? "text-[#4edea3]" : "text-[#8d90a0]"
                }`}
              />
              <p className="text-[10px] font-mono uppercase text-[#8d90a0]">QR Code</p>
              <p
                className={`text-[11px] font-mono font-bold mt-0.5 ${
                  ocrData.qr_code_data ? "text-[#4edea3]" : "text-[#8d90a0]"
                }`}
              >
                {ocrData.qr_code_data ? "Decoded" : "Not Detected"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-mono text-[#8d90a0] border border-dashed border-[#1b2b3f] rounded-[6px]">
          No OCR data has been extracted yet. Click &quot;Trigger OCR Extraction&quot; above to run neural inference.
        </div>
      )}
    </div>
  );
};
