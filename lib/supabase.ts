import { createClient } from "@supabase/supabase-js";

// Server-side client dengan service role (bypass RLS — hanya gunakan di API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
