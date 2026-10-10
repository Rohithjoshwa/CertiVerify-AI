"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Upload,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { orgApi, OrganizationResponse, getAccessToken } from "@/lib/api";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const ROUTE_BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Overview Dashboard",
  "/dashboard/certificates": "Certificate Registry",
  "/dashboard/upload": "Upload Certificate",
  "/dashboard/jobs": "Verification Jobs",
  "/dashboard/evidence": "Evidence Explorer",
  "/dashboard/reports": "Verification Reports",
  "/dashboard/history": "Verification History",
  "/dashboard/organization": "Organization & Members",
  "/dashboard/api-keys": "API Keys Management",
  "/dashboard/webhooks": "Webhooks Engine",
  "/dashboard/audit-logs": "Audit Logs",
  "/dashboard/settings": "System Settings",
};

function getBreadcrumb(pathname: string): string {
  if (ROUTE_BREADCRUMBS[pathname]) return ROUTE_BREADCRUMBS[pathname];
  if (pathname.startsWith("/dashboard/certificates/")) return "Certificate Verification Cockpit";
  if (pathname.startsWith("/dashboard/jobs/")) return "Job Detail View";
  return "Enterprise Verification Platform";
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const pathname = usePathname();
  const [org, setOrg] = useState<OrganizationResponse | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getAccessToken()) return;
    orgApi
      .getMyOrg()
      .then((res) => setOrg(res.data))
      .catch(() => setOrg(null));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setShowOrgDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sampleAlerts = [
    {
      id: "1",
      title: "Verification Engine Ready",
      message: "OCR, Blockchain and Tamper Analysis services are online.",
      type: "info",
      time: "Just now",
    },
    {
      id: "2",
      title: "Security Boundary Enforced",
      message: "Tenant isolation and RBAC security rules verified.",
      type: "success",
      time: "5 min ago",
    },
  ];

  return (
    <header className="h-[64px] bg-[#000f21] border-b border-[#1b2b3f] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 text-[#8d90a0] hover:text-[#d3e4fe] hover:bg-[#102034] rounded-[4px] border border-[#1b2b3f] lg:hidden shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 truncate">
          <div className="lg:hidden shrink-0">
            <Logo size="sm" isDark={true} href="/dashboard" ariaLabel="CertiVerify Home" />
          </div>
          <span className="text-xs font-mono text-[#8d90a0] hidden lg:inline-block">
            CertiVerify /
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#d3e4fe] truncate font-sans">
            {getBreadcrumb(pathname)}
          </span>
        </div>
      </div>

      {/* Organization Switcher (Top Bar) */}
      <div className="hidden lg:flex items-center relative" ref={orgRef}>
        <button
          onClick={() => setShowOrgDropdown(!showOrgDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0b1c30] hover:bg-[#102034] border border-[#1b2b3f] rounded-[4px] text-xs transition-colors"
          title="Current Organization"
        >
          <Building2 size={14} className="text-[#38bdf8]" />
          <span className="font-medium text-[#d3e4fe] max-w-[160px] truncate">
            {org ? org.name : "Default Organization"}
          </span>
          <span className="font-mono text-[9px] px-1 py-0.5 bg-[#102034] text-[#8d90a0] border border-[#1b2b3f] rounded">
            {org ? org.slug : "tenant"}
          </span>
          <ChevronDown size={13} className="text-[#8d90a0]" />
        </button>

        {showOrgDropdown && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#0b1c30] border border-[#1b2b3f] rounded-[6px] shadow-2xl p-3 z-50">
            <div className="text-[10px] font-mono text-[#8d90a0] uppercase tracking-wider mb-2 font-semibold">
              Current Organization
            </div>
            <div className="p-2 bg-[#102034] rounded-[4px] border border-[#1b2b3f] mb-3">
              <div className="text-xs font-semibold text-[#d3e4fe]">{org?.name || "CertiVerify Enterprise"}</div>
              <div className="text-[10px] font-mono text-[#8d90a0] mt-0.5">ID: {org?.id || "default-org"}</div>
              <div className="text-[10px] font-mono text-[#4edea3] mt-1 inline-block uppercase font-bold">
                STATUS: {org?.status || "ACTIVE"}
              </div>
            </div>
            <Link
              href="/dashboard/organization"
              onClick={() => setShowOrgDropdown(false)}
              className="block w-full text-center text-xs text-[#2563eb] hover:text-[#b4c5ff] font-medium py-1.5 bg-[#000f21] hover:bg-[#102034] rounded-[4px] border border-[#1b2b3f] transition-colors"
            >
              Manage Organization & Members
            </Link>
          </div>
        )}
      </div>

      {/* Center: Command / Search Bar (Desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-2">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d90a0] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search certificates, jobs, hashes..."
            className="w-full bg-[#0b1c30] border border-[#1b2b3f] rounded-[4px] pl-9 pr-8 py-1.5 text-xs text-[#d3e4fe] placeholder:text-[#8d90a0] focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: System Status, Notifications & Action */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#0b1c30] border border-[#1b2b3f] rounded-[2px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="font-mono text-[10px] text-[#4edea3] font-semibold tracking-wider uppercase">
            ONLINE
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications & Alerts"
            aria-label="View notifications"
            className="p-2 text-[#8d90a0] hover:text-[#d3e4fe] hover:bg-[#102034] rounded-[4px] border border-transparent hover:border-[#1b2b3f] transition-colors relative"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563eb] rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563eb] rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-[#0b1c30] border border-[#1b2b3f] rounded-[6px] shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1b2b3f] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#d3e4fe]">System Notifications</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#8d90a0] hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                {sampleAlerts.map((alert) => (
                  <div key={alert.id} className="p-2.5 bg-[#000f21] rounded border border-[#1b2b3f] text-xs">
                    <div className="flex items-center justify-between text-[#d3e4fe] font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        {alert.type === "success" ? (
                          <CheckCircle2 size={13} className="text-[#4edea3]" />
                        ) : (
                          <Info size={13} className="text-[#38bdf8]" />
                        )}
                        {alert.title}
                      </span>
                      <span className="font-mono text-[9px] text-[#8d90a0]">{alert.time}</span>
                    </div>
                    <p className="text-[11px] text-[#8d90a0] leading-snug">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Upload Action */}
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-[4px] shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          <Upload size={13} />
          <span className="hidden sm:inline">Upload Certificate</span>
          <span className="sm:hidden">+</span>
        </Link>
      </div>
    </header>
  );
};
