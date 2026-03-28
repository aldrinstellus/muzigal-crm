import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { logAccess } from "@/lib/auth";

export async function GET() {
  const { data: requests } = await db("access_requests")
    .select("*")
    .order("requested_at", { ascending: false })
    .limit(100);

  const { data: logs } = await db("access_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return NextResponse.json({ requests: requests || [], logs: logs || [] });
}

export async function PATCH(request: Request) {
  try {
    const { id, action } = await request.json();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (!id || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await db("access_requests")
      .select("*")
      .eq("id", id)
      .eq("status", "pending")
      .single();
    const req = data as any;

    if (!req) {
      return NextResponse.json({ error: "Not found or already processed" }, { status: 404 });
    }

    if (action === "deny") {
      await db("access_requests")
        .update({ status: "denied", denied_at: new Date().toISOString() })
        .eq("id", id);

      await logAccess({
        request_id: id,
        email: req.email,
        action: "denied",
        ip_address: ip,
      });

      return NextResponse.json({ ok: true });
    }

    // Approve — reset expiry to 30 min from NOW
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await db("access_requests")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .eq("id", id);

    await logAccess({
      request_id: id,
      email: req.email,
      action: "approved",
      ip_address: ip,
      metadata: { expires_at: expiresAt },
    });

    return NextResponse.json({ ok: true, password: req.password_plain });
  } catch (err) {
    console.error("Admin action error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
