"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Webhook,
  Plus,
  RefreshCw,
  Trash2,
  Play,
  History,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  X,
  Lock,
} from "lucide-react";
import {
  webhookApi,
  getAccessToken,
  WebhookResponse,
  WebhookDeliveryResponse,
} from "@/lib/api";

export default function WebhooksPage() {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState<WebhookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Register Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "verification.completed",
    "fraud.alert",
  ]);
  const [creating, setCreating] = useState(false);

  // Created Webhook Secret One-Time Display
  const [createdWebhook, setCreatedWebhook] = useState<WebhookResponse | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Delivery History Drawer
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDeliveryResponse[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  // Test Delivery State
  const [testingId, setTestingId] = useState<string | null>(null);

  const ALL_EVENTS = [
    "verification.completed",
    "verification.failed",
    "fraud.alert",
    "tampering.detected",
    "duplicate.detected",
    "job.status_changed",
  ];

  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    try {
      const { data } = await webhookApi.list();
      setWebhooks(data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setPermissionDenied(true);
      } else {
        setError(err?.response?.data?.detail || "Failed to load webhooks.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpointUrl.trim()) return;
    setCreating(true);
    try {
      const { data } = await webhookApi.create({
        endpoint_url: endpointUrl,
        subscribed_events: selectedEvents,
      });
      setShowCreateModal(false);
      setEndpointUrl("");
      setCreatedWebhook(data); // Shows secret ONCE!
      await fetchWebhooks();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to register webhook endpoint.");
    } finally {
      setCreating(false);
    }
  };

  const handleTestDelivery = async (webhookId: string) => {
    setTestingId(webhookId);
    try {
      const { data } = await webhookApi.testDelivery(webhookId);
      alert(`Test delivery completed!\nStatus Code: ${data.response_status || "N/A"}\nStatus: ${data.status}`);
      if (selectedWebhookId === webhookId) {
        handleViewDeliveries(webhookId);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Test delivery failed.");
    } finally {
      setTestingId(null);
    }
  };

  const handleViewDeliveries = async (webhookId: string) => {
    setSelectedWebhookId(webhookId);
    setLoadingDeliveries(true);
    try {
      const { data } = await webhookApi.listDeliveries(webhookId);
      setDeliveries(data);
    } catch {
      setDeliveries([]);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!window.confirm("Delete this webhook endpoint permanently?")) return;
    try {
      await webhookApi.delete(webhookId);
      if (selectedWebhookId === webhookId) setSelectedWebhookId(null);
      await fetchWebhooks();
    } catch {
      alert("Failed to delete webhook endpoint.");
    }
  };

  const handleToggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">Webhooks</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Webhook size={22} className="text-[#38bdf8]" />
            Enterprise Webhook Notifications Engine
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Configure HTTP POST endpoints to receive real-time cryptographic verification events and fraud alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
          >
            <Plus size={14} />
            <span>Register Webhook</span>
          </button>
          <button
            onClick={fetchWebhooks}
            className="p-2 bg-[#000f21] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {permissionDenied ? (
        <div className="p-10 bg-[#0b1c30] border border-[#ffb4ab]/30 rounded-[8px] text-center space-y-3">
          <Lock size={36} className="text-[#ffb4ab] mx-auto" />
          <h2 className="text-base font-bold text-[#d3e4fe]">Access Restricted: Permission Denied</h2>
          <p className="text-xs text-[#8d90a0] max-w-md mx-auto">
            Configuring webhooks requires the <code className="text-[#38bdf8] font-mono">webhook:manage</code> permission scope. Please contact your organization owner or administrator.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Webhook Endpoints List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <Loader2 size={24} className="animate-spin text-[#38bdf8] mx-auto" />
                <p className="text-xs font-mono text-[#8d90a0]">Querying webhook endpoints...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-xs text-[#ffb4ab]">
                <AlertTriangle size={24} className="mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : webhooks.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Webhook size={36} className="text-[#8d90a0] mx-auto opacity-50" />
                <h3 className="text-sm font-semibold text-[#d3e4fe]">No Webhooks Configured</h3>
                <p className="text-xs text-[#8d90a0] max-w-sm mx-auto">
                  Register a target endpoint URL to receive automated callbacks when verification jobs finish.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded inline-block"
                >
                  Register First Webhook
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#1b2b3f]">
                {webhooks.map((ep) => (
                  <div key={ep.id} className="p-4 space-y-3 hover:bg-[#102034]/40 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              ep.active
                                ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                                : "bg-[#102034] text-[#8d90a0]"
                            }`}
                          >
                            {ep.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#d3e4fe] break-all">
                            {ep.endpoint_url}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#8d90a0]">
                          ID: {ep.id} | Registered: {new Date(ep.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteWebhook(ep.id)}
                        className="p-1 text-[#8d90a0] hover:text-[#ffb4ab] rounded"
                        title="Delete Webhook"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Subscribed Events Tags */}
                    <div className="flex flex-wrap gap-1">
                      {ep.subscribed_events.map((evt) => (
                        <span
                          key={evt}
                          className="font-mono text-[9px] px-1.5 py-0.5 bg-[#000f21] text-[#38bdf8] border border-[#1b2b3f] rounded"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#1b2b3f]/60 font-mono text-xs">
                      <button
                        onClick={() => handleTestDelivery(ep.id)}
                        disabled={testingId === ep.id}
                        className="px-2.5 py-1 bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] rounded border border-[#1b2b3f] inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {testingId === ep.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Play size={11} />
                        )}
                        <span>Test Ping</span>
                      </button>

                      <button
                        onClick={() => handleViewDeliveries(ep.id)}
                        className="px-2.5 py-1 bg-[#000f21] hover:bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe] rounded border border-[#1b2b3f] inline-flex items-center gap-1"
                      >
                        <History size={11} />
                        <span>Delivery Log</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Delivery Logs Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedWebhookId ? (
            <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2b3f]">
                <div>
                  <span className="text-[10px] font-mono text-[#8d90a0] uppercase block">DELIVERY LOG STREAM</span>
                  <div className="text-xs font-mono font-bold text-[#d3e4fe]">Webhook {selectedWebhookId.slice(0, 12)}…</div>
                </div>
                <button onClick={() => setSelectedWebhookId(null)} className="text-[#8d90a0] hover:text-white">
                  <X size={14} />
                </button>
              </div>

              {loadingDeliveries ? (
                <div className="py-12 text-center text-xs font-mono text-[#8d90a0]">
                  <Loader2 size={20} className="animate-spin text-[#38bdf8] mx-auto mb-2" />
                  Loading delivery history...
                </div>
              ) : deliveries.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8d90a0]">
                  No delivery attempts recorded yet for this webhook.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {deliveries.map((del) => (
                    <div key={del.id} className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded text-xs space-y-1.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#38bdf8]">{del.event_type}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold uppercase ${
                          del.status === "DELIVERED"
                            ? "bg-[#4edea3]/10 text-[#4edea3]"
                            : "bg-[#ffb4ab]/10 text-[#ffb4ab]"
                        }`}>
                          HTTP {del.response_status || "ERR"} ({del.status})
                        </span>
                      </div>

                      <div className="text-[10px] text-[#8d90a0]">
                        Attempt #{del.attempt_count} | Sent: {new Date(del.created_at).toLocaleTimeString()}
                      </div>

                      <pre className="p-2 bg-[#0b1c30] rounded text-[9px] text-[#8d90a0] overflow-x-auto max-h-24">
                        {JSON.stringify(del.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-8 text-center text-xs text-[#8d90a0]">
              Select "Delivery Log" on any webhook to inspect delivery status, response codes, and payload logs.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Register Webhook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1c30] border border-[#1b2b3f] w-full max-w-md rounded-[8px] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#d3e4fe]">Register Webhook Endpoint</h2>
            <form onSubmit={handleRegisterWebhook} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8d90a0]">Endpoint URL (HTTPS)</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks/certiverify"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-[#8d90a0] block">Subscribed Events</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {ALL_EVENTS.map((evt) => (
                    <label key={evt} className="flex items-center gap-2 text-xs text-[#c3c6d7] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(evt)}
                        onChange={() => handleToggleEvent(evt)}
                        className="rounded border-[#1b2b3f] bg-[#000f21]"
                      />
                      <span className="font-mono text-[11px]">{evt}</span>
                    </label>
                  ))}
                </div>
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
                  {creating ? "Registering..." : "Register Endpoint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-Time Webhook Secret Modal */}
      {createdWebhook?.secret && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1c30] border border-[#4edea3]/40 w-full max-w-lg rounded-[8px] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#4edea3] font-bold text-sm font-mono">
              <Lock size={16} />
              <span>WEBHOOK SECRET GENERATED</span>
            </div>

            <p className="text-xs text-[#8d90a0]">
              This HMAC secret is used to sign webhook POST signatures. Save it now as it will <strong>NEVER be shown again</strong>.
            </p>

            <div className="space-y-1 font-mono text-xs">
              <label className="text-[10px] text-[#8d90a0] uppercase block">HMAC Secret</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdWebhook.secret}
                  className="w-full bg-[#000f21] border border-[#4edea3]/40 text-[#4edea3] font-mono text-xs p-2.5 rounded font-semibold select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdWebhook.secret!);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="px-3 py-2.5 bg-[#4edea3] text-[#000f21] font-bold text-xs rounded hover:bg-emerald-400 flex items-center gap-1 shrink-0"
                >
                  {copiedSecret ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSecret ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setCreatedWebhook(null)}
                className="px-4 py-2 bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] font-semibold text-xs rounded border border-[#1b2b3f]"
              >
                Done / Saved Secret
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
