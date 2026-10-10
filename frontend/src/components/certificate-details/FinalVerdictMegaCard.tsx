"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import {
  FinalPredictionResponse,
  TrustScoreResponse,
  FraudAnalysisResponse,
} from "@/lib/api";

interface FinalVerdictMegaCardProps {
  prediction: FinalPredictionResponse | null;
  trustScore: TrustScoreResponse | null;
  fraud: FraudAnalysisResponse | null;
  onPredict: () => void;
  onComputeTrust: () => void;
  predicting: boolean;
  computingTrust: boolean;
}

export const FinalVerdictMegaCard: React.FC<FinalVerdictMegaCardProps> = ({
  prediction,
  trustScore,
  fraud,
  onPredict,
  onComputeTrust,
  predicting,
  computingTrust,
}) => {
  const [animatedTrust, setAnimatedTrust] = useState(0);

  useEffect(() => {
    if (trustScore?.score != null) {
      const timer = setTimeout(() => setAnimatedTrust(trustScore.score), 100);
      return () => clearTimeout(timer);
    }
  }, [trustScore?.score]);

  // Verdict Theme Palette
  const label = prediction?.label || "pending";
  const theme = {
    genuine: {
      border: "border-[#4edea3]/40",
      glow: "shadow-[0_0_24px_rgba(78,222,163,0.12)]",
      badgeBg: "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30",
      accentText: "text-[#4edea3]",
      icon: ShieldCheck,
      bannerBg: "bg-gradient-to-r from-[#4edea3]/15 via-[#4edea3]/5 to-transparent",
      title: "Genuine Credential Verified",
    },
    suspicious: {
      border: "border-[#ffb95f]/40",
      glow: "shadow-[0_0_24px_rgba(255,185,95,0.12)]",
      badgeBg: "bg-[#ffb95f]/10 text-[#ffb95f] border-[#ffb95f]/30",
      accentText: "text-[#ffb95f]",
      icon: ShieldAlert,
      bannerBg: "bg-gradient-to-r from-[#ffb95f]/15 via-[#ffb95f]/5 to-transparent",
      title: "Suspicious Indicators Detected",
    },
    fake: {
      border: "border-[#ffb4ab]/40",
      glow: "shadow-[0_0_24px_rgba(255,180,171,0.12)]",
      badgeBg: "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30",
      accentText: "text-[#ffb4ab]",
      icon: ShieldX,
      bannerBg: "bg-gradient-to-r from-[#ffb4ab]/15 via-[#ffb4ab]/5 to-transparent",
      title: "High-Confidence Forensic Forgery / Fake",
    },
    pending: {
      border: "border-[#1b2b3f]",
      glow: "",
      badgeBg: "bg-[#102034] text-[#8d90a0] border-[#1b2b3f]",
      accentText: "text-[#8d90a0]",
      icon: Activity,
      bannerBg: "bg-[#102034]/50",
      title: "Awaiting Forensic Prediction",
    },
  }[label];

  const IconComponent = theme.icon;

  // Gauge parameters (270-degree arc)
  const scoreValue = trustScore?.score ?? 0;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeOffset = arcLength - ((animatedTrust || 0) / 100) * arcLength;

  const trustColor =
    scoreValue >= 80 ? "#4edea3" : scoreValue >= 50 ? "#ffb95f" : "#ffb4ab";

  const trustCategory =
    scoreValue >= 80
      ? "High Trust"
      : scoreValue >= 50
      ? "Moderate Trust"
      : "Low / Risk";

  const fraudProbability = fraud?.fraud_probability ?? prediction?.fraud_probability ?? null;
  const fraudPercent = fraudProbability != null ? Math.round(fraudProbability * 100) : null;

  return (
    <div
      className={`bg-[#0b1c30] border ${theme.border} ${theme.glow} rounded-[8px] p-5 sm:p-6 transition-all duration-300`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 7 Columns: Verdict, Explanation & Recommended Action */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-[8px] flex items-center justify-center border ${theme.border} bg-[#000f21]`}
            >
              <IconComponent size={26} className={theme.accentText} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#8d90a0]">
                  Official System Verdict
                </span>
                {prediction && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${theme.badgeBg}`}
                  >
                    {prediction.label} • {Math.round(prediction.confidence_score * 100)}% Confidence
                  </span>
                )}
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mt-0.5 ${theme.accentText}`}>
                {prediction ? theme.title : "Forensic Verification Pending"}
              </h2>
            </div>
          </div>

          {/* Explanation Text */}
          <p className="text-sm text-[#c3c6d7] leading-relaxed">
            {prediction?.explanation ||
              "Run the AI forensic engine to synthesize OCR extractions, cryptographic records, digital QR signatures, noise analysis, and duplicate detection into a unified verdict."}
          </p>

          {/* Recommended Action Pill */}
          {prediction?.recommended_action && (
            <div
              className={`p-3 rounded-[6px] text-xs leading-relaxed border ${theme.border} ${theme.bannerBg}`}
            >
              <span className="font-bold text-[#d3e4fe]">Recommended Protocol: </span>
              <span className="text-[#c3c6d7]">{prediction.recommended_action}</span>
            </div>
          )}

          {!prediction && (
            <div className="pt-1">
              <button
                onClick={onPredict}
                disabled={predicting}
                className="px-4 py-2 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-[4px] transition flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={14} />
                <span>{predicting ? "Running Classifier..." : "Execute AI Verdict Model"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Dual Forensic Gauges (Trust Score + Fraud Probability) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:border-l lg:border-[#1b2b3f] lg:pl-6">
          {/* Trust Score Radial Meter */}
          <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-4 flex flex-col items-center text-center">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] uppercase font-mono text-[#8d90a0] flex items-center gap-1">
                <Activity size={11} className="text-[#38bdf8]" /> Trust Score
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                style={{ color: trustColor, borderColor: `${trustColor}40`, backgroundColor: `${trustColor}15` }}
              >
                {trustScore ? trustCategory : "N/A"}
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-28 h-28 my-1 flex items-center justify-center">
              <svg width="112" height="112" viewBox="0 0 112 112" className="transform -rotate-90">
                {/* Background Arc */}
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  fill="none"
                  stroke="#102034"
                  strokeWidth="8"
                  strokeDasharray={`${arcLength} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(135 56 56)"
                />
                {/* Value Arc */}
                {trustScore && (
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke={trustColor}
                    strokeWidth="8"
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    transform="rotate(135 56 56)"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-[#d3e4fe]">
                  {trustScore ? Math.round(animatedTrust) : "—"}
                </span>
                <span className="text-[10px] font-mono text-[#8d90a0]">/ 100</span>
              </div>
            </div>

            <p className="text-[11px] text-[#8d90a0] mt-1">
              {trustScore ? "Multi-factor reliability" : "Awaiting computation"}
            </p>
          </div>

          {/* Statistical Fraud Probability Meter */}
          <div className="bg-[#000f21] border border-[#1b2b3f] rounded-[6px] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono text-[#8d90a0] flex items-center gap-1">
                  <TrendingUp size={11} className="text-[#ffb95f]" /> Fraud Risk
                </span>
                {fraudPercent != null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      fraudPercent < 30
                        ? "text-[#4edea3] border-[#4edea3]/30 bg-[#4edea3]/10"
                        : fraudPercent < 60
                        ? "text-[#ffb95f] border-[#ffb95f]/30 bg-[#ffb95f]/10"
                        : "text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/10"
                    }`}
                  >
                    {fraudPercent < 30 ? "Low" : fraudPercent < 60 ? "Moderate" : "High Risk"}
                  </span>
                )}
              </div>

              <div className="my-2">
                <div className="text-3xl font-bold font-mono text-[#d3e4fe]">
                  {fraudPercent != null ? `${fraudPercent}%` : "—"}
                </div>
                <p className="text-[10px] text-[#8d90a0] uppercase font-mono mt-0.5">
                  Calculated Risk Index
                </p>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[#102034] rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    (fraudPercent || 0) < 30
                      ? "bg-[#4edea3]"
                      : (fraudPercent || 0) < 60
                      ? "bg-[#ffb95f]"
                      : "bg-[#ffb4ab]"
                  }`}
                  style={{ width: `${fraudPercent || 0}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-[#8d90a0] mt-3 leading-tight italic">
              Statistical risk metric. Final verdict above dictates system decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
