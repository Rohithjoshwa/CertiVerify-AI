"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { certificateApi, getAccessToken } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function activateCockpit() {
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }

      // 1. Check if a certificate is already selected in session
      const storedId = localStorage.getItem("cv_current_certificate_id");
      if (storedId) {
        router.replace(`/dashboard/certificates/${storedId}`);
        return;
      }

      // 2. Fetch the most recent certificate from the registry ledger
      try {
        const { data: certs } = await certificateApi.list();
        if (certs && certs.length > 0) {
          const targetId = certs[0].id;
          localStorage.setItem("cv_current_certificate_id", targetId);
          router.replace(`/dashboard/certificates/${targetId}`);
          return;
        }
      } catch (err) {
        console.error("Failed to query certificate registry:", err);
      }

      // 3. Fallback to ingestion upload page
      router.replace("/dashboard/upload");
    }

    activateCockpit();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#000f21] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#38bdf8]" />
        <span className="text-xs font-mono text-[#8d90a0]">Opening Certificate Verification Cockpit...</span>
      </div>
    </div>
  );
}
