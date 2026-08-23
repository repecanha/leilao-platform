import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Nominatim (OpenStreetMap) — gratuito, sem chave, mas com política de uso estrita:
// no máximo 1 requisição por segundo e um User-Agent identificável.
// https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "RadarLeiloes/1.0 (uso educacional, contato@radarleiloes.com.br)";

export const NOMINATIM_DELAY_MS = 1100;

export async function geocodeEndereco(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (!isFinite(lat) || !isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Preenche lat/lng de imóveis pendentes (lat is null), respeitando o limite de taxa
// do Nominatim. Reaproveitado pela rota de ingestão (ao final de cada run) e pela
// rota de backfill dedicada (/api/cron/geocode).
export async function preencherCoordenadasPendentes(admin: SupabaseClient, limit: number) {
  const { data: pendentes, error } = await admin
    .from("imoveis")
    .select("id, endereco, cidade, estado")
    .is("lat", null)
    .limit(limit);

  if (error) throw error;
  if (!pendentes || pendentes.length === 0) {
    return { processados: 0, geocodificados: 0, falhas: 0 };
  }

  let geocodificados = 0;
  let falhas = 0;

  for (const row of pendentes) {
    let coords = await geocodeEndereco(`${row.endereco}, ${row.cidade}, ${row.estado}, Brasil`);
    await sleep(NOMINATIM_DELAY_MS);

    if (!coords) {
      coords = await geocodeEndereco(`${row.cidade}, ${row.estado}, Brasil`);
      await sleep(NOMINATIM_DELAY_MS);
    }

    if (coords) {
      await admin.from("imoveis").update({ lat: coords.lat, lng: coords.lng }).eq("id", row.id);
      geocodificados++;
    } else {
      falhas++;
    }
  }

  return { processados: pendentes.length, geocodificados, falhas };
}
