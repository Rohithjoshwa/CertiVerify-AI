"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ScrollText,
  Search,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Shield,
  Eye,
  Lock,
  ChevronRight,
  FileQuestion,
  X,
} from "lucide-react";
import { auditLogApi, getAccessToken, AuditLogResponse } from "@/lib/api";

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [search, setSearch] = useState("");
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);

  const fetchLogs = async () => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const { data } = await auditLogApi.list({ limit, offset });
      setLogs(data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setPermissionDenied(true);
      } else {
        setError(err?.response?.data?.detail || "Failed to load audit logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [offset]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      (log.entity_id || "").toLowerCase().includes(q) ||
      (log.actor_user_id || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">Audit Logs</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <ScrollText size={22} className="text-[#38bdf8]" />
            Enterprise Immutable Audit Event Logs
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Organization-scoped security event stream for compliance auditing and governance tracking.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 bg-[#000f21] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded shrink-0"
          title="Refresh logs"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {permissionDenied ? (
        <div className="p-10 bg-[#0b1c30] border border-[#ffb4ab]/30 rounded-[8px] text-center space-y-3">
          <Lock size={36} className="text-[#ffb4ab] mx-auto" />
          <h2 className="text-base font-bold text-[#d3e4fe]">Access Restricted: Permission Denied</h2>
          <p className="text-xs text-[#8d90a0] max-w-md mx-auto">
            Viewing enterprise audit logs requires the <code className="text-[#38bdf8] font-mono">audit:read</code> permission scope. Please contact your organization owner to request access.
          </p>
        </div>
      ) : (
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden space-y-0">
          {/* Controls Bar */}
          <div className="p-4 border-b border-[#1b2b3f] flex items-center justify-between gap-3 bg-[#0b1c30]">
            <div className="relative w-full md:w-80">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0]" />
              <input
                type="text"
                placeholder="Search by action, entity, user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            <span className="text-xs font-mono text-[#8d90a0]">
              Showing {filteredLogs.length} events
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-2">
              <Loader2 size={24} className="animate-spin text-[#38bdf8] mx-auto" />
              <p className="text-xs font-mono text-[#8d90a0]">Fetching audit log stream...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-[#ffb4ab]">
              <AlertTriangle size={24} className="mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <FileQuestion size={36} className="text-[#8d90a0] mx-auto opacity-50" />
              <p className="text-xs text-[#8d90a0]">No audit log events recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#000f21] text-[#8d90a0] border-b border-[#1b2b3f] font-mono text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action Event</th>
                    <th className="px-4 py-3">Entity Type</th>
                    <th className="px-4 py-3">Entity ID</th>
                    <th className="px-4 py-3">Actor User</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2b3f]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#102034]/60 transition">
                      <td className="px-4 py-3 font-mono text-[10px] text-[#8d90a0] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#38bdf8]">
                        {log.action}
                      </td>

                      <td className="px-4 py-3 font-mono text-[10px] text-[#c3c6d7] uppercase">
                        {log.entity_type}
                      </td>

                      <td className="px-4 py-3 font-mono text-[10px] text-[#8d90a0]">
                        {log.entity_id ? log.entity_id.slice(0, 16) : "N/A"}
                      </td>

                      <td className="px-4 py-3 font-mono text-[10px] text-[#8d90a0]">
                        {log.actor_user_id ? `User:${log.actor_user_id.slice(0, 8)}` : "System"}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {log.metadata_json && (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1 text-[#38bdf8] hover:bg-[#102034] rounded"
                            title="View Metadata"
                          >
                            <Eye size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="p-3 bg-[#000f21] border-t border-[#1b2b3f] flex items-center justify-between text-xs font-mono text-[#8d90a0]">
            <span>Offset: {offset}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset((o) => Math.max(0, o - limit))}
                disabled={offset === 0}
                className="px-3 py-1 bg-[#0b1c30] border border-[#1b2b3f] rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset((o) => o + limit)}
                disabled={logs.length < limit}
                className="px-3 py-1 bg-[#0b1c30] border border-[#1b2b3f] rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1c30] border border-[#1b2b3f] w-full max-w-lg rounded-[8px] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2b3f]">
              <div>
                <span className="font-mono text-[10px] text-[#8d90a0] uppercase block">AUDIT LOG METADATA</span>
                <div className="text-xs font-mono font-bold text-[#38bdf8]">{selectedLog.action}</div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-[#8d90a0] hover:text-white">
                <X size={14} />
              </button>
            </div>

            <pre className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded text-[11px] font-mono text-[#4edea3] overflow-x-auto max-h-64">
              {JSON.stringify(selectedLog.metadata_json, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
