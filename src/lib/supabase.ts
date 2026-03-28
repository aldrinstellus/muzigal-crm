import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _instance: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_instance) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    _instance = createClient(url, key);
  }
  return _instance;
}

// Tables are prefixed with muzigal_ in the public schema
const TABLE_MAP: Record<string, string> = {
  access_requests: "muzigal_access_requests",
  access_log: "muzigal_access_log",
};

export function db(table: string) {
  const actual = TABLE_MAP[table] || table;
  return getClient().from(actual);
}
