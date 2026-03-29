"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockSimple, Eye, EyeSlash } from "@phosphor-icons/react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const { token } = await res.json();
      sessionStorage.setItem("admin_token", token);
      router.push("/admin");
    } else {
      setError("Invalid password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Colored top bar */}
          <div className="h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary-dark)]" />

          <div className="p-8">
            <div className="text-center mb-6">
              {/* Kid-friendly illustration: a key character */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                  <LockSimple size={36} weight="duotone" color="#ffffff" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-secondary)] rounded-full" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[var(--color-accent)] rounded-full" />
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Admin Login</h1>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1">Enter password to manage activities</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-text)]/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-primary)]/20"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
