import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HMAC_SECRET = process.env.HMAC_SECRET!;

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

async function verifySession(
  token: string,
  maxAgeMs: number
): Promise<{ email: string; role: string } | null> {
  try {
    const [b64, sigHex] = token.split(".");
    if (!b64 || !sigHex) return null;

    const data = atob(b64);
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const sigBytes = new Uint8Array(
      sigHex.match(/.{2}/g)!.map((h) => parseInt(h, 16))
    );

    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
    if (!valid) return null;

    const payload = JSON.parse(data);
    if (Date.now() - payload.iat > maxAgeMs) return null;

    return { email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/access") ||
    pathname === "/api/logout" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get("muzigal_auth");
  if (!authCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin gets 24h, visitors get 30min
  const adminMaxAge = 24 * 60 * 60 * 1000;
  const visitorMaxAge = 30 * 60 * 1000;

  // Try admin first (longer TTL)
  let session = await verifySession(authCookie.value, adminMaxAge);

  if (session && session.role !== "admin") {
    // Re-verify with visitor TTL
    session = await verifySession(authCookie.value, visitorMaxAge);
  }

  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("muzigal_auth");
    return response;
  }

  // Admin routes require admin role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
