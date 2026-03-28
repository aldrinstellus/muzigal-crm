import { hash, compare } from "bcryptjs";
import { db } from "./supabase";

const HMAC_SECRET = process.env.HMAC_SECRET!;

// --- Password generation ---

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword(length = 12): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => CHARSET[byte % CHARSET.length]).join("");
}

// --- Bcrypt ---

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed);
}

// --- HMAC session tokens (Edge-compatible) ---

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(HMAC_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  email: string,
  role: "visitor" | "admin"
): Promise<string> {
  const payload = JSON.stringify({
    email,
    role,
    iat: Date.now(),
    sid: crypto.randomUUID(),
  });
  const key = await getHmacKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${btoa(payload)}.${sigHex}`;
}

export async function verifySessionToken(
  token: string,
  maxAgeMs: number
): Promise<{ email: string; role: string; iat: number } | null> {
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

    return { email: payload.email, role: payload.role, iat: payload.iat };
  } catch {
    return null;
  }
}

// --- Logging ---

export async function logAccess(params: {
  request_id?: string;
  email?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}) {
  await db("access_log").insert({
    request_id: params.request_id || null,
    email: params.email || null,
    action: params.action,
    ip_address: params.ip_address || null,
    user_agent: params.user_agent || null,
    metadata: params.metadata || {},
  });
}
