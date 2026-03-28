"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"request" | "login" | "admin">(
    searchParams.get("mode") === "login" ? "login" : "request"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("mode") === "login") setMode("login");
  }, [searchParams]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/access/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess("Request submitted. You'll receive a password once approved.");
    } else {
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/access/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
      setLoading(false);
    }
  }

  async function handleAdmin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Muzigal</h1>
            <p className="text-sm text-gray-400">Documentation Portal</p>
          </div>

          {/* Request Access */}
          {mode === "request" && (
            <>
              {success ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    &#10003;
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{success}</p>
                  <p className="text-xs text-gray-400 mb-6">
                    The admin will send you a one-time password.
                  </p>
                  <button
                    onClick={() => { setMode("login"); setSuccess(""); }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    I have a password &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequest} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
                      autoFocus
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1a1a2e] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Request Access"}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    A request will be sent to the admin for approval.
                  </p>
                </form>
              )}
            </>
          )}

          {/* Login with Password */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="login-pw" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="login-pw"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="12-character password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
                  autoComplete="off"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a2e] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Access Docs"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                One-time use. Expires 30 min after approval.
              </p>
            </form>
          )}

          {/* Admin Login */}
          {mode === "admin" && (
            <form onSubmit={handleAdmin} className="space-y-4">
              <div>
                <label htmlFor="admin-pw" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Admin Password
                </label>
                <input
                  id="admin-pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent"
                  autoFocus
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a2e] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#16213e] transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Admin Login"}
              </button>
            </form>
          )}

          {/* Mode switcher */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-2">
            {mode !== "request" && (
              <button onClick={() => { setMode("request"); setError(""); setSuccess(""); }} className="text-xs text-blue-600 hover:text-blue-800">
                Request access
              </button>
            )}
            {mode !== "login" && (
              <button onClick={() => { setMode("login"); setError(""); }} className="text-xs text-blue-600 hover:text-blue-800">
                I have a password
              </button>
            )}
            {mode !== "admin" && (
              <button onClick={() => { setMode("admin"); setError(""); }} className="text-xs text-gray-400 hover:text-gray-600">
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
