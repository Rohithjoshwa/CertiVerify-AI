"use client";

import React from "react";
import { Table, Check, Pencil, Loader2, RotateCcw, ShieldCheck, Tag } from "lucide-react";
import { OCRDataResponse, OCRDataUpdate } from "@/lib/api";

export const FIELD_LABELS: [keyof OCRDataUpdate, string][] = [
  ["student_name", "Student / Candidate Name"],
  ["university_name", "University / Institution"],
  ["register_number", "Register Number"],
  ["roll_number", "Roll Number"],
  ["certificate_number", "Certificate Serial"],
  ["department", "Department / Branch"],
  ["course", "Degree / Program"],
  ["cgpa", "Cumulative GPA (CGPA)"],
  ["percentage", "Marks Percentage"],
  ["date_of_issue", "Date of Issue / Passing"],
];

interface OcrFieldTableProps {
  ocrData: OCRDataResponse;
  editValues: OCRDataUpdate;
  saving?: boolean;
  onEditChange?: (key: keyof OCRDataUpdate, value: string) => void;
  onChangeField?: (key: keyof OCRDataUpdate, value: string) => void;
  onSaveCorrections?: () => void;
  onSave?: () => void;
  onReset?: () => void;
}

// Safe normalization layer for field confidences to prevent runtime errors and filter non-numeric metadata keys
export function getSafeConfidence(
  confidences: Record<string, unknown> | undefined,
  fieldKey: string
): { pct: number | null; label: string; cls: string } {
  if (!confidences || !(fieldKey in confidences)) {
    return { pct: null, label: "—", cls: "text-[#8d90a0] bg-[#102034] border-[#1b2b3f]" };
  }

  const val = confidences[fieldKey];
  let num: number | null = null;

  if (typeof val === "number" && !isNaN(val)) {
    num = val <= 1.0 ? Math.round(val * 100) : Math.round(val);
  } else if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      num = parsed <= 1.0 ? Math.round(parsed * 100) : Math.round(parsed);
    }
  }

  if (num === null) {
    return { pct: null, label: "—", cls: "text-[#8d90a0] bg-[#102034] border-[#1b2b3f]" };
  }

  // 100% confidence indicates user verified / ground truth
  if (num === 100) {
    return {
      pct: 100,
      label: "100% (Truth)",
      cls: "text-[#4edea3] bg-[#4edea3]/10 border-[#4edea3]/30",
    };
  }

  if (num >= 80) {
    return {
      pct: num,
      label: `${num}%`,
      cls: "text-[#4edea3] bg-[#4edea3]/10 border-[#4edea3]/30",
    };
  }

  if (num >= 50) {
    return {
      pct: num,
      label: `${num}%`,
      cls: "text-[#ffb95f] bg-[#ffb95f]/10 border-[#ffb95f]/30",
    };
  }

  return {
    pct: num,
    label: `${num}%`,
    cls: "text-[#ffb4ab] bg-[#ffb4ab]/10 border-[#ffb4ab]/30",
  };
}

export const OcrFieldTable: React.FC<OcrFieldTableProps> = ({
  ocrData,
  editValues,
  saving = false,
  onEditChange,
  onChangeField,
  onSaveCorrections,
  onSave,
  onReset,
}) => {
  const handleChange = (key: keyof OCRDataUpdate, value: string) => {
    if (onChangeField) onChangeField(key, value);
    else if (onEditChange) onEditChange(key, value);
  };
  const handleSave = () => {
    if (onSave) onSave();
    else if (onSaveCorrections) onSaveCorrections();
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <Table size={16} className="text-[#38bdf8]" />
          <h2 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Extracted Structured Entities ({FIELD_LABELS.length} Fields)
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onReset && (
            <button
              onClick={onReset}
              disabled={saving}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[#8d90a0] hover:text-[#d3e4fe] bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-[3px] transition disabled:opacity-40"
              title="Reset edits to original AI extraction"
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] text-xs font-mono font-semibold transition disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(37,99,235,0.25)]"
          >
            {saving ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Pencil size={12} />
                <span>Save Corrections</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-[#1b2b3f] rounded-[6px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#102034] text-[#8d90a0] border-b border-[#1b2b3f]">
              <th className="py-2.5 px-3.5 font-mono uppercase text-[10px] w-1/3">Target Entity</th>
              <th className="py-2.5 px-3.5 font-mono uppercase text-[10px] w-1/2">
                Extracted Value (Editable)
              </th>
              <th className="py-2.5 px-3.5 font-mono uppercase text-[10px] w-1/6 text-right">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2b3f] bg-[#000f21]/30 font-sans">
            {FIELD_LABELS.map(([key, label]) => {
              const conf = getSafeConfidence(
                ocrData.field_confidences as Record<string, unknown>,
                key
              );
              const currentValue =
                (editValues[key] as string | number | undefined) ?? "";

              return (
                <tr key={key} className="hover:bg-[#102034]/40 transition">
                  <td className="py-2.5 px-3.5 text-[#c3c6d7] font-medium text-xs">
                    {label}
                  </td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder="— None Extracted —"
                      className="w-full bg-[#102034]/60 border border-transparent hover:border-[#1b2b3f] focus:border-[#2563eb] rounded-[3px] px-2.5 py-1 text-xs text-[#d3e4fe] focus:outline-none font-mono placeholder:text-[#8d90a0]/40 transition"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-[2px] border text-[10px] font-semibold ${conf.cls}`}
                    >
                      {conf.label}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Special Security Fields */}
            <tr className="hover:bg-[#102034]/40 transition bg-[#0b1c30]/50">
              <td className="py-2.5 px-3.5 text-[#c3c6d7] font-medium text-xs">Decoded QR Data</td>
              <td className="py-2.5 px-3.5 text-xs text-[#8d90a0] font-mono break-all" colSpan={2}>
                {ocrData.qr_code_data || "Not detected in document"}
              </td>
            </tr>
            <tr className="hover:bg-[#102034]/40 transition bg-[#0b1c30]/50">
              <td className="py-2.5 px-3.5 text-[#c3c6d7] font-medium text-xs">Official Signature</td>
              <td className="py-2.5 px-3.5 text-xs font-mono" colSpan={2}>
                {ocrData.has_signature ? (
                  <span className="text-[#4edea3] flex items-center gap-1 font-semibold">
                    <Check size={12} /> Detected
                  </span>
                ) : (
                  <span className="text-[#8d90a0]">Not detected</span>
                )}
              </td>
            </tr>
            <tr className="hover:bg-[#102034]/40 transition bg-[#0b1c30]/50">
              <td className="py-2.5 px-3.5 text-[#c3c6d7] font-medium text-xs">Official Seal</td>
              <td className="py-2.5 px-3.5 text-xs font-mono" colSpan={2}>
                {ocrData.has_seal ? (
                  <span className="text-[#4edea3] flex items-center gap-1 font-semibold">
                    <Check size={12} /> Detected
                  </span>
                ) : (
                  <span className="text-[#8d90a0]">Not detected</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Ground Truth Note */}
      <div className="text-[11px] text-[#8d90a0] font-sans flex items-center gap-1.5 pt-1">
        <ShieldCheck size={13} className="text-[#4edea3] shrink-0" />
        <span>
          Saved manual corrections are automatically elevated to 100% confidence ground truth for
          subsequent fraud and cross-document comparison passes.
        </span>
      </div>
    </div>
  );
};
