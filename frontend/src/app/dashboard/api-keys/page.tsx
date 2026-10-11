"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Key,
  Plus,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Shield,
  Lock,
  Eye,
  X,
} from "lucide-react";
import {
  apiKeyApi,
  getAccessToken,
  ApiKeyResponse,
  ApiKeyCreateResponse,
} from "@/lib/api";

export default function ApiKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Key Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [rateLimit, setRateLimit] = useState(100);
  const [creating, setCreating] = useState(false);

  // One-time Raw Key Modal
  const [createdKey, setCreatedKey] = useState<ApiKeyCreateResponse | null>(null);
  const [copiedRawKey, setCopiedRawKey] = useState(false);

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    try {
      const { data } = await apiKeyApi.list();
      setKeys(data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setPermissionDenied(true);
      } else {
        setError(err?.response?.data?.detail || "Failed to load API keys.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setCreating(true);
    try {
      const { data } = await apiKeyApi.create({
        name: keyName,
        permissions: ["certificate:read", "certificate:verify"],
        rate_limit: Number(rateLimit),
      });
      setShowCreateModal(false);
      setKeyName("");
      setCreatedKey(data); // Shows one-time display modal!
      await fetchKeys();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to generate API key.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this API Key?\n\nAny external integrations using this key will immediately lose access."
    );
    if (!confirmed) return;

    setRevokingId(keyId);
    try {
      await apiKeyApi.revoke(keyId);
      await fetchKeys();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to revoke API key.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyRawKey = () => {
    if (!createdKey?.raw_key) return;
    navigator.clipboard.writeText(createdKey.raw_key);
    setCopiedRawKey(true);
    setTimeout(() => setCopiedRawKey(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">API Keys</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Key size={22} className="text-[#38bdf8]" />
            Enterprise API Keys Management
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Generate and manage API keys for programmatic verification ingestion and webhook integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-blue-600 transition shadow-sm"
          >
            <Plus size={14} />
            <span>Generate New Key</span>
          </button>
          <button
            onClick={fetchKeys}
            className="p-2 bg-[#000f21] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Keys Table or Permission Denied */}
      {permissionDenied ? (
        <div className="p-10 bg-[#0b1c30] border border-[#ffb4ab]/30 rounded-[8px] text-center space-y-3">
          <Lock size={36} className="text-[#ffb4ab] mx-auto" />
          <h2 className="text-base font-bold text-[#d3e4fe]">Access Restricted: Permission Denied</h2>
          <p className="text-xs text-[#8d90a0] max-w-md mx-auto">
            Managing API keys requires the <code className="text-[#38bdf8] font-mono">api_key:write</code> permission scope. Please contact your organization owner or administrator.
          </p>
        </div>
      ) : (
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 size={24} className="animate-spin text-[#38bdf8] mx-auto" />
            <p className="text-xs font-mono text-[#8d90a0]">Querying organization API keys...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#ffb4ab] space-y-2">
            <AlertTriangle size={24} className="mx-auto" />
            <p>{error}</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Key size={36} className="text-[#8d90a0] mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-[#d3e4fe]">No API Keys Generated</h3>
            <p className="text-xs text-[#8d90a0] max-w-sm mx-auto">
              Create an API key to allow external systems to ingest certificates and query verification status.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded inline-block"
            >
              Generate First API Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#000f21] text-[#8d90a0] border-b border-[#1b2b3f] font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Key Name</th>
                  <th className="px-4 py-3">Key Prefix</th>
                  <th className="px-4 py-3">Rate Limit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Last Used</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2b3f]">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#102034]/60 transition">
                    <td className="px-4 py-3 font-semibold text-[#d3e4fe]">
                      {k.name}
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-[#38bdf8]">
                      {k.key_prefix}••••••••
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-[#8d90a0]">
                      {k.rate_limit} req/min
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          k.status === "active"
                            ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                            : "bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30"
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-[#8d90a0] whitespace-nowrap">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-[#8d90a0] whitespace-nowrap">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {k.status === "active" && (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          disabled={revokingId === k.id}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded transition disabled:opacity-50"
                        >
                          {revokingId === k.id ? "Revoking..." : "Revoke"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1c30] border border-[#1b2b3f] w-full max-w-md rounded-[8px] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#d3e4fe]">Generate Enterprise API Key</h2>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8d90a0]">Key Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Ingestion Service"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8d90a0]">Rate Limit (requests / minute)</label>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-[#8d90a0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {creating ? "Generating..." : "Generate Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-Time Display Modal for Secret Key */}
      {createdKey && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1c30] border border-[#4edea3]/40 w-full max-w-lg rounded-[8px] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#4edea3] font-bold text-sm font-mono">
              <Lock size={16} />
              <span>API KEY GENERATED SUCCESSFULLY</span>
            </div>

            <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded text-xs text-[#ffb4ab] space-y-1">
              <strong className="block font-bold">IMPORTANT SECURITY NOTICE:</strong>
              <p>
                Save this key in a secure location now. For security, it will <strong>NEVER be displayed again</strong>.
              </p>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[10px] text-[#8d90a0] uppercase block">Raw API Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdKey.raw_key}
                  className="w-full bg-[#000f21] border border-[#4edea3]/40 text-[#4edea3] font-mono text-xs p-2.5 rounded font-semibold select-all"
                />
                <button
                  onClick={handleCopyRawKey}
                  className="px-3 py-2.5 bg-[#4edea3] text-[#000f21] font-bold text-xs rounded hover:bg-emerald-400 flex items-center gap-1 shrink-0"
                >
                  {copiedRawKey ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedRawKey ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setCreatedKey(null)}
                className="px-4 py-2 bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] font-semibold text-xs rounded border border-[#1b2b3f]"
              >
                Done / I Have Saved My Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
