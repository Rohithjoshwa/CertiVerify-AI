"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Pencil,
  Check,
  RotateCcw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import {
  OCRDataResponse,
  OCRDataUpdate,
  DocumentValidationResponse,
  FieldValidationItem,
} from "@/lib/api";

const TARGET_FIELDS: Array<{ key: keyof OCRDataUpdate; label: string }> = [
  { key: "student_name", label: "Student Name" },
  { key: "university_name", label: "University / Institute" },
  { key: "register_number", label: "Register Number" },
  { key: "roll_number", label: "Roll Number" },
  { key: "certificate_number", label: "Certificate Number" },
  { key: "department", label: "Department / Major" },
  { key: "course", label: "Degree / Course" },
  { key: "cgpa", label: "CGPA" },
  { key: "percentage", label: "Percentage" },
  { key: "date_of_issue", label: "Date of Issue" },
];

interface OcrExtractionTableProps {
  ocrData: OCRDataResponse | null;
  editValues: OCRDataUpdate;
  onChangeField: (key: keyof OCRDataUpdate, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  validation: DocumentValidationResponse | null;
}

export const OcrExtractionTable: React.FC<OcrExtractionTableProps> = ({
  ocrData,
  editValues,
  onChangeField,
  onSave,
  onReset,
  saving,
  validation,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Confidence helper
  const getFieldConfidence = (key: string): number | null => {
    if (!ocrData?.field_confidences) return null;
    const conf = ocrData.field_confidences[key];
    return typeof conf === "number" ? conf : null;
  };

  // Validation lookup helper
  const getFieldValidation = (key: string): FieldValidationItem | undefined => {
    if (!validation?.field_validations) return undefined;
    return validation.field_validations.find((v) => v.field === key);
  };

  const statusBadge = (item?: FieldValidationItem) => {
    if (!item) return null;
    const s = item.status;
    const cfg = {
      VALID: {
        text: "VALID",
        color: "text-[#4edea3]",
        bg: "bg-[#4edea3]/10 border-[#4edea3]/30",
        icon: CheckCircle2,
      },
      INVALID: {
        text: "INVALID",
        color: "text-[#ffb4ab]",
        bg: "bg-[#ffb4ab]/10 border-[#ffb4ab]/30",
        icon: XCircle,
      },
      LOW_CONFIDENCE: {
        text: "LOW CONF",
        color: "text-[#ffb95f]",
        bg: "bg-[#ffb95f]/10 border-[#ffb95f]/30",
        icon: AlertTriangle,
      },
      MISSING: {
        text: "MISSING",
        color: "text-[#8d90a0]",
        bg: "bg-[#102034] border-[#1b2b3f]",
        icon: HelpCircle,
      },
      NOT_DETECTED: {
        text: "NOT DETECTED",
        color: "text-[#8d90a0]",
        bg: "bg-[#102034] border-[#1b2b3f]",
        icon: HelpCircle,
      },
      NOT_APPLICABLE: {
        text: "N/A",
        color: "text-[#8d90a0]",
        bg: "bg-[#102034] border-[#1b2b3f]",
        icon: HelpCircle,
      },
    }[s] || {
      text: s,
      color: "text-[#8d90a0]",
      bg: "bg-[#102034] border-[#1b2b3f]",
      icon: HelpCircle,
    };

    const Icon = cfg.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono font-medium border ${cfg.bg} ${cfg.color}`}
        title={item.reason}
      >
        <Icon size={10} />
        {cfg.text}
      </span>
    );
  };

  const confidencePill = (conf: number | null) => {
    if (conf == null) return <span className="text-[#8d90a0] text-xs font-mono">—</span>;
    const pct = Math.round(conf * 100);
    const color =
      pct >= 80
        ? "text-[#4edea3] bg-[#4edea3]/10 border-[#4edea3]/30"
        : pct >= 60
        ? "text-[#ffb95f] bg-[#ffb95f]/10 border-[#ffb95f]/30"
        : "text-[#ffb4ab] bg-[#ffb4ab]/10 border-[#ffb4ab]/30";
    return (
      <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono border ${color}`}>
        {pct}%
      </span>
    );
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-4 flex flex-col space-y-4">
      {/* Table Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-[#38bdf8]" />
            <h3 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
              OCR Field Extraction & Schema Validation
            </h3>
          </div>
          <p className="text-[11px] text-[#8d90a0] mt-0.5">
            Extracted via {ocrData?.ocr_engine || "Neural OCR Engine"} • Average Accuracy:{" "}
            <span className="font-mono text-[#d3e4fe]">
              {ocrData?.ocr_accuracy ? `${Math.round(ocrData.ocr_accuracy * 100)}%` : "—"}
            </span>
          </p>
        </div>

        {/* Edit & Save Controls */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  onReset();
                  setIsEditing(false);
                }}
                disabled={saving}
                className="px-2.5 py-1 text-xs font-medium bg-[#102034] hover:bg-[#1b2b3f] text-[#c3c6d7] rounded-[4px] border border-[#1b2b3f] transition flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onSave();
                  setIsEditing(false);
                }}
                disabled={saving}
                className="px-3 py-1 text-xs font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] transition flex items-center gap-1 disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save Corrections
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-xs font-medium bg-[#102034] hover:bg-[#1b2b3f] text-[#c3c6d7] hover:text-[#d3e4fe] rounded-[4px] border border-[#1b2b3f] transition flex items-center gap-1.5"
            >
              <Pencil size={12} className="text-[#38bdf8]" />
              Edit Fields
            </button>
          )}
        </div>
      </div>

      {/* Validation Schema Summary Banner if Available */}
      {validation && (
        <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#8d90a0]">Document Type:</span>
            <span className="font-semibold text-[#d3e4fe] font-mono">
              {validation.document_type.replace(/_/g, " ").toUpperCase()}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2563eb]/20 text-[#38bdf8] border border-[#2563eb]/30 font-mono">
              {Math.round(validation.classification_confidence * 100)}% Match
            </span>
          </div>
          <div className="text-[11px] text-[#8d90a0]">
            Schema Checked: {validation.field_validations.length} fields
          </div>
        </div>
      )}

      {/* Extracted Fields Table */}
      <div className="overflow-x-auto rounded-[6px] border border-[#1b2b3f]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#102034] border-b border-[#1b2b3f] text-[11px] font-mono uppercase text-[#8d90a0]">
              <th className="py-2.5 px-3">Field Key</th>
              <th className="py-2.5 px-3">Extracted Value</th>
              <th className="py-2.5 px-3 w-24">Confidence</th>
              <th className="py-2.5 px-3 w-32">Validation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b2b3f] text-xs">
            {TARGET_FIELDS.map(({ key, label }) => {
              const currentValue = isEditing
                ? editValues[key] ?? ""
                : (ocrData as unknown as Record<string, unknown>)?.[key] ?? "";
              const confidence = getFieldConfidence(key);
              const valItem = getFieldValidation(key);

              return (
                <tr key={key} className="hover:bg-[#102034]/40 transition">
                  {/* Field Label */}
                  <td className="py-2.5 px-3 text-[#d3e4fe] font-medium whitespace-nowrap">
                    <div>{label}</div>
                    <span className="text-[10px] text-[#8d90a0] font-mono">{key}</span>
                  </td>

                  {/* Field Value (Editable or Read-Only) */}
                  <td className="py-2.5 px-3 text-[#c3c6d7]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={String(currentValue)}
                        onChange={(e) => onChangeField(key, e.target.value)}
                        className="w-full bg-[#000f21] border border-[#1b2b3f] focus:border-[#2563eb] rounded-[4px] px-2 py-1 text-xs text-[#d3e4fe] font-mono focus:outline-none"
                      />
                    ) : (
                      <span className="font-mono text-[#d3e4fe]">
                        {currentValue !== "" && currentValue != null ? (
                          String(currentValue)
                        ) : (
                          <span className="text-[#8d90a0] italic">Not detected</span>
                        )}
                      </span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-2.5 px-3">{confidencePill(confidence)}</td>

                  {/* Validation Status */}
                  <td className="py-2.5 px-3">
                    {valItem ? (
                      statusBadge(valItem)
                    ) : (
                      <span className="text-[#8d90a0] text-xs font-mono">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Semantic Guidance Footer */}
      <div className="text-[11px] text-[#8d90a0] flex items-center justify-between pt-1">
        <span>
          Note: Missing or Low-Confidence field statuses indicate OCR legibility constraints and do
          not equate to fraud.
        </span>
      </div>
    </div>
  );
};
