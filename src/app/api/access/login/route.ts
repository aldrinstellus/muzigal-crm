import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/supabase";
import { verifyPassword, createSessionToken, logAccess } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ua = request.headers.get("user-agent") || "";
    const emailLower = (email || "").toLowerCase();

    if (!emailLower || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Find approved request for this email
    const { data } = await db("access_requests")
      .select("*")
      .eq("email", emailLower)
      .eq("status", "approved")
      .order("approved_at", { ascending: false })
      .limit(1)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = data as any;

    if (!req) {
      await logAccess({
        email: emailLower,
        action: "login_failed_no_request",
        ip_address: ip,
        user_agent: ua,
      });
      return NextResponse.json(
        { error: "No approved access found. Your request may still be pending." },
        { status: 401 }
      );
    }

    // Check expiry
    if (new Date(req.expires_at) < new Date()) {
      await logAccess({
        request_id: req.id,
        email: emailLower,
        action: "login_failed_expired",
        ip_address: ip,
        user_agent: ua,
      });
      return NextResponse.json(
        { error: "Password expired. Please request access again." },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, req.password_hash);
    if (!valid) {
      await logAccess({
        request_id: req.id,
        email: emailLower,
        action: "login_failed_wrong_password",
        ip_address: ip,
        user_agent: ua,
      });
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Mark as used
    await db("access_requests")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", req.id);

    // Create session
    const sessionToken = await createSessionToken(emailLower, "visitor");
    const cookieStore = await cookies();
    cookieStore.set("muzigal_auth", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 60,
      path: "/",
    });

    await logAccess({
      request_id: req.id,
      email: emailLower,
      action: "login_success",
      ip_address: ip,
      user_agent: ua,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
