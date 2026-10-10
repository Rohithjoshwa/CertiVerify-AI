"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  UploadCloud,
  Cpu,
  Search,
  FileText,
  History,
  Building2,
  Key,
  Webhook,
  ScrollText,
  Settings,
  X,
  LucideIcon,
  ChevronRight,
} from "lucide-react";
import { UserProfile } from "./UserProfile";
import { Logo } from "@/components/ui/Logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "brand" | "success" | "neutral";
}

const SIDEBAR_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "OVERVIEW & INGESTION",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Upload Certificate", href: "/dashboard/upload", icon: UploadCloud, badge: "+ New", badgeVariant: "brand" },
      { label: "Certificates", href: "/dashboard/certificates", icon: ShieldCheck },
    ],
  },
  {
    title: "PIPELINE & FORENSICS",
    items: [
      { label: "Verification Jobs", href: "/dashboard/jobs", icon: Cpu },
      { label: "Evidence Explorer", href: "/dashboard/evidence", icon: Search, badge: "AI Provenance", badgeVariant: "success" },
      { label: "Reports", href: "/dashboard/reports", icon: FileText },
      { label: "Verification History", href: "/dashboard/history", icon: History },
    ],
  },
  {
    title: "ENTERPRISE & ADMIN",
    items: [
      { label: "Organizations & Members", href: "/dashboard/organization", icon: Building2 },
      { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ScrollText },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <Suspense fallback={<SidebarShell isOpen={isOpen} onClose={onClose} />}>
      <SidebarContent isOpen={isOpen} onClose={onClose} pathname={pathname} />
    </Suspense>
  );
};

interface SidebarContentProps {
  isOpen: boolean;
  onClose: () => void;
  pathname?: string;
}

function SidebarShell({ isOpen, onClose }: SidebarContentProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[288px] bg-[#000f21] border-r border-[#1b2b3f] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="h-[64px] px-4 flex items-center justify-between border-b border-[#1b2b3f] shrink-0">
          <div className="w-[120px] h-[28px] bg-[#102034] rounded-[4px] animate-pulse" />
          <button onClick={onClose} className="lg:hidden p-1.5 text-[#8d90a0] rounded">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          <div className="h-4 w-24 bg-[#102034] rounded animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-[#102034] rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="h-[64px] px-3 flex items-center border-t border-[#1b2b3f] shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#102034] animate-pulse" />
        </div>
      </aside>
    </>
  );
}

function SidebarContent({ isOpen, onClose, pathname = "" }: SidebarContentProps) {
  const isLinkActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[288px] bg-[#000f21] border-r border-[#1b2b3f] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Branding Header */}
        <div className="h-[64px] px-4 flex items-center justify-between border-b border-[#1b2b3f] shrink-0">
          <Logo size="sm" isDark={true} href="/dashboard" onClick={onClose} ariaLabel="CertiVerify Home" />

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] bg-[#102034] text-[#b4c5ff] border border-[#1b2b3f] px-1.5 py-0.5 rounded-[2px] font-bold uppercase tracking-wider hidden sm:inline-block">
              ENTERPRISE v2
            </span>

            {/* Mobile close trigger */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#8d90a0] hover:text-[#d3e4fe] rounded-[4px]"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-1.5 text-[9px] font-mono uppercase tracking-widest text-[#8d90a0] font-bold">
                {section.title}
              </div>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[4px] transition-all duration-150 group ${
                        active
                          ? "bg-[#102034] text-[#d3e4fe] border-l-2 border-[#2563eb] font-semibold shadow-sm"
                          : "text-[#c3c6d7] hover:text-[#d3e4fe] hover:bg-[#0b1c30]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          className={active ? "text-[#38bdf8]" : "text-[#8d90a0] group-hover:text-[#d3e4fe]"}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold tracking-wider uppercase ${
                            item.badgeVariant === "brand"
                              ? "bg-[#2563eb] text-white shadow-xs"
                              : item.badgeVariant === "success"
                              ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                              : "bg-[#102034] text-[#8d90a0] border border-[#1b2b3f]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight size={13} className="text-[#38bdf8]" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Engine Telemetry Footer Card */}
          <div className="mx-1 p-3 bg-[#0b1c30] border border-[#1b2b3f] rounded-[6px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#8d90a0] font-semibold">
                VERIFICATION PIPELINE
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[9px] text-[#4edea3] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                HEALTHY
              </span>
            </div>
            <p className="text-[10px] text-[#8d90a0] leading-snug">
              OCR, Tamper ELA, Blockchain & AI Provenance operational.
            </p>
          </div>
        </div>

        {/* User Profile Footer */}
        <UserProfile />
      </aside>
    </>
  );
}
