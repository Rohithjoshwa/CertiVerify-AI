"use client";
import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { CertiVerifyLogo } from "@/components/ui/CertiVerifyLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
    } finally {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 w-full max-w-md space-y-4">
        <div className="flex justify-center pb-2">
          <CertiVerifyLogo variant="full" size="md" isDark={true} />
        </div>
        <h1 className="text-xl font-bold text-white mb-1 text-center">Reset your password</h1>
        <p className="text-xs text-gray-400 mb-4 text-center">Enter your account email and we&apos;ll send a reset link.</p>

        {sent ? (
          <div className="bg-genuine/10 border border-genuine/30 text-genuine text-sm rounded-lg px-3 py-2">
            If an account exists for that email, a reset link has been sent.
          </div>
        ) : (
          <>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg bg-surface-panel border border-surface-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 transition"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}

        <p className="text-sm text-gray-400 text-center">
          <Link href="/login" className="text-brand-500 hover:underline">Back to login</Link>
        </p>
      </form>
    </main>
  );
}
