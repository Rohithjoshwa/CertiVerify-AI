"use client";

import React, { useState } from "react";
import { ShieldCheck, Copy, Check, Hash, Cpu, ExternalLink } from "lucide-react";
import { CertificateResponse } from "@/lib/api";

interface BlockchainRegistryCardProps {
  latestCertificate?: CertificateResponse | null;
}

export const BlockchainRegistryCard: React.FC<BlockchainRegistryCardProps> = ({
  latestCertificate,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    if (!latestCertificate?.sha256_hash) return;
    navigator.clipboard.writeText(latestCertificate.sha256_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#2563eb]/15 border border-[#2563eb]/30 flex items-center justify-center text-[#38bdf8]">
            <Cpu size={14} />
          </div>
          <h2 className="text-xs font-semibold text-[#d3e4fe] uppercase tracking-wider font-mono">
            Blockchain & Ingestion Ledger Registry
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3]">
          LEDGER ACTIVE
        </span>
      </div>

      {/* Network & Ledger Specs */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5">
          <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Registry Protocol</p>
          <p className="text-xs font-semibold text-[#d3e4fe] font-mono mt-0.5">
            EVM Smart Contract
          </p>
        </div>
        <div className="bg-[#102034] border border-[#1b2b3f] rounded-[4px] p-2.5">
          <p className="text-[10px] font-mono uppercase text-[#8d90a0]">Digest Algorithm</p>
          <p className="text-xs font-semibold text-[#4edea3] font-mono mt-0.5">
            FIPS 180-4 SHA-256
          </p>
        </div>
      </div>

      {/* Latest Ingested Document Anchor */}
      {latestCertificate ? (
        <div className="bg-[#102034] border border-[#1b2b3f] rounded-[6px] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#8d90a0] flex items-center gap-1">
              <Hash size={11} className="text-[#38bdf8]" />
              Latest Ingest Hash
            </span>
            <span className="text-[10px] font-mono text-[#8d90a0] truncate max-w-[150px]">
              {latestCertificate.original_filename}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-[#000f21] border border-[#1b2b3f] rounded-[4px]">
            <code className="text-[11px] font-mono text-[#38bdf8] break-all select-all">
              {latestCertificate.sha256_hash}
            </code>
            <button
              onClick={handleCopyHash}
              className="p-1.5 rounded-[3px] bg-[#102034] hover:bg-[#1b2b3f] text-[#8d90a0] hover:text-[#d3e4fe] transition shrink-0"
              title="Copy full SHA-256 hash"
            >
              {copied ? <Check size={13} className="text-[#4edea3]" /> : <Copy size={13} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#8d90a0] pt-1">
            <span>
              Cert ID:{" "}
              <span className="text-[#d3e4fe]">{latestCertificate.id.slice(0, 8)}...</span>
            </span>
            <span className="text-[#ffb95f] flex items-center gap-1">
              <ShieldCheck size={11} /> Verification Ready in Cockpit
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-[#102034]/50 border border-dashed border-[#1b2b3f] rounded-[6px] p-4 text-center">
          <p className="text-xs text-[#8d90a0] font-sans">
            No document ingested in current session.
          </p>
          <p className="text-[10px] font-mono text-[#8d90a0]/70 mt-1">
            Drop or select a file to compute cryptographic digest and anchor to ledger.
          </p>
        </div>
      )}

      {/* Honest Blockchain Status Disclosure */}
      <div className="text-[11px] text-[#8d90a0] font-sans bg-[#000f21]/40 border border-[#1b2b3f] rounded-[4px] p-2.5 flex items-start gap-2">
        <ShieldCheck size={14} className="text-[#38bdf8] shrink-0 mt-0.5" />
        <div>
          <span className="text-[#d3e4fe] font-medium font-sans">Anchoring Security Note:</span>{" "}
          Files are hashed locally at ingestion. Full on-chain transaction anchoring and multi-layer
          verification take place when running verification inside the Inspection Cockpit.
        </div>
      </div>
    </div>
  );
};
