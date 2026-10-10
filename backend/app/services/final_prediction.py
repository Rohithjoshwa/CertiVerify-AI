"""
MODULE 9 — FINAL PREDICTION (Enhanced)

Classifies a certificate as Genuine / Suspicious / Fake from its Trust
Score (Module 8) and produces a structured evidence JSON breakdown with
a reasons list.

ENHANCEMENTS over original:
  - Returns structured `evidence` dict (per-factor status, score, label)
  - Returns `reasons` list (human-readable bullet sentences)
  - Returns `fraud_probability` directly in result for single-call access
  - Existing `explanation` string preserved (backward compatible)
  - Critical evidence labels surface in reasons list
  - Thresholds unchanged: ≥80 Genuine, 50–79 Suspicious, <50 Fake

The evidence dict matches the spec's JSON structure:
  {
    "ocr":            {"score": 94, "status": "PASS"},
    "classification": {"score": 96, "status": "PASS"},
    "field_extraction":{"score": 91, "status": "PASS"},
    "comparison":     {"score": 93, "status": "PASS"},
    "qr":             {"status": "VERIFIED"},
    "blockchain":     {"status": "MATCH"},
    "tampering":      {"score": 5,  "status": "LOW_RISK"},
    "duplicate":      {"status": "NOT_FOUND"},
    "metadata":       {"status": "CLEAN"}
  }
"""
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class PredictionInputs:
    trust_score: float                                  # 0-100
    data_completeness: float = 0.0                      # 0-1, fraction of factors with real data
    is_duplicate: bool | None = None
    tampering_score: float | None = None                # 0-100
    blockchain_status: str | None = None
    qr_present: bool | None = None
    qr_valid: bool | None = None
    comparison_consistency_pct: float | None = None
    fraud_probability: float | None = None              # 0-1
    ocr_accuracy: float | None = None                  # 0-1
    # New structured evidence from trust score engine
    evidence_breakdown: dict | None = None              # from TrustScoreResult.evidence_breakdown
    # New signals
    doc_classification_confidence: float | None = None  # 0-1
    field_extraction_completeness: float | None = None  # 0-1
    critical_overrides: list[str] | None = None         # from FraudAnalysisResult


@dataclass
class PredictionResult:
    label: str                                         # "genuine" | "suspicious" | "fake"
    confidence: float                                  # 0-1
    explanation: str                                   # plain text (backward compatible)
    recommended_action: str
    fraud_probability: float = 0.0                    # 0-1, mirrored for convenience
    evidence: dict = field(default_factory=dict)       # structured per-factor JSON
    reasons: list[str] = field(default_factory=list)   # human-readable bullet sentences


GENUINE_THRESHOLD    = 80
SUSPICIOUS_THRESHOLD = 50


def predict(inputs: PredictionInputs) -> PredictionResult:
    score = inputs.trust_score
    fp    = inputs.fraud_probability or 0.0

    # ── Primary classification from trust score ───────────────────────────
    if score >= GENUINE_THRESHOLD:
        label = "genuine"
    elif score >= SUSPICIOUS_THRESHOLD:
        label = "suspicious"
    else:
        label = "fake"

    boundary_distance = _boundary_distance(score, label)
    confidence = round(
        min(max(0.5 * boundary_distance + 0.5 * inputs.data_completeness, 0.0), 1.0), 4
    )

    # ── Duplicate hard override ───────────────────────────────────────────
    if inputs.is_duplicate:
        label = "fake"
        confidence = max(confidence, 0.90)

    # ── Build structured evidence breakdown ───────────────────────────────
    evidence = _build_evidence(inputs)

    # ── Build reasons list ────────────────────────────────────────────────
    reasons = _build_reasons(inputs, label, score, fp)

    # ── Build plain text explanation (backward compatible) ────────────────
    explanation = _build_explanation(inputs, label, score)

    # ── Recommended action ────────────────────────────────────────────────
    recommended_action = _build_recommended_action(label, inputs.is_duplicate)

    return PredictionResult(
        label=label,
        confidence=confidence,
        explanation=explanation,
        recommended_action=recommended_action,
        fraud_probability=fp,
        evidence=evidence,
        reasons=reasons,
    )


# ---------------------------------------------------------------------------
# Evidence breakdown builder
# ---------------------------------------------------------------------------

def _build_evidence(inputs: PredictionInputs) -> dict:
    """
    Construct the spec-compliant evidence dict.
    Prefers evidence_breakdown from the trust score engine where available,
    falls back to deriving from raw inputs.
    """
    eb = inputs.evidence_breakdown or {}

    def _get(key: str, default: dict) -> dict:
        return eb.get(key, default)

    evidence: dict = {}

    # OCR
    if inputs.ocr_accuracy is not None:
        ocr_score = round(inputs.ocr_accuracy * 100, 1)
        evidence["ocr"] = {
            "score": ocr_score,
            "status": _pass_warn_fail(ocr_score, 85, 70),
        }
    else:
        evidence["ocr"] = {"score": None, "status": "UNAVAILABLE"}

    # Classification
    if inputs.doc_classification_confidence is not None:
        cls_score = round(inputs.doc_classification_confidence * 100, 1)
        evidence["classification"] = {
            "score": cls_score,
            "status": _pass_warn_fail(cls_score, 80, 60),
        }
    else:
        evidence["classification"] = _get("classification", {"score": None, "status": "UNAVAILABLE"})

    # Field extraction
    if inputs.field_extraction_completeness is not None:
        fe_score = round(inputs.field_extraction_completeness * 100, 1)
        evidence["field_extraction"] = {
            "score": fe_score,
            "status": _pass_warn_fail(fe_score, 80, 60),
        }
    else:
        evidence["field_extraction"] = _get("field_extraction", {"score": None, "status": "UNAVAILABLE"})

    # Document comparison
    if inputs.comparison_consistency_pct is not None:
        evidence["comparison"] = {
            "score": round(inputs.comparison_consistency_pct, 1),
            "status": _pass_warn_fail(inputs.comparison_consistency_pct, 80, 60),
        }
    else:
        evidence["comparison"] = {"score": None, "status": "UNAVAILABLE"}

    # QR verification
    if inputs.qr_present is None:
        evidence["qr"] = {"status": "NOT_CHECKED"}
    elif not inputs.qr_present:
        evidence["qr"] = {"status": "NOT_FOUND"}
    elif inputs.qr_valid:
        evidence["qr"] = {"status": "VERIFIED"}
    else:
        evidence["qr"] = {"status": "INVALID"}

    # Blockchain
    if inputs.blockchain_status is None:
        evidence["blockchain"] = {"status": "NOT_CHECKED"}
    elif inputs.blockchain_status == "unavailable":
        evidence["blockchain"] = {"status": "NOT_AVAILABLE"}
    elif inputs.blockchain_status == "verified":
        evidence["blockchain"] = {"status": "MATCH"}
    elif inputs.blockchain_status == "mismatch":
        evidence["blockchain"] = {"status": "MISMATCH"}
    else:
        evidence["blockchain"] = {"status": "NOT_REGISTERED"}

    # Tampering
    if inputs.tampering_score is not None:
        ts = inputs.tampering_score
        evidence["tampering"] = {
            "score": round(ts, 1),
            "status": "LOW_RISK" if ts < 30 else ("MEDIUM_RISK" if ts < 60 else "HIGH_RISK"),
        }
    else:
        evidence["tampering"] = {"score": None, "status": "NOT_CHECKED"}

    # Duplicate
    if inputs.is_duplicate is None:
        evidence["duplicate"] = {"status": "NOT_CHECKED"}
    elif inputs.is_duplicate:
        evidence["duplicate"] = {"status": "DUPLICATE"}
    else:
        evidence["duplicate"] = {"status": "NOT_FOUND"}

    # Metadata (from trust score engine or default clean)
    evidence["metadata"] = _get("metadata", {"status": "CLEAN"})

    return evidence


# ---------------------------------------------------------------------------
# Reasons builder
# ---------------------------------------------------------------------------

def _build_reasons(
    inputs: PredictionInputs,
    label: str,
    score: float,
    fp: float,
) -> list[str]:
    reasons: list[str] = []

    # OCR
    if inputs.ocr_accuracy is not None:
        pct = round(inputs.ocr_accuracy * 100)
        if pct >= 85:
            reasons.append(f"✓ OCR confidence: {pct}% (high)")
        elif pct >= 70:
            reasons.append(f"⚠ OCR confidence: {pct}% (medium — some fields may need verification)")
        else:
            reasons.append(f"⚠ OCR confidence: {pct}% (low — extracted fields may be unreliable)")

    # Classification
    if inputs.doc_classification_confidence is not None:
        pct = round(inputs.doc_classification_confidence * 100)
        if pct >= 80:
            reasons.append(f"✓ Document type classified with {pct}% confidence")
        else:
            reasons.append(f"⚠ Document type classification confidence is low ({pct}%)")

    # Field extraction
    if inputs.field_extraction_completeness is not None:
        pct = round(inputs.field_extraction_completeness * 100)
        if pct >= 80:
            reasons.append(f"✓ {pct}% of expected fields were extracted successfully")
        else:
            reasons.append(f"⚠ Only {pct}% of expected fields could be extracted")

    # Comparison
    if inputs.comparison_consistency_pct is not None:
        pct = round(inputs.comparison_consistency_pct)
        if pct >= 80:
            reasons.append(f"✓ Cross-document comparison: {pct}% consistency")
        elif pct >= 60:
            reasons.append(f"⚠ Cross-document comparison shows partial consistency ({pct}%)")
        else:
            reasons.append(f"✗ Cross-document comparison found significant inconsistencies ({pct}%)")
    else:
        reasons.append("— Document comparison not run (single document verification)")

    # QR
    if inputs.qr_present is None:
        reasons.append("— QR verification not checked")
    elif not inputs.qr_present:
        reasons.append("— No QR code found on document (not automatically suspicious)")
    elif inputs.qr_valid:
        reasons.append("✓ QR code verified successfully")
    else:
        reasons.append("✗ QR code validation failed — possible forgery indicator")

    # Blockchain
    if inputs.blockchain_status == "verified":
        reasons.append("✓ Blockchain hash matched — document integrity confirmed")
    elif inputs.blockchain_status == "mismatch":
        reasons.append("✗ Blockchain hash MISMATCH — document may have been altered after registration")
    elif inputs.blockchain_status == "not_found":
        reasons.append("— Hash not found on blockchain (document may not be registered)")
    elif inputs.blockchain_status == "unavailable":
        reasons.append("— Blockchain verification unavailable (infrastructure not configured)")

    # Tampering
    if inputs.tampering_score is not None:
        ts = round(inputs.tampering_score)
        if ts < 30:
            reasons.append(f"✓ No significant tampering evidence detected (score {ts}/100)")
        elif ts < 60:
            reasons.append(f"⚠ Some tampering indicators detected (score {ts}/100) — review recommended")
        else:
            reasons.append(f"✗ Strong tampering evidence detected (score {ts}/100)")

    # Duplicate
    if inputs.is_duplicate is None:
        reasons.append("— Duplicate check not run")
    elif inputs.is_duplicate:
        reasons.append("✗ Duplicate certificate detected — this document matches an existing record")
    else:
        reasons.append("✓ No duplicate certificate detected")

    # Critical overrides
    if inputs.critical_overrides:
        for override in inputs.critical_overrides:
            if "blockchain_mismatch" in override:
                reasons.append("⚠ Blockchain mismatch triggered fraud probability floor (strong negative evidence)")
            elif "qr_invalid" in override:
                reasons.append("⚠ Invalid QR code triggered fraud probability floor")
            elif "tampering_severe" in override:
                reasons.append("⚠ Severe tampering score triggered fraud probability floor")
            elif "duplicate_floor" in override:
                reasons.append("⚠ Duplicate detection triggered maximum fraud probability floor")

    # Data completeness note
    if inputs.data_completeness < 0.5:
        reasons.append(
            f"⚠ Only {round(inputs.data_completeness * 100)}% of verification checks completed "
            f"— this verdict is based on partial evidence"
        )

    return reasons


# ---------------------------------------------------------------------------
# Helpers (unchanged from original, preserved for backward compatibility)
# ---------------------------------------------------------------------------

def _pass_warn_fail(value: float, pass_threshold: float, warn_threshold: float) -> str:
    if value >= pass_threshold:
        return "PASS"
    if value >= warn_threshold:
        return "WARN"
    return "FAIL"


def _boundary_distance(score: float, label: str) -> float:
    if label == "genuine":
        return min((score - GENUINE_THRESHOLD) / 20.0, 1.0)
    if label == "fake":
        return min((SUSPICIOUS_THRESHOLD - score) / SUSPICIOUS_THRESHOLD, 1.0)
    dist_from_lower = score - SUSPICIOUS_THRESHOLD
    dist_from_upper = GENUINE_THRESHOLD - score
    return min(min(dist_from_lower, dist_from_upper) / 15.0, 1.0)


def _build_explanation(inputs: PredictionInputs, label: str, score: float) -> str:
    """Plain text explanation — preserved for backward compatibility."""
    parts = [f"This certificate received a Trust Score of {score:.1f}/100."]

    if inputs.is_duplicate:
        parts.append(
            "It was flagged as a duplicate of another certificate already in the system "
            "— this alone is treated as strong fraud evidence."
        )

    if inputs.tampering_score is not None:
        if inputs.tampering_score >= 60:
            parts.append(f"Tampering analysis found significant indicators of editing (score {inputs.tampering_score:.0f}/100).")
        elif inputs.tampering_score >= 30:
            parts.append(f"Tampering analysis found some minor indicators worth reviewing (score {inputs.tampering_score:.0f}/100).")
        else:
            parts.append("No significant signs of tampering were detected.")

    if inputs.blockchain_status == "verified":
        parts.append("Its hash matches a record on the blockchain.")
    elif inputs.blockchain_status == "mismatch":
        parts.append("Its hash does NOT match the on-chain record — a strong red flag.")
    elif inputs.blockchain_status == "not_found":
        parts.append("Its hash was not found on the blockchain (it may simply not be registered yet).")

    if inputs.qr_present is False:
        parts.append("No QR code was found on the document.")
    elif inputs.qr_valid is False:
        parts.append("The QR code on the document failed validation.")
    elif inputs.qr_valid is True:
        parts.append("Its QR code validated successfully.")

    if inputs.comparison_consistency_pct is not None:
        if inputs.comparison_consistency_pct < 70:
            parts.append(f"Cross-document comparison found inconsistencies ({inputs.comparison_consistency_pct:.0f}% consistency).")
        else:
            parts.append(f"Cross-document comparison was consistent ({inputs.comparison_consistency_pct:.0f}%).")

    if inputs.ocr_accuracy is not None and inputs.ocr_accuracy < 0.6:
        parts.append("OCR extraction confidence was low, so some extracted fields may need manual verification.")

    if inputs.data_completeness < 0.5:
        parts.append("Note: not all verification checks have been run yet, so this assessment is based on partial data.")

    return " ".join(parts)


def _build_recommended_action(label: str, is_duplicate: bool | None) -> str:
    if is_duplicate:
        return "Reject this certificate and flag it for investigation — it duplicates another certificate already on file."
    if label == "genuine":
        return "No further action needed. This certificate passed verification."
    if label == "suspicious":
        return "Manual review recommended before relying on this certificate. Check the flagged factors above."
    return "Reject this certificate. Consider contacting the issuing institution to confirm its authenticity."
