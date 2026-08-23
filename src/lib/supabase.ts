import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente de leitura pública (RLS: qualquer um pode SELECT na tabela imoveis).
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Cliente admin (service role) — só usado na rota de ingestão, nunca exposto ao
// cliente. Ignora RLS, então só deve escrever na tabela imoveis (dados públicos).
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
