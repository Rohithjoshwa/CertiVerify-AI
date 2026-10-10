"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi, setTokens } from "@/lib/api";
import { AxiosError } from "axios";
import { CertiVerifyLogo } from "@/components/ui/CertiVerifyLogo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Show a success banner when redirected from registration (dev mode — no OTP needed)
  const justRegistered = params.get("registered") === "1";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      setTokens(data.access_token, data.refresh_token);
      router.push("/dashboard/upload");
    } catch (err) {
      const axErr = err as AxiosError<{ detail?: string }>;
      setError(axErr.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 w-full max-w-md space-y-4">
      <div className="flex justify-center pb-2">
        <CertiVerifyLogo variant="full" size="md" />
      </div>
      <h1 className="text-xl font-bold text-white mb-1 text-center">Welcome back</h1>
      <p className="text-xs text-gray-400 mb-4 text-center">Log in to verify certificates.</p>

      {justRegistered && (
        <div className="bg-genuine/10 border border-genuine/30 text-genuine text-sm rounded-lg px-3 py-2">
          ✅ Account created successfully! Log in below.
        </div>
      )}

      {error && <div className="bg-fake/10 border border-fake/30 text-fake text-sm rounded-lg px-3 py-2">{error}</div>}

      <div>
        <label className="text-sm text-gray-300">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full rounded-lg bg-surface-panel border border-surface-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <div className="flex justify-between">
          <label className="text-sm text-gray-300">Password</label>
          <Link href="/forgot-password" className="text-xs text-brand-500 hover:underline">Forgot password?</Link>
        </div>
        <input
          required
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 w-full rounded-lg bg-surface-panel border border-surface-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <button
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 transition"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p className="text-sm text-gray-400 text-center">
        Don&apos;t have an account? <Link href="/register" className="text-brand-500 hover:underline">Sign up</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
