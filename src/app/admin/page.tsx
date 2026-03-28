"use client";

import { useEffect, useState, useCallback } from "react";

interface AccessRequest {
  id: string;
  email: string;
  status: string;
  password_plain: string | null;
  requested_at: string;
  approved_at: string | null;
  used_at: string | null;
  expires_at: string | null;
  ip_address: string | null;
}

interface LogEntry {
  id: string;
  email: string | null;
  action: string;
  ip_address: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  used: "bg-green-50 text-green-700 border-green-200",
  denied: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function AdminPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tab, setTab] = useState<"requests" | "logs">("requests");
  const [acting, setActing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [approvedPasswords, setApprovedPasswords] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    const res = await fetch("/api/admin/requests");
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests);
      setLogs(data.logs);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  async function handleAction(id: string, action: "approve" | "deny") {
    setActing(id);
    const res = await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok && action === "approve") {
      const data = await res.json();
      if (data.password) {
        setApprovedPasswords((prev) => ({ ...prev, [id]: data.password }));
      }
    }
    await loadData();
    setActing(null);
  }

  function copyPassword(id: string, pw: string) {
    navigator.clipboard.writeText(pw);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function fmtTime(ts: string | null) {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getPassword(r: AccessRequest) {
    return approvedPasswords[r.id] || r.password_plain;
  }

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {["pending", "approved", "used", "denied", "expired"].map((s) => (
          <div
            key={s}
            className="bg-white rounded-lg border border-gray-200 p-4 text-center"
          >
            <p className="text-2xl font-bold text-[#1a1a2e]">
              {requests.filter((r) => r.status === s).length}
            </p>
            <p className="text-xs text-gray-400 capitalize">{s}</p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800">
            {pending.length} pending request{pending.length > 1 ? "s" : ""} — approve and send the password to them
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "requests" ? "bg-white text-[#1a1a2e] shadow-sm" : "text-gray-500"
          }`}
        >
          Requests
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "logs" ? "bg-white text-[#1a1a2e] shadow-sm" : "text-gray-500"
          }`}
        >
          Audit Log
        </button>
      </div>

      {/* Requests */}
      {tab === "requests" && (
        <div className="space-y-3">
          {requests.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
              No requests yet
            </div>
          )}
          {requests.map((r) => {
            const pw = getPassword(r);
            return (
              <div
                key={r.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        STATUS_COLORS[r.status] || ""
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="font-medium text-gray-900">{r.email}</span>
                    <span className="text-xs text-gray-400">
                      {fmtTime(r.requested_at)}
                    </span>
                    <span className="text-xs text-gray-300 font-mono">
                      {r.ip_address}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, "approve")}
                          disabled={acting === r.id}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {acting === r.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(r.id, "deny")}
                          disabled={acting === r.id}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          Deny
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Show password for approved/pending requests */}
                {pw && (r.status === "approved" || r.status === "pending" || approvedPasswords[r.id]) && (
                  <div className="mt-3 flex items-center gap-3 bg-gray-50 rounded-md p-3">
                    <span className="text-xs text-gray-500">Password:</span>
                    <code className="text-sm font-mono font-bold tracking-widest text-[#1a1a2e]">
                      {pw}
                    </code>
                    <button
                      onClick={() => copyPassword(r.id, pw)}
                      className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                    >
                      {copied === r.id ? "Copied!" : "Copy"}
                    </button>
                    {r.status === "approved" && r.expires_at && (
                      <span className="text-xs text-red-500 ml-auto">
                        Expires {fmtTime(r.expires_at)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Logs */}
      {tab === "logs" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtTime(l.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{l.email || "—"}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                      {l.action}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.ip_address || "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No logs yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
