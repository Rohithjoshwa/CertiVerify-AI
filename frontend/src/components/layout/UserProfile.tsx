"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield } from "lucide-react";
import { authApi, clearTokens, getAccessToken, UserResponse } from "@/lib/api";

export const UserProfile: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    if (!getAccessToken()) return;
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      clearTokens();
      router.push("/login");
    }
  };

  const displayName = user?.full_name || "Enterprise User";
  const displayRole = (user?.role || "STUDENT").toUpperCase();
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-t border-[#1b2b3f] p-4 bg-[#000f21]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[4px] bg-[#102034] border border-[#1b2b3f] flex items-center justify-center text-xs font-mono font-bold text-[#b4c5ff] shrink-0">
            {initials || <User size={14} />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#d3e4fe] truncate leading-tight font-sans">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-[#4edea3] uppercase tracking-wider font-semibold">
                {displayRole}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out of CertiVerify"
          className="p-1.5 text-[#8d90a0] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 rounded-[4px] border border-transparent hover:border-[#ffb4ab]/30 transition-colors shrink-0"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};
