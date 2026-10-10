"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  ShieldCheck, ArrowLeft, GitCompare, Upload, FileText,
  Image as ImageIcon, X, Loader2, CheckCircle2, AlertTriangle,
  ChevronDown, Tag, TrendingUp, FileDown, Plus, Sparkles,
  Minus, Info,
} from "lucide-react";
import {
  directCompareApi, DirectCompareResponse, FieldComparisonRow,
  getAccessToken, authApi,
} from "@/lib/api";

// ── Document type options ────────────────────────────────────────────────
const MANUAL_DOC_TYPES: { value: string; label: string }[] = [
  { value: "aadhaar_card",         label: "Aadhaar Card" },
  { value: "sslc_marksheet",       label: "SSLC Marksheet" },
  { value: "hsc_marksheet",        label: "HSC Marksheet" },
  { value: "marksheet",            label: "Marksheet (Generic)" },
  { value: "transfer_certificate", label: "Transfer Certificate" },
  { value: "diploma",              label: "Diploma Certificate" },
  { value: "degree_certificate",   label: "Degree Certificate" },
  { value: "resume",               label: "Resume" },
];

function typeLabel(val: string) {
  return MANUAL_DOC_TYPES.find((t) => t.value === val)?.label ?? val.replace(/_/g, " ");
}

// Supported pair hints shown to user
const SUPPORTED_PAIRS = [
  "Degree Certificate ↔ Marksheet",
  "Degree Certificate ↔ Resume",
  "Resume ↔ Aadhaar Card",
  "Marksheet ↔ Aadhaar Card",
  "Transfer Certificate ↔ Marksheet",
  "Diploma Certificate ↔ Resume",
];

type Step = "select" | "comparing" | "results";

interface DocSlotState {
  docType: string;
  file: File | null;
}

const MAX_SLOTS = 5;
const MIN_SLOTS = 2;

// ── Compare stage labels (cycles during OCR) ────────────────────────────
const COMPARE_STAGES = [
  "Loading documents…",
  "Running OCR on Document 1…",
  "Running OCR on Document 2…",
  "Extracting fields…",
  "Comparing fields with RapidFuzz…",
  "Generating AI analysis…",
  "Finalizing results…",
];

export default function ComparePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState<Step>("select");
  const [showPairHints, setShowPairHints] = useState(false);

  // Slots: start with 2, expandable to 5
  const [slots, setSlots] = useState<DocSlotState[]>([
    { docType: "", file: null },
    { docType: "", file: null },
  ]);

  // Comparison state
  const [comparing, setComparing] = useState(false);
  const [compareStage, setCompareStage] = useState<string | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [result, setResult] = useState<DirectCompareResponse | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) { router.push("/login"); return; }
    authApi.me().then((r) => setUserName(r.data.full_name)).catch(() => router.push("/login"));
  }, [router]);

  // ── Slot management ───────────────────────────────────────────────────
  function addSlot() {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, { docType: "", file: null }]);
  }

  function removeSlot(idx: number) {
    if (slots.length <= MIN_SLOTS) return;
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSlotType(idx: number, val: string) {
    setSlots((prev) => prev.map((s, i) => i === idx ? { ...s, docType: val } : s));
  }

  function clearSlotFile(idx: number) {
    setSlots((prev) => prev.map((s, i) => i === idx ? { ...s, file: null } : s));
  }

  function setSlotFile(idx: number, file: File) {
    setSlots((prev) => prev.map((s, i) => i === idx ? { ...s, file } : s));
  }

  // ── Run Comparison ─────────────────────────────────────────────────────
  async function handleCompare() {
    const validSlots = slots.filter((s) => s.file !== null);

    if (validSlots.length < 2) {
      setCompareError("Please upload at least 2 documents to run comparison.");
      return;
    }

    const missingTypeIdx = slots.findIndex((s) => s.file !== null && !s.docType);
    if (missingTypeIdx !== -1) {
      setCompareError(`Please select a document type for Document ${missingTypeIdx + 1}.`);
      return;
    }

    const files = validSlots.map((s) => s.file!);
    const docTypes = validSlots.map((s) => s.docType);

    setComparing(true);
    setCompareError(null);
    setStep("comparing");

    // Animate stage labels
    let stageIdx = 0;
    setCompareStage(COMPARE_STAGES[0]);
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, COMPARE_STAGES.length - 1);
      setCompareStage(COMPARE_STAGES[stageIdx]);
    }, 3500);

    try {
      const { data } = await directCompareApi.compare(files, docTypes);
      clearInterval(stageTimer);
      setCompareStage(null);
      setResult(data);
      setStep("results");
    } catch (err: unknown) {
      clearInterval(stageTimer);
      setCompareStage(null);
      let msg = "Comparison failed. Please check the files and try again.";
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { detail?: any } } }).response;
        if (res?.data?.detail) {
          const d = res.data.detail;
          if (typeof d === "string") {
            msg = d;
          } else if (typeof d === "object" && d.message) {
            msg = d.message;
          } else {
            msg = JSON.stringify(d);
          }
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setCompareError(msg);
      setStep("select");
    } finally {
      setComparing(false);
    }
  }

  function handleReset() {
    setStep("select");
    setSlots([{ docType: "", file: null }, { docType: "", file: null }]);
    setResult(null);
    setCompareError(null);
    setPdfError(null);
  }

  async function handleDownloadPdf() {
    const validSlots = slots.filter((s) => s.file !== null && s.docType !== "");
    if (validSlots.length < 2) return;
    const files = validSlots.map((s) => s.file!);
    const docTypes = validSlots.map((s) => s.docType);

    setDownloadingPdf(true);
    setPdfError(null);
    try {
      await directCompareApi.downloadPdf(files, docTypes);
    } catch (err: unknown) {
      let msg = "PDF generation failed. Please try again.";
      if (err instanceof Error) msg = err.message;
      setPdfError(msg);
    } finally {
      setDownloadingPdf(false);
    }
  }

  const validCount = slots.filter((s) => s.file !== null).length;
  const validWithTypes = slots.filter((s) => s.file !== null && s.docType !== "").length;
  const canCompare = validCount >= 2 && validCount === validWithTypes;

  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">

      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand-500" size={28} />
          <span className="text-xl font-bold text-white">CertiVerify AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">Signed in as {userName || "…"}</span>
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </header>

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitCompare className="text-genuine" size={26} />
          Intelligent Document Comparison
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Upload 2–5 documents, run field-by-field AI comparison with fuzzy matching and consistency analysis.
        </p>

        {/* Supported pairs collapsible */}
        <button
          onClick={() => setShowPairHints((v) => !v)}
          className="mt-3 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition"
        >
          <Info size={12} />
          {showPairHints ? "Hide" : "Show"} supported document pairs
          <ChevronDown size={12} className={`transition-transform ${showPairHints ? "rotate-180" : ""}`} />
        </button>
        {showPairHints && (
          <div className="mt-2 flex flex-wrap gap-2">
            {SUPPORTED_PAIRS.map((p) => (
              <span
                key={p}
                className="text-xs bg-brand-900/40 border border-brand-700/40 text-brand-300 rounded-full px-3 py-1"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── SELECT + UPLOAD step ──────────────────────────────────────────── */}
      {step === "select" && (
        <div className="space-y-5">
          {compareError && (
            <div className="flex items-center gap-2 bg-fake/10 border border-fake/30 text-fake text-sm rounded-xl px-4 py-3">
              <AlertTriangle size={15} />
              {compareError}
            </div>
          )}

          {/* Document slots */}
          <div className="space-y-4">
            {slots.map((slot, idx) => (
              <SlotRow
                key={idx}
                slotIndex={idx}
                docType={slot.docType}
                file={slot.file}
                canRemove={slots.length > MIN_SLOTS}
                onDocTypeChange={(v) => updateSlotType(idx, v)}
                onFileClear={() => clearSlotFile(idx)}
                onFileSet={(f) => setSlotFile(idx, f)}
                onRemove={() => removeSlot(idx)}
              />
            ))}
          </div>

          {/* Add document button */}
          {slots.length < MAX_SLOTS && (
            <button
              onClick={addSlot}
              className="w-full rounded-xl border border-dashed border-surface-border text-gray-500 hover:text-brand-400 hover:border-brand-600/50 py-3 text-sm transition flex items-center justify-center gap-2"
            >
              <Plus size={15} /> Add Document {slots.length + 1}
              <span className="text-xs opacity-60">(max {MAX_SLOTS})</span>
            </button>
          )}

          {/* Requirements hint */}
          {(!canCompare) && (
            <div className="text-xs text-gray-500 text-center space-y-0.5">
              {validCount < 2 && <p>→ Select and upload at least 2 documents</p>}
              {validCount >= 2 && validWithTypes < validCount && <p>→ Select a document type for each uploaded document</p>}
            </div>
          )}

          <button
            id="run-comparison-btn"
            onClick={handleCompare}
            disabled={!canCompare || comparing}
            className="w-full rounded-xl bg-genuine hover:bg-genuine/90 disabled:opacity-50 text-white font-semibold py-3.5 transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {comparing
              ? <><Loader2 size={18} className="animate-spin" /> {compareStage ?? "Running…"}</>
              : <><GitCompare size={18} /> Run Comparison</>}
          </button>
        </div>
      )}

      {/* ── COMPARING ───────────────────────────────────────────────────── */}
      {step === "comparing" && (
        <div className="text-center py-20 space-y-5">
          <div className="relative inline-block">
            <Loader2 size={56} className="animate-spin text-brand-400 mx-auto" />
            <Sparkles size={20} className="absolute -top-1 -right-1 text-genuine animate-pulse" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{compareStage ?? "Processing…"}</p>
            <p className="text-sm text-gray-400 mt-1">
              Running OCR on all uploaded documents and performing intelligent field comparison.
            </p>
          </div>
          {/* Stage progress pills */}
          <div className="flex justify-center flex-wrap gap-2 max-w-lg mx-auto">
            {COMPARE_STAGES.map((s) => (
              <span
                key={s}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                  s === compareStage
                    ? "bg-brand-600/30 border-brand-500 text-brand-300"
                    : "bg-surface-border/10 border-surface-border/20 text-gray-600"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS ─────────────────────────────────────────────────────── */}
      {step === "results" && result && (
        <ComparisonResults
          result={result}
          onReset={handleReset}
          onDownloadPdf={handleDownloadPdf}
          downloadingPdf={downloadingPdf}
          pdfError={pdfError}
        />
      )}
    </main>
  );
}


// ── SlotRow sub-component ────────────────────────────────────────────────

interface SlotRowProps {
  slotIndex: number;
  docType: string;
  file: File | null;
  canRemove: boolean;
  onDocTypeChange: (val: string) => void;
  onFileClear: () => void;
  onFileSet: (f: File) => void;
  onRemove: () => void;
}

function SlotRow({
  slotIndex, docType, file, canRemove,
  onDocTypeChange, onFileClear, onFileSet, onRemove,
}: SlotRowProps) {
  const onDrop = useCallback(
    (accepted: File[]) => { if (accepted[0]) onFileSet(accepted[0]); },
    [onFileSet],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 15 * 1024 * 1024,
  });

  const num = slotIndex + 1;
  const isRequired = slotIndex < 2;

  return (
    <div className="glass-panel rounded-xl border border-surface-border p-4">
      <div className="flex items-start gap-3">
        {/* Slot number badge */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
          <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${
            isRequired ? "bg-brand-600" : "bg-surface-border"
          }`}>
            {num}
          </span>
          {!isRequired && (
            <span className="text-[9px] text-gray-600">optional</span>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Doc type selector */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Document Type {isRequired ? "*" : "(optional)"}
            </label>
            <div className="relative">
              <select
                id={`doc-type-${num}`}
                value={docType}
                onChange={(e) => onDocTypeChange(e.target.value)}
                className="w-full appearance-none bg-gray-900 border border-surface-border rounded-lg px-3 py-2 pr-8 text-sm text-white font-medium focus:outline-none focus:border-brand-500 transition cursor-pointer"
              >
                <option value="" className="bg-gray-900 text-gray-400">— Select type —</option>
                {MANUAL_DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-gray-900 text-white font-medium py-1">
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {docType && (
              <p className="text-xs text-brand-400 mt-1 flex items-center gap-1">
                <Tag size={10} /> {typeLabel(docType)}
              </p>
            )}
          </div>

          {/* Dropzone or file preview */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Document File</label>
            {!file ? (
              <div
                {...getRootProps()}
                className={`rounded-lg border-2 border-dashed px-4 py-3 text-center cursor-pointer transition text-sm ${
                  isDragActive
                    ? "border-genuine bg-genuine/5"
                    : "border-surface-border hover:border-genuine/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-1 text-genuine" size={20} />
                <p className="text-white text-xs font-medium">
                  {isDragActive ? "Drop here…" : "Drag & drop or click"}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">PDF / JPG / PNG · max 15 MB</p>
              </div>
            ) : (
              <div className="glass-panel rounded-lg px-3 py-2 flex items-center justify-between h-full">
                <div className="flex items-center gap-2 text-sm text-gray-200 min-w-0">
                  {file.type === "application/pdf"
                    ? <FileText size={15} className="text-brand-400 shrink-0" />
                    : <ImageIcon size={15} className="text-brand-400 shrink-0" />}
                  <span className="truncate text-xs">{file.name}</span>
                  <span className="text-gray-500 text-[10px] shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button onClick={onFileClear} className="text-gray-500 hover:text-fake transition ml-2 shrink-0">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Remove slot button */}
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-gray-600 hover:text-fake transition mt-0.5 shrink-0"
            title="Remove this slot"
          >
            <Minus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}


// ── ComparisonResults sub-component ──────────────────────────────────────

function ComparisonResults({
  result, onReset, onDownloadPdf, downloadingPdf, pdfError,
}: {
  result: DirectCompareResponse;
  onReset: () => void;
  onDownloadPdf: () => void;
  downloadingPdf: boolean;
  pdfError: string | null;
}) {
  const matchCount   = result.comparison.filter((r) => r.status === "match").length;
  const partialCount = result.comparison.filter((r) => r.status === "partial").length;
  const mismatchCount= result.comparison.filter((r) => r.status === "mismatch").length;
  const missingCount = result.comparison.filter((r) => r.status === "missing").length;
  const pct = result.comparison_score ?? result.similarity_percentage;
  const isIdentical  = result.comparison_type === "identical_document";

  const scoreColor = pct >= 80 ? "text-genuine" : pct >= 60 ? "text-suspicious" : "text-fake";
  const scoreBg    = pct >= 80 ? "bg-genuine/10 border-genuine/30"
                   : pct >= 60 ? "bg-suspicious/10 border-suspicious/30"
                   : "bg-fake/10 border-fake/30";

  return (
    <div className="space-y-6">

      {/* Identical Documents Banner */}
      {isIdentical && (
        <div className="flex items-center gap-3 bg-genuine/15 border border-genuine/40 text-genuine rounded-xl px-5 py-3 text-sm font-semibold">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>Identical Documents Detected — The uploaded documents are exact copies. No field differences were found.</span>
        </div>
      )}

      {/* ── Score banner ─────────────────────────────────────────────── */}
      <div className={`rounded-xl border px-6 py-5 ${scoreBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div>
          <p className="text-sm text-gray-400 mb-1">Overall Consistency Score</p>
          <p className={`text-5xl font-black ${scoreColor}`}>{pct}%</p>
          <div className="flex items-center flex-wrap gap-3 mt-2 text-xs">
            <span className="text-genuine">✓ {matchCount} match{matchCount !== 1 ? "es" : ""}</span>
            {partialCount > 0 && (
              <span className="text-suspicious">~ {partialCount} partial</span>
            )}
            <span className="text-fake">✗ {mismatchCount} mismatch{mismatchCount !== 1 ? "es" : ""}</span>
            <span className="text-gray-500">— {missingCount} missing</span>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 space-y-1.5">
          <div className="flex items-center gap-2 justify-end">
            <GitCompare size={11} className="text-brand-400" />
            <span className="text-gray-300 font-medium">{result.pair_hint}</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <TrendingUp size={11} className="text-gray-500" />
            <span>OCR: {(result.doc1_ocr_accuracy * 100).toFixed(0)}% / {(result.doc2_ocr_accuracy * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* ── AI Summary ────────────────────────────────────────────────── */}
      {result.ai_summary && result.ai_summary.length > 0 && (
        <div className="glass-panel rounded-xl border border-brand-700/30 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-brand-400" />
            <h2 className="text-sm font-semibold text-white">AI Consistency Analysis</h2>
          </div>
          <ul className="space-y-2">
            {result.ai_summary.map((bullet, i) => {
              const isGood    = bullet.startsWith("✅");
              const isWarn    = bullet.startsWith("⚠️");
              const isBad     = bullet.startsWith("❌");
              const isNeutral = bullet.startsWith("—");
              return (
                <li
                  key={i}
                  className={`text-sm rounded-lg px-3 py-2 border leading-relaxed ${
                    isGood    ? "bg-genuine/5 border-genuine/20 text-genuine/90"
                    : isWarn  ? "bg-suspicious/5 border-suspicious/20 text-suspicious/90"
                    : isBad   ? "bg-fake/5 border-fake/20 text-fake/90"
                    : isNeutral ? "bg-surface-border/10 border-surface-border/20 text-gray-400"
                    : "bg-surface-border/10 border-surface-border/20 text-gray-300"
                  }`}
                >
                  {bullet}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Field-by-field table ───────────────────────────────────────── */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-border bg-surface-border/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Field-by-Field Comparison</h2>
          <span className="text-xs text-gray-500">{result.comparison.length} fields compared</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-surface-border/30 bg-surface-border/5 text-[10px]">
          <span className="flex items-center gap-1 text-genuine"><CheckCircle2 size={10} /> Match (≥82%)</span>
          <span className="flex items-center gap-1 text-suspicious"><AlertTriangle size={10} /> Partial (60–81%)</span>
          <span className="flex items-center gap-1 text-fake"><X size={10} /> Mismatch (&lt;60%)</span>
          <span className="text-gray-500">— Missing</span>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[1.1fr_1fr_1fr_0.7fr] text-xs text-gray-400 font-medium bg-surface-border/20 px-4 py-2.5 border-b border-surface-border">
          <span>Field</span>
          <span>Document 1</span>
          <span>Document 2</span>
          <span className="text-center">Result</span>
        </div>

        <div className="divide-y divide-surface-border/30">
          {result.comparison.map((row) => (
            <ComparisonRow key={row.field} row={row} />
          ))}
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="download-compare-pdf-btn"
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 text-sm transition inline-flex items-center justify-center gap-2"
        >
          {downloadingPdf
            ? <><Loader2 size={16} className="animate-spin" /> Generating PDF…</>
            : <><FileDown size={16} /> Download Comparison Report</>}
        </button>
        <button
          id="compare-reset-btn"
          onClick={onReset}
          className="flex-1 rounded-xl border border-surface-border text-gray-400 hover:text-white hover:border-brand-500/50 py-3 text-sm transition"
        >
          Compare Different Documents
        </button>
      </div>

      {pdfError && (
        <div className="flex items-center gap-2 bg-fake/10 border border-fake/30 text-fake text-sm rounded-xl px-4 py-3">
          <AlertTriangle size={14} /> {pdfError}
        </div>
      )}
    </div>
  );
}


// ── ComparisonRow ─────────────────────────────────────────────────────────

function ComparisonRow({ row }: { row: FieldComparisonRow }) {
  const statusStyles: Record<string, string> = {
    match:    "border-l-4 border-genuine",
    partial:  "border-l-4 border-suspicious",
    mismatch: "border-l-4 border-fake",
    missing:  "border-l-4 border-gray-600 opacity-60",
  };

  const valueStyles: Record<string, string> = {
    match:    "text-genuine",
    partial:  "text-suspicious",
    mismatch: "text-fake",
    missing:  "text-gray-500 italic",
  };

  const badge: Record<string, JSX.Element> = {
    match: (
      <div className="flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center gap-1 text-[10px] bg-genuine/15 text-genuine border border-genuine/30 rounded-full px-2 py-0.5">
          <CheckCircle2 size={9} /> Match
        </span>
        {row.similarity != null && (
          <span className="text-[9px] text-genuine/60">{row.similarity}%</span>
        )}
      </div>
    ),
    partial: (
      <div className="flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center gap-1 text-[10px] bg-suspicious/15 text-suspicious border border-suspicious/30 rounded-full px-2 py-0.5">
          <AlertTriangle size={9} /> Partial
        </span>
        {row.similarity != null && (
          <span className="text-[9px] text-suspicious/60">{row.similarity}%</span>
        )}
      </div>
    ),
    mismatch: (
      <div className="flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center gap-1 text-[10px] bg-fake/15 text-fake border border-fake/30 rounded-full px-2 py-0.5">
          <AlertTriangle size={9} /> Mismatch
        </span>
        {row.similarity != null && (
          <span className="text-[9px] text-fake/60">{row.similarity}%</span>
        )}
      </div>
    ),
    missing: (
      <span className="inline-flex text-[10px] bg-gray-700/40 text-gray-500 border border-gray-600/30 rounded-full px-2 py-0.5">
        Missing
      </span>
    ),
  };

  return (
    <div className={`grid grid-cols-[1.1fr_1fr_1fr_0.7fr] px-4 py-3 items-start gap-2 ${statusStyles[row.status]}`}>
      <p className="text-xs font-medium text-gray-300 pt-0.5">{row.field_label}</p>
      <p className={`text-xs break-words ${valueStyles[row.status]}`}>
        {row.doc1_value ?? "—"}
      </p>
      <p className={`text-xs break-words ${row.status === "mismatch" || row.status === "partial" ? valueStyles[row.status] : valueStyles[row.status]}`}>
        {row.doc2_value ?? "—"}
      </p>
      <div className="flex justify-center">
        {badge[row.status]}
      </div>
    </div>
  );
}
