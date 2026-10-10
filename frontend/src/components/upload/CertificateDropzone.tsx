"use client";

import React from "react";
import { UploadCloud, FileType, CheckCircle2, ChevronDown } from "lucide-react";

export const MANUAL_DOC_TYPES: { value: string; label: string }[] = [
  { value: "degree_certificate", label: "Degree Certificate" },
  { value: "marksheet", label: "SSLC / Marksheet" },
  { value: "diploma", label: "Diploma Certificate" },
  { value: "transfer_certificate", label: "Transfer Certificate" },
  { value: "aadhaar_card", label: "Aadhaar Card" },
  { value: "resume", label: "Resume / CV" },
];

interface CertificateDropzoneProps {
  selectedDocType: string;
  onDocTypeChange: (val: string) => void;
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  disabled?: boolean;
}

export const CertificateDropzone: React.FC<CertificateDropzoneProps> = ({
  selectedDocType,
  onDocTypeChange,
  getRootProps,
  getInputProps,
  isDragActive,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      {/* Step 1: Pre-Ingestion Classification Tag */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[4px] bg-[#2563eb]/20 border border-[#2563eb]/40 text-[#38bdf8] text-[11px] font-mono font-bold flex items-center justify-center">
              01
            </span>
            <span className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
              Pre-Classification Target (Optional)
            </span>
          </div>
          <span className="text-[11px] text-[#8d90a0] font-sans">
            Auto-detected by neural model if left blank
          </span>
        </div>

        <div className="relative">
          <select
            id="doc-type-selector"
            value={selectedDocType}
            onChange={(e) => onDocTypeChange(e.target.value)}
            disabled={disabled}
            className="w-full appearance-none bg-[#102034] border border-[#1b2b3f] rounded-[4px] px-3.5 py-2.5 pr-10 text-xs text-[#d3e4fe] focus:outline-none focus:border-[#2563eb] transition cursor-pointer disabled:opacity-50"
          >
            <option value="">— Auto-Detect Document Classification —</option>
            {MANUAL_DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#102034] text-[#d3e4fe]">
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none"
          />
        </div>

        {selectedDocType && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#38bdf8] font-mono">
            <CheckCircle2 size={12} className="text-[#4edea3]" />
            <span>
              Target type locked to:{" "}
              <strong className="text-[#d3e4fe]">
                {MANUAL_DOC_TYPES.find((t) => t.value === selectedDocType)?.label}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Step 2: Large Certificate Dropzone */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-5 h-5 rounded-[4px] bg-[#2563eb]/20 border border-[#2563eb]/40 text-[#38bdf8] text-[11px] font-mono font-bold flex items-center justify-center">
            02
          </span>
          <span className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            File Ingestion Dropzone
          </span>
        </div>

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-[8px] p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragActive
              ? "border-[#2563eb] bg-[#2563eb]/10 ring-2 ring-[#2563eb]/20"
              : "border-[#1b2b3f] bg-[#000f21]/40 hover:border-[#2563eb]/60 hover:bg-[#102034]/50"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />

          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform duration-200 ${
              isDragActive
                ? "bg-[#2563eb]/30 text-[#60a5fa] scale-110"
                : "bg-[#102034] text-[#38bdf8] border border-[#1b2b3f]"
            }`}
          >
            <UploadCloud size={30} />
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-[#d3e4fe] font-sans mb-1">
            {isDragActive ? "Drop documents here to stage" : "Drag & drop your certificate here"}
          </h3>
          <p className="text-xs text-[#8d90a0] mb-3 font-mono">or</p>

          <button
            type="button"
            className="px-6 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-[4px] shadow-sm shadow-[#2563eb]/30 transition-all mb-4"
          >
            Choose File
          </button>

          <div className="space-y-1 text-center">
            <p className="text-[11px] text-[#8d90a0] font-mono">
              Supported formats: PDF, JPG, PNG, JPEG
            </p>
            <p className="text-[11px] text-[#8d90a0] font-mono">
              Maximum file size: 10 MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
