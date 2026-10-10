"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { CertiVerifyLogo } from "@/components/ui/CertiVerifyLogo";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, code });
      router.push("/login?verified=1");
    } catch (err) {
      const axErr = err as AxiosError<{ detail?: string }>;
      setError(axErr.response?.data?.detail || "Verification failed. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      await authApi.resendOtp({ email });
      setInfo("A new code has been sent to your email.");
    } catch {
      setError("Could not resend code. Please try again shortly.");
    }
  }

  return (
    <form onSubmit={handleVerify} className="glass-panel rounded-2xl p-8 w-full max-w-md space-y-4">
      <div className="flex justify-center pb-2">
        <CertiVerifyLogo variant="full" size="md" isDark={true} />
      </div>
      <h1 className="text-xl font-bold text-white mb-1 text-center">Verify your email</h1>
      <p className="text-xs text-gray-400 mb-4 text-center">
        We sent a 6-digit code to <span className="text-white">{email || "your email"}</span>.
      </p>

      {error && <div className="bg-fake/10 border border-fake/30 text-fake text-sm rounded-lg px-3 py-2">{error}</div>}
      {info && <div className="bg-genuine/10 border border-genuine/30 text-genuine text-sm rounded-lg px-3 py-2">{info}</div>}

      <input
        required
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
        className="w-full text-center tracking-[0.5em] text-xl rounded-lg bg-surface-panel border border-surface-border px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      <button
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 transition inline-flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Verifying..." : "Verify Email"}
      </button>

      <button type="button" onClick={handleResend} className="w-full text-sm text-brand-500 hover:underline">
        Resend code
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
