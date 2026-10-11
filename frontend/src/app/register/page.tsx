"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { AxiosError } from "axios";
import { CertiVerifyLogo } from "@/components/ui/CertiVerifyLogo";

// Extract the most useful message from a FastAPI/Pydantic error response.
// FastAPI returns detail as either a string (app error) or an array of
// Pydantic validation objects like: [{ loc, msg, type }]
function extractErrorMessage(detail: unknown): string {
  if (!detail) return "Registration failed. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    // Pydantic v2 validation errors — pick the first one and clean the prefix
    const first = detail[0] as { msg?: string; loc?: string[] };
    const raw = first?.msg || "Validation error";
    // Pydantic v2 prefixes "Value error, " — strip it for cleaner UX
    return raw.replace(/^Value error,\s*/i, "");
  }
  return "Registration failed. Please try again.";
}

// Client-side password check mirrors the backend Pydantic validator exactly
function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter (e.g. A–Z).";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number (0–9).";
  return null; // valid
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Run client-side validation first so the user gets instant, clear feedback
    const pwError = validatePassword(form.password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);
    try {
      await authApi.register(form);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const axErr = err as AxiosError<{ detail?: unknown }>;
      setError(extractErrorMessage(axErr.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-8">
      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 w-full max-w-md space-y-4">
        <div className="flex justify-center pb-2">
          <CertiVerifyLogo variant="full" size="md" />
        </div>
        <h1 className="text-xl font-bold text-white mb-1 text-center">Create your account</h1>
        <p className="text-xs text-gray-400 mb-4 text-center">Verify certificates in minutes with AI.</p>

        {error && (
          <div className="bg-fake/10 border border-fake/30 text-fake text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm text-gray-300">Full Name</label>
          <input
            required
            minLength={2}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="mt-1 w-full rounded-lg bg-surface-panel border border-surface-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

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
          <label className="text-sm text-gray-300">Password</label>
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg bg-surface-panel border border-surface-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {/* Live inline hint that turns green when password is valid */}
          <ul className="text-xs mt-1 space-y-0.5">
            <li className={form.password.length >= 8 ? "text-genuine" : "text-gray-500"}>
              {form.password.length >= 8 ? "✓" : "·"} At least 8 characters
            </li>
            <li className={/[A-Z]/.test(form.password) ? "text-genuine" : "text-gray-500"}>
              {/[A-Z]/.test(form.password) ? "✓" : "·"} One uppercase letter (A–Z)
            </li>
            <li className={/[0-9]/.test(form.password) ? "text-genuine" : "text-gray-500"}>
              {/[0-9]/.test(form.password) ? "✓" : "·"} One number (0–9)
            </li>
          </ul>
        </div>

        <div>
          <label className="text-sm text-gray-300">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 w-full rounded-lg bg-surface-panel border border-surface-border px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="student">Student</option>
            <option value="employer">Employer</option>
            <option value="university">University</option>
          </select>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 transition"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-500 hover:underline">Log in</Link>
        </p>
      </form>
    </main>
  );
}
