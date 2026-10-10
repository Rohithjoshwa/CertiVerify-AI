"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  Database,
  Key,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { authApi, getAccessToken, UserResponse } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    authApi.me().then((res) => setUser(res.data)).catch(() => null);
  }, [router]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">System Settings</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Settings size={22} className="text-[#38bdf8]" />
            Enterprise Platform Settings & Preferences
          </h1>
          <p className="text-xs text-[#8d90a0]">
            User account, verification engine rules, security policy, and UI theme preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Settings */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#d3e4fe] pb-2 border-b border-[#1b2b3f]">
            <User size={16} className="text-[#38bdf8]" />
            <span>Authenticated User Account</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#8d90a0] uppercase block">Full Name</span>
              <div className="text-sm font-bold text-[#d3e4fe] font-sans">{user?.full_name || "Enterprise User"}</div>
            </div>

            <div>
              <span className="text-[10px] text-[#8d90a0] uppercase block">Email Address</span>
              <div className="text-xs text-[#38bdf8] font-bold">{user?.email || "user@certiverify.io"}</div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] text-[#8d90a0] uppercase block">Role</span>
                <span className="text-[#4edea3] font-bold uppercase">{user?.role || "ADMIN"}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8d90a0] uppercase block">Email Status</span>
                <span className="text-[#4edea3] font-bold">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Engine Security Rules */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#d3e4fe] pb-2 border-b border-[#1b2b3f]">
            <Shield size={16} className="text-[#4edea3]" />
            <span>Verification Engine Rules</span>
          </div>

          <div className="space-y-2.5 text-xs text-[#c3c6d7]">
            <div className="flex items-center justify-between p-2 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span>Automatic ELA Tamper Analysis</span>
              <span className="font-mono text-[10px] text-[#4edea3] font-bold">ENABLED</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span>QR Cross-Validation & Hash Matching</span>
              <span className="font-mono text-[10px] text-[#4edea3] font-bold">ENABLED</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span>Blockchain On-Chain Hash Registry</span>
              <span className="font-mono text-[10px] text-[#4edea3] font-bold">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#d3e4fe] pb-2 border-b border-[#1b2b3f]">
            <Database size={16} className="text-[#38bdf8]" />
            <span>System Information & Telemetry</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span className="text-[10px] text-[#8d90a0] block">VERSION</span>
              <span className="text-[#d3e4fe] font-bold">CertiVerify v2.0 Enterprise</span>
            </div>
            <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span className="text-[10px] text-[#8d90a0] block">FRAMEWORK</span>
              <span className="text-[#38bdf8] font-bold">Next.js 14 / FastAPI</span>
            </div>
            <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span className="text-[10px] text-[#8d90a0] block">THEME</span>
              <span className="text-[#4edea3] font-bold">Enterprise Dark Navy</span>
            </div>
            <div className="p-3 bg-[#000f21] border border-[#1b2b3f] rounded">
              <span className="text-[10px] text-[#8d90a0] block">SECURITY</span>
              <span className="text-[#4edea3] font-bold">Tenant Isolated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
