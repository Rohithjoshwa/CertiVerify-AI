"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cpu,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  ExternalLink,
  Play,
  RotateCcw,
  FileText,
  FileQuestion,
} from "lucide-react";
import {
  certificateApi,
  jobsApi,
  getAccessToken,
  CertificateResponse,
  VerificationJobResponse,
} from "@/lib/api";

export default function VerificationJobsPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [jobs, setJobs] = useState<Record<string, VerificationJobResponse | null>>({});
  const [loading, setLoading] = useState(true);
  const [actionJobId, setActionJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      const { data: certs } = await certificateApi.list();
      setCertificates(certs);

      // Fetch latest job status for each certificate
      const jobMap: Record<string, VerificationJobResponse | null> = {};
      await Promise.allSettled(
        certs.map(async (c) => {
          try {
            const { data } = await jobsApi.getLatestJobForCertificate(c.id);
            jobMap[c.id] = data;
          } catch {
            jobMap[c.id] = null;
          }
        })
      );
      setJobs(jobMap);
    } catch {
      // ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStartJob = async (certId: string) => {
    setActionJobId(certId);
    try {
      await jobsApi.startVerificationJob(certId);
      await fetchJobs();
    } catch (err) {
      alert("Failed to start async verification job.");
    } finally {
      setActionJobId(null);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setActionJobId(jobId);
    try {
      await jobsApi.retryJob(jobId);
      await fetchJobs();
    } catch (err) {
      alert("Failed to retry verification job.");
    } finally {
      setActionJobId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1c30] border border-[#1b2b3f] p-5 rounded-[8px]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8d90a0] mb-1">
            <Link href="/dashboard" className="hover:text-[#d3e4fe]">Dashboard</Link>
            <span>/</span>
            <span className="text-[#38bdf8]">Verification Jobs</span>
          </div>
          <h1 className="text-xl font-bold text-[#d3e4fe] font-sans flex items-center gap-2">
            <Cpu size={22} className="text-[#38bdf8]" />
            Async Verification Job Execution Queue
          </h1>
          <p className="text-xs text-[#8d90a0]">
            Monitor multi-stage asynchronous verification pipelines across ingested credentials.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="p-2 bg-[#000f21] hover:bg-[#102034] text-[#8d90a0] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded shrink-0"
          title="Refresh jobs status"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Main Jobs Table */}
      <div className="bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 size={24} className="animate-spin text-[#38bdf8] mx-auto" />
            <p className="text-xs font-mono text-[#8d90a0]">Querying job queue statuses...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileQuestion size={36} className="text-[#8d90a0] mx-auto opacity-50" />
            <p className="text-xs text-[#8d90a0]">No certificates or verification jobs in queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#000f21] text-[#8d90a0] border-b border-[#1b2b3f] font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Certificate / Job ID</th>
                  <th className="px-4 py-3">Job Status</th>
                  <th className="px-4 py-3">Current Stage</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Created / Completed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2b3f]">
                {certificates.map((cert) => {
                  const job = jobs[cert.id];
                  const status = job?.status || "NOT_STARTED";
                  const isProcessing = status === "PROCESSING" || status === "QUEUED";
                  const isActioning = Boolean(actionJobId === cert.id || (job?.id && actionJobId === job.id));

                  return (
                    <tr key={cert.id} className="hover:bg-[#102034]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#d3e4fe] truncate max-w-xs">{cert.original_filename}</div>
                        <div className="font-mono text-[10px] text-[#8d90a0]">
                          Job: {job?.job_id || job?.id || "None"}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          status === "COMPLETED"
                            ? "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30"
                            : status === "PROCESSING"
                            ? "bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 animate-pulse"
                            : status === "FAILED"
                            ? "bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30"
                            : "bg-[#102034] text-[#8d90a0]"
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-[#38bdf8]">
                        {job?.current_stage || "Ready"}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="h-1.5 flex-1 bg-[#000f21] rounded-full overflow-hidden border border-[#1b2b3f]">
                            <div
                              style={{ width: `${job?.progress_percentage ?? 0}%` }}
                              className="bg-[#38bdf8] h-full"
                            />
                          </div>
                          <span className="text-[#8d90a0]">{job?.progress_percentage ?? 0}%</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[10px] text-[#8d90a0] whitespace-nowrap">
                        {job?.created_at ? new Date(job.created_at).toLocaleString() : "Not triggered"}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {!job || status === "NOT_STARTED" ? (
                            <button
                              onClick={() => handleStartJob(cert.id)}
                              disabled={isActioning}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#2563eb] text-white rounded hover:bg-blue-600 inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              {isActioning ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                              <span>Start Job</span>
                            </button>
                          ) : status === "FAILED" ? (
                            <button
                              onClick={() => handleRetryJob(job.id)}
                              disabled={isActioning}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#ffb95f]/20 text-[#ffb95f] border border-[#ffb95f]/30 rounded hover:bg-[#ffb95f]/30 inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              {isActioning ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                              <span>Retry</span>
                            </button>
                          ) : null}

                          <Link
                            href={`/dashboard/certificates/${cert.id}`}
                            className="p-1 text-[#38bdf8] hover:bg-[#102034] rounded"
                            title="Open Cockpit"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
