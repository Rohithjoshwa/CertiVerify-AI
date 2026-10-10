"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Shield,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import {
  orgApi,
  getAccessToken,
  OrganizationResponse,
  OrganizationMemberResponse,
} from "@/lib/api";

export default function OrganizationPage() {
  const router = useRouter();
  const [org, setOrg] = useState<OrganizationResponse | null>(null);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New org modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchOrgData = async () => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [orgRes, membersRes] = await Promise.allSettled([
        orgApi.getMyOrg(),
        orgApi.getMembers(),
      ]);

      if (orgRes.status === "fulfilled") setOrg(orgRes.value.data);
      else setError("No organization found for current account.");

      if (membersRes.status === "fulfilled") setMembers(membersRes.value.data || []);
    } catch {
      setError("Failed to load organization data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      await orgApi.create({ name: newOrgName });
      setShowCreateModal(false);
      setNewOrgName("");
      await fetchOrgData();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to create organization.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">Organizations & Members</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Building2 size={22} className="text-[#38bdf8]" />
            Organization Management & Governance
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Manage current tenant workspace, role-based access control (RBAC), and team members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
          >
            <Plus size={14} />
            <span>Create Organization</span>
          </button>
          <button
            onClick={fetchOrgData}
            className="p-2 bg-[#000f21] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 size={24} className="animate-spin text-[#38bdf8] mx-auto" />
          <p className="text-xs font-mono text-[#8d90a0]">Loading organization workspace...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-[#0b1c30] border border-[#ffb4ab]/30 rounded-[8px] text-center space-y-3">
          <AlertTriangle size={32} className="text-[#ffb4ab] mx-auto" />
          <h3 className="text-sm font-semibold text-[#d3e4fe]">{error}</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#2563eb] text-white text-xs font-semibold rounded inline-block"
          >
            Create First Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Current Organization Info (5 cols) */}
          <div className="lg:col-span-5 bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
              <span className="font-mono text-[10px] text-[#8d90a0] uppercase font-bold tracking-wider">
                ACTIVE TENANT DETAILS
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 rounded uppercase font-bold">
                {org?.status || "ACTIVE"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#8d90a0] uppercase block font-semibold">
                  Organization Name
                </label>
                <div className="text-base font-bold text-[#d3e4fe] mt-0.5">{org?.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded">
                  <span className="text-[10px] text-[#8d90a0] block">SLUG</span>
                  <span className="text-[#38bdf8] font-semibold">{org?.slug}</span>
                </div>
                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded">
                  <span className="text-[10px] text-[#8d90a0] block">CREATED</span>
                  <span className="text-[#8d90a0]">
                    {org?.created_at ? new Date(org.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <span className="text-[10px] text-[#8d90a0] uppercase block">ORGANIZATION ID (UUID)</span>
                <div className="p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded text-[11px] text-[#8d90a0] font-mono">
                  {org?.id}
                </div>
              </div>
            </div>
          </div>

          {/* Members & Roles Table (7 cols) */}
          <div className="lg:col-span-7 bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
              <h2 className="text-sm font-semibold text-[#d3e4fe] flex items-center gap-2">
                <Users size={16} className="text-[#38bdf8]" />
                Organization Members ({members.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#000f21] text-[#8d90a0] border-b border-[#1b2b3f] font-mono text-[10px] uppercase">
                  <tr>
                    <th className="px-3 py-2.5">User ID</th>
                    <th className="px-3 py-2.5">Assigned Role</th>
                    <th className="px-3 py-2.5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b2b3f]">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#102034]/60 transition">
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[#d3e4fe]">
                        {m.user_id}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          m.role === "owner"
                            ? "bg-[#2563eb]/20 text-[#38bdf8] border border-[#2563eb]/40"
                            : "bg-[#102034] text-[#8d90a0]"
                        }`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-[#8d90a0] whitespace-nowrap">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1c30] border border-[#1b2b3f] w-full max-w-md rounded-[8px] p-6 space-y-4">
            <h2 className="text-base font-bold text-[#d3e4fe]">Create New Organization</h2>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#8d90a0]">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Enterprise Verification"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] text-xs px-3 py-2 rounded focus:outline-none focus:border-[#2563eb]"
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
                  {creating ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
