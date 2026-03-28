import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { generatePassword, hashPassword, logAccess } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ua = request.headers.get("user-agent") || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Rate limit: 1 pending/approved request per email per 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await db("access_requests")
      .select("id")
      .eq("email", email.toLowerCase())
      .in("status", ["pending", "approved"])
      .gte("requested_at", tenMinAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: "A request is already pending for this email. Please wait." },
        { status: 429 }
      );
    }

    // Generate password now, store hash, keep plaintext for admin to see
    const plainPassword = generatePassword(12);
    const hashed = await hashPassword(plainPassword);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { data: req, error: insertErr } = await db("access_requests")
      .insert({
        email: email.toLowerCase(),
        status: "pending",
        password_hash: hashed,
        password_plain: plainPassword,
        expires_at: expiresAt,
        ip_address: ip,
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }

    await logAccess({
      request_id: req.id,
      email: email.toLowerCase(),
      action: "request_created",
      ip_address: ip,
      user_agent: ua,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Request access error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
